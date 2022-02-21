import axios from 'axios'
import config from '../config/config'

const util = {
  title: (title: string) => {
    title = title ? title + ' - SSH Web Console' : 'SSh Web Console'
    window.document.title = title
  },
  // url: relative url starting with '/'
  loadUrl: (url: string, params: string | null) => {
    url =
      config.net.protocol +
      config.net.host +
      config.net.api_base_url +
      url +
      config.net.midParams
    return params ? url + '?' + params : url
  },
  // url: relative url starting with '/'
  loadWebSocketUrl: (url: string, params: string) => {
    const protocol = config.net.webSocketProtocol
    url =
      protocol +
      config.net.host +
      config.net.api_base_url +
      url +
      config.net.midParams
    return params ? url + '?' + params : url
  },

  // const ajaxUrl = config.env === 'development' ?
  //     'http://127.0.0.1:80' :
  //     config.env === 'production' ?
  //     'http://' + util.config.Domain:
  //     'https://debug.url.com'; //todo
  axiosInstance: axios.create({
    timeout: 30000,
    transformRequest: [
      function (data) {
        // Do whatever you want to transform the data
        let ret = ''
        for (const it in data) {
          ret +=
            encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
      },
    ],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }),
}

export default util
