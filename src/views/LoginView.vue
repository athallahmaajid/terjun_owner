<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSession } from '../stores/session'

const username = ref('owner')
const password = ref('')
const session = useSession()
const router = useRouter()

async function submit() {
  if (await session.login(username.value, password.value)) router.push('/')
}
</script>

<template>
  <div class="wrap">
    <div class="box">
      <h2><b>TERJUN</b> COFFEE — Owner</h2>
      <input v-model="username" placeholder="Username" @keyup.enter="submit" />
      <input v-model="password" type="password" placeholder="Password" @keyup.enter="submit" />
      <button class="primary" :disabled="session.busy" @click="submit">
        {{ session.busy ? 'Memproses…' : 'Masuk' }}
      </button>
      <p v-if="session.error" class="err">{{ session.error }}</p>
    </div>
  </div>
</template>

<style scoped>
.wrap { min-height: 100vh; display: grid; place-items: center; }
.box { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 16px; padding: 32px; width: 330px; display: flex; flex-direction: column; gap: 12px; }
.box h2 { margin: 0 0 8px; font-weight: 500; font-size: 17px; color: #292524; }
.box h2 b { color: #92400E; }
.err { color: #DC2626; font-size: 13px; margin: 0; }
</style>
