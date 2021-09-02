// 客户端
import {request} from './request.js'

// 上传头像
export function uploadAvatar(img) {
  return request({
    url: '/setavatar',
    method: 'post',
    data: img,
    headers: {'Content-Type': 'multipart/form-data'},
  })
}

// 上传文章
export function sendTopic({tag, title, content}) {
  return request({
    url: '/forum/topics/send-topic',
    method: 'post',
    data: {
      tag,
      title,
      content
    }
  })
}

// 上传评论
export function sendComment({content, masterId, type}) {
  return request({
    url: '/forum/comment/send-comment',
    method: 'post',
    data: {content, masterId, type}
  })
}

// 修改密码
function modPwd({oldpwd, newpwd}) {
  return request({
    url: '/mod/pwd',
    method: 'post',
    data: {oldpwd, newpwd}
  })
}

export default {uploadAvatar, sendTopic, sendComment, modPwd}
