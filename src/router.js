import { createRouter, createWebHistory } from 'vue-router'
import { useSession } from './stores/session'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import ReportsView from './views/ReportsView.vue'
import MenuView from './views/MenuView.vue'
import InventoryView from './views/InventoryView.vue'
import UsersView from './views/UsersView.vue'
import ConflictsView from './views/ConflictsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/', component: DashboardView },
    { path: '/reports', component: ReportsView },
    { path: '/menu', component: MenuView },
    { path: '/inventory', component: InventoryView },
    { path: '/users', component: UsersView },
    { path: '/conflicts', component: ConflictsView },
  ],
})

router.beforeEach(async (to) => {
  const s = useSession()
  if (to.path !== '/login' && !s.token) {
    const ok = await s.tryPrototypeLogin()
    if (ok) return true
    return '/login'
  }
})

export default router
