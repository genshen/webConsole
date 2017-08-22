const routers = [
    {
        path: '/',
        name: 'home',
        meta: {
            title: 'Home'
        },
        component: (resolve) => require(['./views/index.vue'], resolve)
    },
    {
        path: '/console',
        name: 'console',
        meta: {
            title: 'Console'
        },
        component: (resolve) => require(['./views/console.vue'], resolve)
    },
    {
        path: '/signin',
        name: 'signin',
        meta: {
            title: 'sign in'
        },
        component: (resolve) => require(['./views/signin.vue'], resolve)
    }];
export default routers;