import Vue from "vue";
import Router from "vue-router";
import iView from "iview";
import Utils from "@/libs/utils";

Vue.use(Router);

const vueRouter = new Router({
  mode: "hash",
  routes: [
    {
      path: "/",
      name: "home",
      meta: {
        title: "Home"
      },
      component: () => import("@/components/Home")
    },
    {
      path: "/console",
      name: "console",
      meta: {
        title: "Console"
      },
      component: () => import("@/components/Console")
    },
    {
      path: "/signin",
      name: "signin",
      meta: {
        title: "sign in"
      },
      component: () => import("@/components/SignIn")
    }
  ]
});

vueRouter.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  Utils.title(to.meta.title);
  next();
});

vueRouter.afterEach(() => {
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
});

export default vueRouter;
