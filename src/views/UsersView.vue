<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../services/api'

const users = ref([])
const roles = ref([])
const err = ref('')
const form = ref({ username: '', full_name: '', password: '', role_name: 'cashier' })

async function load() {
  try {
    users.value = await api.get('/auth/users')
    roles.value = await api.get('/auth/roles')
  } catch (e) { err.value = e.message }
}
onMounted(load)

async function create() {
  try {
    await api.post('/auth/users', {
      username: form.value.username,
      full_name: form.value.full_name,
      password: form.value.password,
      role_name: form.value.role_name,
    })
    form.value = { username: '', full_name: '', password: '', role_name: 'cashier' }
    err.value = ''
  } catch (e) { err.value = e.message }
  await load()
}

async function toggle(u) {
  try {
    await api.put(`/auth/users/${u.id}`, { is_active: !u.is_active })
  } catch (e) { err.value = e.message }
  await load()
}

async function setRole(u) {
  try {
    await api.put(`/auth/users/${u.id}`, { role_name: u.role?.name })
  } catch (e) { err.value = e.message }
  await load()
}
</script>

<template>
  <div>
    <div class="card" style="display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; align-items:end">
      <div><label style="font-size:12px; color:#78716C">Username</label><br />
        <input v-model="form.username" placeholder="username" style="min-width:140px" /></div>
      <div><label style="font-size:12px; color:#78716C">Nama lengkap</label><br />
        <input v-model="form.full_name" placeholder="Nama lengkap" style="min-width:160px" /></div>
      <div><label style="font-size:12px; color:#78716C">Password (min 8)</label><br />
        <input v-model="form.password" type="password" placeholder="password" /></div>
      <div><label style="font-size:12px; color:#78716C">Role</label><br />
        <select v-model="form.role_name">
          <option v-for="r in roles" :key="r.id" :value="r.name">{{ r.name }}</option>
        </select></div>
      <button class="primary" @click="create">Tambah Pengguna</button>
    </div>
    <p v-if="err" style="color:#DC2626">{{ err }}</p>
    <table>
      <tr><th>Username</th><th>Nama</th><th>Role</th><th>Status</th><th>Aksi</th></tr>
      <tr v-for="u in users" :key="u.id">
        <td><b>{{ u.username }}</b></td>
        <td>{{ u.full_name }}</td>
        <td>
          <select :value="u.role?.name" @change="setRole({ ...u, role: { name: $event.target.value } })">
            <option v-for="r in roles" :key="r.id" :value="r.name">{{ r.name }}</option>
          </select>
        </td>
        <td :style="u.is_active ? 'color:#16A34A' : 'color:#DC2626'">
          {{ u.is_active ? 'aktif' : 'nonaktif' }}
        </td>
        <td><button class="primary" @click="toggle(u)">{{ u.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button></td>
      </tr>
    </table>
  </div>
</template>
