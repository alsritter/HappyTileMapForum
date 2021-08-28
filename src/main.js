// 引入vue
import Vue from 'vue'
// 引入vue路由
import router from './router/index.js'
// 引入vuex
import store from './store'
Vue.prototype.$store = store

// 引入 Element-UI
import ElementUI from 'element-ui';
import { Message } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import axios from './network'
Vue.prototype.$axios = axios
Vue.prototype.$message = Message

import App from './App.vue'


Vue.config.productionTip = false

Vue.use(ElementUI);

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app')
