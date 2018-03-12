let config = {
  env: process.env.NODE_ENV,
  net: {
    Domain: process.env.NODE_ENV === 'development' ? window.location.host
      : process.env.NODE_ENV === 'production' ? 'console.hpc.gensh.me' : window.location.host, // todo
    vpnHost: 'vpn3.ustb.edu.cn',
    vpnParame: ',DanaInfo=console.hpc.gensh.me,SSL'
  },
  jwt: {
    tokenName: '_t'
  }
}

config.net.protocol = window.location.protocol + '//'
config.net.webSocketProtocol = (config.env !== 'development' && window.location.protocol === 'https:') ? 'wss://' : 'ws://'
config.net.isVPN = (function () {
  // if (config.env !== 'development' && window.location.host !== config.net.Domain) { // todo params
  //   return true // url += config.net.vpnParame
  // }
  var urlParams = new URLSearchParams(window.location.search)
  return urlParams.has('vpn')
})()

// get target host when communicationg with banckend api.
config.net.host = (function () {
  if (config.net.isVPN) {
    return config.net.vpnHost
  } else {
    return window.location.host
  }
})()

// please use midParams, instead of vpnParams.
config.net.midParams = (function () {
  if (config.net.isVPN) {
    return config.net.vpnParame
  } else {
    return '' // empty by default
  }
})()

export default config
