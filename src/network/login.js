import { request } from './request.js'

function login(email, password, captcha) {
  return request({
    url: '/login',
    method: 'post',
    data: {
      email,
      password,
      captcha: captcha.toLowerCase()
    }
  })
}

// 每次加载页面，获取用户登录态
function getUser() {
  request({
    url: '/getuser'
  }).then((res) => {
    if (res.data.msg == 'ok') {
      // 把服务端读出来的 token 数据保存到 vuex
      this.$store.commit('setUser', res.data.user)
    } else {
      console.log('未登录')
    }
  })
}

function getCaptcha() {
  return request({
    url: '/captcha'
  })
}

export default {
  login,
  getUser,
  getCaptcha
}
