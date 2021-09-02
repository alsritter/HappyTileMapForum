// 客户端
import { request } from './request.js'
import qs from 'qs'

// 根据 id 和 tag 显示文章列表
function getTopics(currentPage, tag) {
  return request({
    url: '/forum/topics/get-by-tag',
    method: 'post',
    data: qs.stringify({
      currentPage,
      tag
    })
  })
}

// 根据 id 获取文章
function getTopic(id) {
  return request({
    url: '/forum/topics/get-by-id',
    params : { //请求参数
      id
    }
  })
}

function searchTopics(str, currentPage = 1) {
  return request({
    url: '/forum/topics/search',
    method: 'post',
    data: qs.stringify({
      currentPage,
      str
    })
  })
}

function getBanner() {
  return request({
    url: '/banner'
  })
}

export default { getTopics, getTopic, searchTopics, getBanner }
