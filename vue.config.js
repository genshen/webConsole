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
  }
};
