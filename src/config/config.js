let config = {
  env: process.env.NODE_ENV,
  net: {
    Domain: process.env.NODE_ENV === 'development' ? window.location.host
      : process.env.NODE_ENV === 'production' ? 'console.hpc.gensh.me' : window.location.host, // todo
    vpnParame: ',DanaInfo=console.hpc.gensh.me,SSL'
  },
  jwt: {
    tokenName: '_t'
  }
}

config.net.webSocketProtocol = (config.env !== 'development' && window.location.protocol === 'https:') ? 'wss://' : 'ws://'

export default config
