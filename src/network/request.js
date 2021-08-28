import axios from 'axios'
import { Message } from 'element-ui'

const baseURL = 'http://localhost:19999/'

export { baseURL }
export function request(config) {
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
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = token
      }
      return config
    },
    (err) => {
      console.error(err)
      console.error('请求失败')
    }
  )

  // 响应拦截
  instance.interceptors.response.use(
    (response) => {
      if (response.data) {
        if (response.data.code != 200) {
          // TODO: 如何标识是 Token 过期了
          // 无权限
          if (response.data.code >= 40000 && response.data.code < 50000) {
            const refresh_token = localStorage.getItem('refresh_token')
            if (!refresh_token) {
              Message.error('请登录')
              console.error('授权异常:', response)
              throw new Error('授权异常')
            }
            // 刷新请求（这里不能走这个 instance 实例））
            return (
              axios
                .create({
                  baseURL,
                  timeout: 5000,
                  // 带上cookies
                  withCredentials: true // 带 cookies 必须要 cors 跨域
                })
                .request({
                  url: 'forum/auth/refresh_token',
                  params: { refresh_token }
                })
                .then((r_res) => {
                  // 储存 token 到本地
                  localStorage.setItem(
                    'token',
                    'Bearer ' + r_res.data.access_token
                  )
                  localStorage.setItem(
                    'refresh_token',
                    r_res.data.refresh_token
                  )
                  // 请求重发
                  return axios
                    .create({
                      baseURL,
                      timeout: 5000,
                      // 带上cookies
                      withCredentials: true // 带 cookies 必须要 cors 跨域
                    })
                    .request(response.config)
                    .then((endres) => {
                      if (endres.data.code != 200) {
                        console.error(endres)
                        throw new Error('重传错误')
                      }
                      return Promise.resolve(endres)
                    })
                    .catch((enderror) => {
                      console.error(enderror)
                      throw new Error()
                    })
                })
                // 还是无权限
                .catch((error) => {
                  Message.error('请登录')
                  console.error('授权异常:',response)
                  // 清空
                  localStorage.removeItem('token')
                  localStorage.removeItem('refresh_token')
                })
            )
          }
        }
      }
      // 必须返回
      return response
    },
    (err) => {
      console.error(err)
      console.error('响应失败')
    }
  )

  // 发送网络请求，返回一个 promise
  return instance(config)
}
