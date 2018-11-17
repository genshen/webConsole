let config = {
  net: {
    api_domain:
      process.env.NODE_ENV === "production"
        ? process.env.VUE_APP_API_URL
          ? process.env.VUE_APP_API_URL
          : window.location.host
        : window.location.host,
    vpnHost: "vpn3.ustb.edu.cn",
    vpnParame: process.env.VUE_APP_API_URL
      ? ",DanaInfo=" + process.env.VUE_APP_API_URL + ",SSL" // todo port
      : window.location.host
  },
  jwt: {
    tokenName: "_t"
  }
};

config.net.protocol = window.location.protocol + "//";
config.net.webSocketProtocol =
  process.env.NODE_ENV !== "development" &&
  window.location.protocol === "https:"
    ? "wss://"
    : "ws://"; // todo add config.

config.net.isVPN = (function() {
  // if (config.env !== 'development' && window.location.host !== config.net.api_domain) {
  //   return true // url += config.net.vpnParame
  // }
  if (process.env.NODE_ENV === "production") {
    return window.location.pathname.startsWith("/vpn");
  }
  return false;
})();

// get target host when communicating with backend api.
config.net.host = (function() {
  if (config.net.isVPN) {
    return config.net.vpnHost;
  } else {
    return config.net.api_domain;
  }
})();

// please use midParams, instead of vpnParams.
config.net.midParams = (function() {
  if (config.net.isVPN) {
    return config.net.vpnParame;
  } else {
    return ""; // empty by default
  }
})();

export default config;
