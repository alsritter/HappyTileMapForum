import axios from 'axios'
import { Loading, Message } from 'element-ui'
import Vue from 'vue'
import qs from 'qs' // 用来发送表单请求

const baseURL = 'http://localhost:19999/'
let loadingInstance //loading 实例
let needLoadingRequestCount = 0 //当前正在请求的数量
//是否有请求正在刷新token
let isRefreshing = false
// 重试请求队列 每一项都是一个待执行待函数
let requests = []

//Loading 封装
/*
 * 打开全页loading
 * this.$showLoading()
 * */
Vue.prototype.$showLoading = function(text = '加载中...') {
  if (needLoadingRequestCount == 0) {
    loadingInstance = Loading.service({ text: text })
  }
  needLoadingRequestCount++
}
/*
 * 关闭全页loading
 * this.$closeLoading()
 * */
Vue.prototype.$closeLoading = function(type = 0) {
  needLoadingRequestCount--
  if (type == 1) {
    loadingInstance.close()
    return false
  }
  if (needLoadingRequestCount <= 0) {
    loadingInstance.close()
  }
}

export { baseURL }
export function request(options) {
  return new Promise((resolve, reject) => {
    // 创建axios实例
    const instance = axios.create({
      baseURL,
      timeout: 5000,
      // 带上cookies
      withCredentials: true // 带 cookies 必须要 cors 跨域
    })

    // 请求拦截,在 headers 上加上 token
    instance.interceptors.request.use(
      (config) => {
        Vue.prototype.$showLoading()
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = token
        }
        return config
      },
      (err) => {
        Vue.prototype.$closeLoading()
        // 请求错误时
        console.error('请求失败', err)
        return Promise.reject(error) // 在调用的那边可以拿到(catch)你想返回的错误信息
      }
    )

    // 响应拦截
    instance.interceptors.response.use(
      (response) => {
        Vue.prototype.$closeLoading()
        if (response.data) {
          if (response.data.code != 200) {
            // 无权限
            if (response.data.code == 45006) {
              const config = response.config
              if (!isRefreshing) {
                //没有则请求刷新 token
                isRefreshing = true
                return refreshToken(response, instance)
              } else {
                // 正在刷新 token，加入队列中，将返回一个未执行 resolve 的 promise
                return new Promise((resolve) => {
                  // 将 resolve 放进队列，用一个函数形式来保存，等 token 刷新后直接执行
                  requests.push((token) => {
                    config.headers.Authorization = token
                    resolve(instance(config))
                  })
                })
              }
            }
          }
        }
        // 必须返回
        let data
        if (response.data == undefined) {
          data = JSON.parse(response.request.responseText)
        } else {
          data = response.data
        }
        return data
      },
      (err) => {
        Vue.prototype.$closeLoading()
        // 无权限
        if (err.response.data.code == 45006) {
          const config = err.response.config
          if (!isRefreshing) {
            //没有则请求刷新 token
            isRefreshing = true
            return refreshToken(err.response, instance)
          } else {
            return new Promise((resolve) => {
              requests.push((token) => {
                console.log(token);
                config.headers.Authorization = token
                resolve(instance(config))
              })
            })
          }
        }

        return Promise.reject(error)
      }
    )

    // // 发送网络请求，返回一个 promise
    // return instance(config)
    // 请求处理
    instance(options)
      .then((res) => {
        resolve(res)
        return false
      })
      .catch((error) => {
        reject(error)
      })
  })
}

/**
 * 刷新token
 */
function refreshToken(response, instance) {
  const refresh_token = localStorage.getItem('refresh_token')
  // 判断 没有refresh_token的处理
  if (!refresh_token) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('sso_token')
    localStorage.removeItem('expires_in')
    localStorage.removeItem('refresh_token')
    // window.location.href = window.g.mainSiteUrl //返回登陆
  }
  // instance是当前已创建的axios实例
  return instance
    .get(
      'forum/auth/refresh_token',
      {
        params: {
          //请求参数
          refresh_token
        }
      }
    )
    .then((res) => {
      console.log(res);
      //业务系统 token
      localStorage.setItem('access_token', 'Bearer ' + res.access_token)
      //业务系统refresh_token
      localStorage.setItem('refresh_token', res.refresh_token)

      // 重新请求接口 前过期的接口
      response.config.headers.Authorization = localStorage.getItem(
        'access_token'
      )

      // 已经刷新了token，将所有队列中的请求进行重试，最后再清空队列
      requests.forEach((cb) => cb('Bearer ' + res.access_token))
      requests = []
      // 重试第一个请求
      return instance(response.config)
    })
    .catch((res) => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('sso_token')
      localStorage.removeItem('expires_in')
      localStorage.removeItem('refresh_token')
      //返回登陆
      // window.location.href = window.g.mainSiteUrl
      Message.error('请重新登录')
      console.error(res)
    })
    .finally(() => {
      isRefreshing = false
    })
}
