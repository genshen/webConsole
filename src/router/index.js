import Vue from 'vue'
import Router from 'vue-router'
import iView from 'iview'
import Utils from '@/libs/utils'

import Home from '@/components/Home'
import Console from '@/components/Console'
import SignIn from '@/components/SignIn'

Vue.use(Router)

const vueRouter = new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        title: 'Home'
      },
      component: Home
    },
    {
      path: '/console',
      name: 'console',
      meta: {
        title: 'Console'
      },
      component: Console
    },
    {
      path: '/signin',
      name: 'signin',
      meta: {
        title: 'sign in'
      },
      component: SignIn
    }
  ]
})

vueRouter.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  Utils.title(to.meta.title)
  next()
})

vueRouter.afterEach(() => {
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default vueRouter
