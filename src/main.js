import { createApp } from 'vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css';
import request from './utils/request'
import storage from './utils/storage'
import api from './api'
import App from './App.vue'
import store from './store'
console.log("环境变量=>", import.meta.env)

const app = createApp(App);
app.config.globalProperties.$request = request;
app.config.globalProperties.$storage = storage;
app.config.globalProperties.$api = api;

// 定义全局指令
app.directive('has', {
  beforeMount: (el, binding) => {
    let actionList = storage.getItem('actionList')
    let value = binding.value
    let hasPermission = actionList.includes(value)
    if (!hasPermission) {
      el.style = 'display:none'
      // 不可直接  el.parentNode.removeChild(el) 因为此时还只是vnode 无法删除的
      setTimeout(() => {
        // 将操作延迟到dom下次循环更新之后执行
        el.parentNode.removeChild(el)
      }, 0)
    }
  }
})

app.use(router).use(store).use(ElementPlus, { size: 'small' }).mount('#app')
