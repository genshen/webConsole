import Vue from "vue";
import router from "./router";
import locales from "@/locales/index";
import iView from "iview";
import App from "./App.vue";
import "./registerServiceWorker";

// import 'iview/dist/styles/iview.css'

Vue.config.productionTip = false;

Vue.use(iView);
/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  i18n: locales,
  template: "<App/>",
  components: { App }
});
