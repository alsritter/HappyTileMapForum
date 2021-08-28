import { request } from './request.js'

// 验证邮箱是否存在
function testEmailExist(email) {
  return request({
    url: 'forum/auth/testEmailExist',
    params: { email }
  })
}

// 验证手机是否存在
function testPhoneExist(phone) {
  return request({
    url: 'forum/auth/testPhoneExist',
    params: { phone }
  })
}

// 注册
function register(email, username, password, phone, code) {
  return request({
    url: 'forum/auth/register',
    method: 'post',
    data: {
      email,
      username,
      password,
      phone,
      code
    }
  })
}

export default {
  register,
  testEmailExist,
  testPhoneExist
}
