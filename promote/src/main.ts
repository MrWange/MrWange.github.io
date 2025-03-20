import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css';
import router from './router'
import VChart from 'vue-echarts'

// 创建应用
const app = createApp(App)

// 注册全局组件
app.component('v-chart', VChart)

// 使用插件
app.use(router)
app.use(Antd)

// 挂载应用
app.mount('#app')
