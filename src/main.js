import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import './assets/fonts/font_6wiqusa8yxx/iconfont.css'
// 导入富文本编译器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// import { config } from 'vue/types/umd'
// 富文本编译器注册为全局可用组件
Vue.use(VueQuillEditor, /* {  default global options } */)

axios.defaults.baseURL = 'http://127.0.0.1:8088/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.axios = axios;
Vue.config.productionTip = false

Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal);
  const y = dt.getFullYear();// 获取四位数年份信息
  const m = (dt.getMonth() + 1 + '').padStart(2,"0");// 字符串规定为两位，头部补全字符'0'
  const d = (dt.getDate() + '').padStart(2,'0');

  const hh = (dt.getHours() + '').padStart(2,'0');
  const mm = (dt.getMinutes() + '').padStart(2,'0');
  const ss = (dt.getSeconds() + '').padStart(2,'0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
