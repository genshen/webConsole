import axios from 'axios'
import config from '../config/config'

let util = {}
util.title = function (title) {
  title = title ? title + ' - SSH Web Console' : 'SSh Web Console'
  window.document.title = title
}

util.loadUrl = function (url) {
  if (config.env !== 'development' && window.location.host !== util.config.Domain) {
    return url + util.config.vpnParame
  } else {
    return url
  }
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

util.base64Decode = function (encodedData) {
  if (typeof window !== 'undefined') {
    if (typeof window.atob !== 'undefined') {
      return decodeURIComponent(unescape(window.atob(encodedData)))
    }
  } else {
    return Buffer.from(encodedData, 'base64').toString('utf-8')
  }

  let b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let o1, o2, o3, h1, h2, h3, h4, bits
  let i = 0
  let ac = 0
  let dec = ''
  let tmpArr = []

  if (!encodedData) {
    return encodedData
  }

  encodedData += ''

  do {
    // unpack four hexets into three octets using index points in b64
    h1 = b64.indexOf(encodedData.charAt(i++))
    h2 = b64.indexOf(encodedData.charAt(i++))
    h3 = b64.indexOf(encodedData.charAt(i++))
    h4 = b64.indexOf(encodedData.charAt(i++))

    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4

    o1 = bits >> 16 & 0xff
    o2 = bits >> 8 & 0xff
    o3 = bits & 0xff

    if (h3 === 64) {
      tmpArr[ac++] = String.fromCharCode(o1)
    } else if (h4 === 64) {
      tmpArr[ac++] = String.fromCharCode(o1, o2)
    } else {
      tmpArr[ac++] = String.fromCharCode(o1, o2, o3)
    }
  } while (i < encodedData.length)

  dec = tmpArr.join('')
  return decodeURIComponent(escape(dec.replace(/\0+$/, '')))
}

export default util
