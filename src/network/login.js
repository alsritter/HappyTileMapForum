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
function getUser(token) {
  request({
    url: `forum/user/getuser?token=${token}`
  }).then((res) => {
    this.$store.commit('setUser', res.data)
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
