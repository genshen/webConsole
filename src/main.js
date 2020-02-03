import Vue from "vue";
import router from "./router";
import locales from "@/locales/index";
import ViewUI from "view-design";
import App from "./App.vue";
import "./registerServiceWorker";

// import "view-design/dist/styles/iview.css";

Vue.config.productionTip = false;

Vue.use(ViewUI);
/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  i18n: locales,
  template: "<App/>",
  components: { App }
});
