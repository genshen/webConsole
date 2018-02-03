import axios from 'axios'
import config from '@/config/config'
// import config from '../config/config'

let util = {}
util.title = function (title) {
  title = title ? title + ' - SSH Web Console' : 'SSh Web Console'
  window.document.title = title
}

util.loadUrl = function (url, params) {
  const host = 'https://vpn3.ustb.edu.cn'
  return params ? host + url + '?' + params + config.net.vpnParame
    : host + url + config.net.vpnParame
  // if (config.env !== 'development' && window.location.host !== config.net.Domain) { // todo params
  //   url += config.net.vpnParame
  // }g
  // return params ? url + '?' + params : url
}

util.loadWebSocketUrl = function (url, params) {
  const protocol = config.net.webSocketProtocol
  const host = 'vpn3.ustb.edu.cn'
  // return protocol + url
  //   console.log(location.host, window.location.host, config.net.Domain)
  //  if (config.env !== 'development' && window.location.host !== config.net.Domain) { // todo params
  // return protocol + host + url + ',DanaInfo=console.hpc.gensh.me,SSL?' + params // todo
  return params ? protocol + host + url + '?' + params + config.net.vpnParame
    : protocol + host + url + config.net.vpnParame
  // } else {
  //   //   return protocol + window.location.host + this.loadUrl(url, params + '&ok=k')
  // }
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
