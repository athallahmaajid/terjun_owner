import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useSession } from './stores/session'
import { onUnauthorized } from './services/api'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const session = useSession(pinia)
session.boot()

onUnauthorized(() => {
  if (session.token) {
    session.logout()
    session.error = 'Sesi berakhir. Silakan masuk kembali.'
    if (router.currentRoute.value.path !== '/login') router.push('/login')
  }
})

app.use(router)
app.mount('#app')
