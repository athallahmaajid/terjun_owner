<script setup>
// Koneksi WebSocket terhadap channel dashboard: tiap event menampilkan ticker.
import { onMounted, onUnmounted, ref } from 'vue'
import { getToken } from '../services/api'

const items = ref([])
let ws = null
let reconnect = 0

function connect() {
  ws = new WebSocket(`wss://terjun-backend.fastapicloud.dev/api/ws/dashboard?token=${getToken() || ''}`)
  ws.onmessage = (ev) => {
    try {
      const m = JSON.parse(ev.data)
      const fmt = (v) => (v || '').toLocaleString ? Number(v).toLocaleString('id-ID') : v
      const label = m.title
        ? m.title
        : m.type === 'payment.created'
          ? `Pembayaran ${m.method || '-'} Rp ${fmt(m.amount)}`
          : m.type === 'sync.pushed'
            ? `Sikron dari ${m.device || 'perangkat'} (${fmt(m.applied ?? m.events ?? 0)} event)`
            : m.type
      items.value.unshift(label)
      if (items.value.length > 12) items.value.pop()
    } catch (_) {}
  }
  ws.onclose = () => {
    if (reconnect < 6) setTimeout(connect, Math.min(30_000, 2 ** ++reconnect * 1000))
  }
}

onMounted(connect)
onUnmounted(() => ws && ws.close())
</script>

<template>
  <div class="live" v-if="items.length">
    <span class="dot" />
    <ul><li v-for="(i, k) in items" :key="k">{{ i }}</li></ul>
  </div>
</template>

<style scoped>
.live { max-width: 420px; min-width: 240px; font-size: 12px; color: #78716C; }
.dot { display: inline-block; width: 8px; height: 8px; background: #16A34A; border-radius: 50%; margin-right: 6px; }
ul { margin: 6px 0 0; padding: 0; max-height: 74px; overflow: hidden; }
li { list-style: none; padding: 2px 0; }
li:first-child { color: #92400E; font-weight: 600; }
</style>
