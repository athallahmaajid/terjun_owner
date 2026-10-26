<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../services/api'

const conflicts = ref([])
const busy = ref('')
const err = ref('')

async function load() {
  try {
    conflicts.value = await api.get('/sync/conflicts')
  } catch (e) { err.value = e.message }
}
onMounted(load)

async function resolve(c) {
  busy.value = c.id
  try {
    await api.post(`/sync/conflicts/${c.id}/resolve`, { resolution: 'keep_server' })
    err.value = ''
  } catch (e) { err.value = e.message }
  await load()
  busy.value = ''
}
</script>

<template>
  <div>
    <p style="color:#78716C; margin-top:0">
      Perangkat offline mengirim versi yang sudah lewat di server. Server menolak penurunan status;
      tinjau di sini lalu tandai selesai (data server dipertahankan).
    </p>
    <p v-if="err" style="color:#DC2626">{{ err }}</p>
    <table v-if="conflicts.length">
      <tr><th>Waktu</th><th>Entitas</th><th>Alasan</th><th>Status</th><th></th></tr>
      <tr v-for="c in conflicts.slice(0, 50)" :key="c.id">
        <td>{{ (c.created_at || '').slice(0, 16).replace('T', ' ') }}</td>
        <td>{{ c.entity }}</td>
        <td style="max-width:420px">{{ c.reason }}</td>
        <td :style="c.status === 'open' ? 'color:#B45309' : 'color:#16A34A'">{{ c.status }}</td>
        <td>
          <button v-if="c.status === 'open'" class="primary" :disabled="busy === c.id" @click="resolve(c)">
            {{ busy === c.id ? '…' : 'Tandai Selesai' }}
          </button>
        </td>
      </tr>
    </table>
    <p v-else style="color:#16A34A">Tidak ada konflik — sinkronisasi sehat.</p>
  </div>
</template>
