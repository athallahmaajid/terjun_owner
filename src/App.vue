<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useSession } from './stores/session'
import LiveTicker from './components/LiveTicker.vue'

const session = useSession()
const router = useRouter()
const route = useRoute()

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/reports', label: 'Laporan' },
  { to: '/menu', label: 'Menu' },
  { to: '/inventory', label: 'Stok' },
  { to: '/users', label: 'Pengguna' },
  { to: '/conflicts', label: 'Konflik' },
]
</script>

<template>
  <div v-if="route.path !== '/login'" class="shell">
    <aside>
      <div class="brand"><strong>TERJUN</strong> COFFEE</div>
      <nav>
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" active-class="on">{{ l.label }}</RouterLink>
      </nav>
      <button @click="[session.logout(), router.push('/login')]" class="ghost">Keluar</button>
    </aside>
    <main>
      <header><h1>{{ { '/': 'Dashboard', '/reports': 'Laporan', '/menu': 'Menu & Kategori', '/inventory': 'Bahan & Pembelian', '/users': 'Pengguna', '/conflicts': 'Konflik Sinkronisasi' }[route.path] || 'Owner' }}</h1>
        <LiveTicker />
      </header>
      <RouterView />
    </main>
  </div>
  <RouterView v-else />
</template>

<style>
.shell { display: flex; min-height: 100vh; }
aside { width: 210px; background: #FFFBEB; border-right: 1px solid #FDE68A; padding: 18px 14px; display: flex; flex-direction: column; gap: 18px; }
.brand { font-size: 18px; letter-spacing: 2px; color: #92400E; }
nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
nav a { display: block; padding: 9px 12px; border-radius: 8px; color: #292524; text-decoration: none; font-size: 14px; }
nav a.on, nav a:hover { background: #FEF3C7; color: #92400E; font-weight: 600; }
button.ghost { background: transparent; border: 1px solid #FDE68A; color: #92400E; padding: 8px; border-radius: 8px; cursor: pointer; }
main { flex: 1; padding: 20px 28px; }
header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
h1 { font-size: 20px; margin: 0; color: #292524; }
.card { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px; }
table { width: 100%; border-collapse: collapse; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; }
th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid #FEF3C7; font-size: 13px; }
th { color: #92400E; font-size: 12px; text-transform: uppercase; letter-spacing: 0.6px; }
input, select { padding: 8px 10px; border: 1px solid #FDE68A; border-radius: 8px; background: white; font-size: 14px; }
button.primary { background: #92400E; color: white; border: none; padding: 9px 14px; border-radius: 8px; cursor: pointer; }
button.primary:hover { background: #B45309; }
</style>
