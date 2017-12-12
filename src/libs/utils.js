import axios from 'axios'
import config from '../config/config'

let util = {}
util.title = function (title) {
  title = title ? title + ' - SSH Web Console' : 'SSh Web Console'
  window.document.title = title
}

util.loadUrl = function (url, params, websocket) {
  let u
  if (config.env !== 'development' && window.location.host !== config.net.Domain) { // vpn, use ssl.
    let protocol = websocket ? 'wss://' : 'https://'
    u = protocol + 'n.ustb.edu.cn' + url + config.net.vpnParame // todo
  } else {
    let protocol = config.ssl ? (websocket ? 'wss://' : 'https://') : (websocket ? 'ws://' : 'http://')
    u = protocol + config.net.Domain + url
  }
  if (params) {
    return u + '?' + params
  }
  return u
}

// const ajaxUrl = config.env === 'development' ?
//     'http://127.0.0.1:80' :
//     config.env === 'production' ?
//     'http://' + util.config.Domain:
//     'https://debug.url.com'; //todo

util.axiosInstance = axios.create({
  timeout: 30000,
  transformRequest: [function (data) {
    // Do whatever you want to transform the data
    let ret = ''
    for (let it in data) {
      ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
    }
    return ret
  }],
  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
})

export default util
