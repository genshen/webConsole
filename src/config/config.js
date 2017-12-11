let config = {
  env: process.env.NODE_ENV,
  net: {
    Domain: process.env.NODE_ENV === 'development' ? window.location.host
      : process.env.NODE_ENV === 'production' ? 'console.hpc.gensh.me' : window.location.host, // todo
    vpnParame: ',DanaInfo=console.hpc.gensh.me'
  },
  jwt: {
    tokenName: '_t'
  }
}
export default config
