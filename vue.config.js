module.exports = {
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
