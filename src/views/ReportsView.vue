<script setup>
import { onMounted, ref } from 'vue'
import { api, csvUrl, openExternal } from '../services/api'
import { useSession } from '../stores/session'
import Skeleton from '../components/Skeleton.vue'

const from = ref('')
const to = ref('')
const rows = ref([])
const err = ref('')
const loading = ref(true)

const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

function reportQuery() {
  const qs = []
  if (from.value) qs.push(`date_from=${from.value}`)
  if (to.value) qs.push(`date_to=${to.value}`)
  return qs.length ? '?' + qs.join('&') : ''
}

function openCsv(r) {
  openExternal(csvUrl(`/reports/${r}${reportQuery()}`))
}

async function load() {
  err.value = ''
  loading.value = true
  const qs = []
  if (from.value) qs.push(`date_from=${from.value}`)
  if (to.value) qs.push(`date_to=${to.value}`)
  try {
    rows.value = await api.get(`/reports/sales${qs.length ? '?' + qs.join('&') : ''}`)
  } catch (e) {
    err.value = e.message
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
  <div>
    <div style="display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap">
      <input v-model="from" type="date" @change="load" />
      <input v-model="to" type="date" @change="load" />
      <button class="primary" :disabled="loading" @click="load">Muat</button>
      <button v-for="r in ['sales','products','payments','inventory','shifts']" :key="r"
         class="mini" @click="openCsv(r)">CSV {{ r }}</button>
    </div>
    <p v-if="err" style="color:#DC2626">{{ err }}</p>
    <div v-if="loading" class="card"><Skeleton :rows="8" :height="16" /></div>
    <table v-else-if="rows.length">
      <tr><th>Tanggal</th><th style="text-align:right">Transaksi</th><th style="text-align:right">Bruto</th><th style="text-align:right">Diskon</th><th style="text-align:right">Refund</th><th style="text-align:right">Pajak/Service</th><th style="text-align:right">Netto</th></tr>
      <tr v-for="r in rows" :key="r.date">
        <td>{{ r.date }}</td>
        <td style="text-align:right">{{ r.transactions }}</td>
        <td style="text-align:right">{{ rupiah(r.gross) }}</td>
        <td style="text-align:right">{{ rupiah(r.discounts) }}</td>
        <td style="text-align:right">{{ rupiah(r.refunds) }}</td>
        <td style="text-align:right">{{ rupiah(r.taxes + r.service) }}</td>
        <td style="text-align:right"><b>{{ rupiah(r.net) }}</b></td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
.mini { color: #92400E; border: 1px solid #FDE68A; padding: 8px 12px; border-radius: 8px; background: #FFFBEB; text-decoration: none; font-size: 13px; }
.mini:hover { background: #FEF3C7; }
</style>
