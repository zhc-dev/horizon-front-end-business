import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'element-plus/theme-chalk/src/message.scss'

const app = createApp(App)

app.use(router)

app.mount('#app')
