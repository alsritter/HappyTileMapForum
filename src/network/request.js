import axios from 'axios'
import { Loading, Message } from 'element-ui'
import qs from 'qs'
import router from '@/router'
import Vue from 'vue'

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
        Vue.prototype.$showLoading();
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = token
        }
        return config
      },
      (err) => {
        Vue.prototype.$closeLoading();
        // 请求错误时
        console.error('请求失败', err)
        return Promise.reject(error) // 在调用的那边可以拿到(catch)你想返回的错误信息
      }
    )

    // 响应拦截
    instance.interceptors.response.use(
      (response) => {
        Vue.prototype.$closeLoading();
        if (response.data) {
          if (response.data.code != 200) {
            // 无权限
            if (response.data.code == 45006) {
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
        Vue.prototype.$closeLoading();
        console.error('响应失败', err)
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

// // /**
// //  * 刷新令牌
// //  */
// // function refreshToken() {
// //   return (
// //     axios
// //       .create({
// //         baseURL,
// //         timeout: 5000,
// //         // 带上cookies
// //         withCredentials: true // 带 cookies 必须要 cors 跨域
// //       })
// //       .request({
// //         url: 'forum/auth/refresh_token',
// //         params: { refresh_token }
// //       })
// //       .then((r_res) => {
// //         // 储存 token 到本地
// //         localStorage.setItem('token', 'Bearer ' + r_res.data.access_token)
// //         localStorage.setItem('refresh_token', r_res.data.refresh_token)
// //       })
// //       // 还是无权限
// //       .catch((error) => {
// //         Message.error('请重新登录')
// //         console.error('刷新令牌异常:', response)
// //         // 清空
// //         localStorage.removeItem('token')
// //         localStorage.removeItem('refresh_token')
// //       })
// //   )
// // }

// /**
//  * 刷新token
//  */
// function refreshToken(response, instance) {
//   const refresh_token = localStorage.getItem('refresh_token')
//   // 判断 没有refresh_token的处理
//   if (!refresh_token) {
//     localStorage.removeItem('access_token')
//     // localStorage.removeItem('sso_token')
//     // localStorage.removeItem('expires_in')
//     localStorage.removeItem('refresh_token')
//     window.location.href = window.g.mainSiteUrl //返回登陆
//   }
//   // let param = {
//   //   client_id: window.g.client_id,
//   //   client_secret: window.g.client_secret,
//   //   grant_type: 'refresh_token',
//   //   refresh_token: refreshtoken
//   // }
//   // instance是当前已创建的axios实例
//   return instance
//     .request(('forum/auth/refresh_token', { refresh_token }))
//     .then((res) => {
//       //业务系统 token
//       localStorage.setItem('access_token', 'Bearer ' + res.data.access_token)
//       //业务系统refresh_token
//       localStorage.setItem('refresh_token', res.data.refresh_token)

//       // 重新请求接口 前过期的接口
//       response.config.headers.Authorization = localStorage.getItem('access_token')
//       // 已经刷新了token，将所有队列中的请求进行重试，最后再清空队列
//       requests.forEach((cb) => cb(res.access_token))
//       requests = []
//       return instance(response.config)
//     })
//     .catch((res) => {
//       localStorage.removeItem('access_token')
//       localStorage.removeItem('sso_token')
//       localStorage.removeItem('expires_in')
//       localStorage.removeItem('refresh_token')
//       //返回登陆
//       // window.location.href = window.g.mainSiteUrl
//       Message.error('请重新登录')
//       console.error(res);
//     })
//     .finally(() => {
//       isRefreshing = false
//     })
// }

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
    window.location.href = window.g.mainSiteUrl //返回登陆
  }
  // instance是当前已创建的axios实例
  return instance
    .request(('forum/auth/refresh_token', { refresh_token }))
    .then((res) => {
      //业务系统 token
      localStorage.setItem('access_token', 'Bearer ' + res.data.access_token)
      //业务系统refresh_token
      localStorage.setItem('refresh_token', res.data.refresh_token)

      // 重新请求接口 前过期的接口
      response.config.headers.Authorization = localStorage.getItem(
        'access_token'
      )
      // 已经刷新了token，将所有队列中的请求进行重试，最后再清空队列
      requests.forEach((cb) => cb(res.access_token))
      requests = []
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
