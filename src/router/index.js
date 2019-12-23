import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const routes = [{
        path: '/',
        redirect: '/custom-modeler'
    },
    {
        path: '/custom-modeler',
        component: () =>
            import ('../views/custom-modeler')
    }
]

export default new Router({
    mode: 'history',
    routes
})