const DeploymentDomain = 'console.hpc.gensh.me'

let config = {
  env: process.env.NODE_ENV,
  net: {
    ssl: false,
    Domain: process.env.NODE_ENV === 'development' ? window.location.host
      : process.env.NODE_ENV === 'production' ? DeploymentDomain : window.location.host, // todo
    vpnParame: ',DanaInfo=' + DeploymentDomain
  },
  jwt: {
    tokenName: '_t'
  }
}
/** including vpn
 * const DeploymentDomain = 'console.hpc.gensh.me'
const VpnDomain = 'n.ustb.edu.cn'
let envDenpendency = function (development, deployment, vpnenv) {
  return process.env.NODE_ENV === 'production' ?
    (window.location.host == DeploymentDomain ? DeploymentDomain : vpnenv)
    :development
}

let config = {
  env: process.env.NODE_ENV,
  net: {
    Domain: envDenpendency(window.location.host, DeploymentDomain, VpnDomain), // todo
    Protocol: envDenpendency('//', '//', '//'),
    WebSocketProtocol: envDenpendency('ws://', 'ws://', '//'),
    vpnParame: ',DanaInfo=' + DeploymentDomain
  },
  jwt: {
    tokenName: '_t'
  }
}
export default config
 */
export default config
