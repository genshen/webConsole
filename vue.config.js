// set global config

// api domain(only in production mode),
// set to ''/undefined/false to use default value: window.location.host
process.env.VUE_APP_API_URL = "";

module.exports = {
  baseUrl:
    process.env.NODE_ENV === "production"
      ? process.env.PUBLISH_BASE_URL
        ? process.env.PUBLISH_BASE_URL
        : "/"
      : "/",
  runtimeCompiler: true,
  assetsDir: "static",
  devServer: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:2222",
        changeOrigin: true
      },
      "/ws": {
        target: "http://127.0.0.1:2222",
        ws: true,
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    externals: {
      axios: "axios",
      vue: "Vue",
      "vue-router": "VueRouter",
      "vue-i18n": "VueI18n",
      iview: "iview"
      // 'xterm': 'xterm'
    }
  },
  pwa: {
    themeColor: "#2d8cf0",
    msTileColor: "#5cadff",
    iconPaths: {
      // icon color #d85342
      favicon32: "static/img/icons/favicon-32x32.png",
      favicon16: "static/img/icons/favicon-16x16.png",
      appleTouchIcon: "static/img/icons/apple-touch-icon-152x152.png",
      maskIcon: "static/img/icons/safari-pinned-tab.svg",
      msTileImage: "static/img/icons/msapplication-icon-144x144.png"
    }
  }
};
