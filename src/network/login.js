import { request } from './request.js'

function loginByPassword(username, password, captcha) {
  return request({
    url: 'forum/auth/login',
    method: 'post',
    data: {
      type: 'password',
      username,
      password,
      captcha
    }
  })
}

function loginByEmail(email, code) {
  return request({
    url: 'forum/auth/login',
    method: 'post',
    data: {
      type: 'email',
      email,
      code
    }
  })
}

// 每次加载页面，获取用户登录态
function getUser() {
  request({
    url: 'forum/auth/getuser'
  }).then((res) => {
    if (res.data.msg == 'ok') {
      // 把服务端读出来的 token 数据保存到 vuex
      this.$store.commit('setUser', res.data.data)
    } else {
      console.log('未登录')
    }
  })
}

// 取得的验证码
function getCaptcha() {
  return request({
    url: 'forum/auth/captcha'
  })
}

function sendEmailCode(email, type) {
  return request({
    url: `auth/handler/getEmailCode?email=${email}&type=${type}`
  })
}

export default {
  loginByPassword,
  loginByEmail,
  sendEmailCode,
  getUser,
  getCaptcha
}
