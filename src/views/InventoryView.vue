<script setup>
import { onMounted, ref } from 'vue'
import { api, csvUrl, openExternal } from '../services/api'
import Skeleton from '../components/Skeleton.vue'

const ingredients = ref([])
const usage = ref([])
const err = ref('')
const loading = ref(true)
const adding = ref(false)
const form = ref({ sku: '', name: '', base_unit: 'gram', min_stock: 0, cost_price: 0, initial_qty: 0 })
const dateFrom = ref('')
const dateTo = ref('')
const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const num = (n) => Number(n || 0).toLocaleString('id-ID')

function usageQuery() {
  const p = new URLSearchParams()
  if (dateFrom.value) p.set('date_from', dateFrom.value)
  if (dateTo.value) p.set('date_to', dateTo.value)
  return p.toString() ? `?${p.toString()}` : ''
}

function openUsageCsv() {
  const p = new URLSearchParams()
  if (dateFrom.value) p.set('date_from', dateFrom.value)
  if (dateTo.value) p.set('date_to', dateTo.value)
  const qs = p.toString() ? `?${p.toString()}` : ''
  openExternal(csvUrl(`/reports/inventory${qs}`))
}

async function load() {
  loading.value = true
  try {
    err.value = ''
    ingredients.value = await api.get('/inventory/ingredients')
    usage.value = await api.get(`/reports/inventory${usageQuery()}`)
  } catch (e) { err.value = e.message }
  finally { loading.value = false }
}
onMounted(load)

async function restock(ing) {
  const qty = ing._restockQty
  if (!qty || qty <= 0) return
  try {
    await api.post('/inventory/adjustments', {
      ingredient_id: ing.id,
      movement_type: 'purchase_in',
      qty_base: Number(qty),
      reason: 'restock owner',
    })
    err.value = ''
    ing._restockQty = ''
    await load()
  } catch (e) { err.value = e.message }
}

async function waste(ing) {
  const qty = ing._wasteQty
  if (!qty || qty <= 0) return
  try {
    await api.post('/inventory/adjustments', {
      ingredient_id: ing.id,
      movement_type: 'waste',
      qty_base: Number(qty),
      reason: 'waste owner',
    })
    err.value = ''
    ing._wasteQty = ''
    await load()
  } catch (e) { err.value = e.message }
}

async function addIngredient() {
  const f = form.value
  if (!f.sku.trim() || !f.name.trim()) { err.value = 'SKU dan nama bahan wajib diisi'; return }
  try {
    await api.post('/inventory/ingredients', {
      sku: f.sku.trim(),
      name: f.name.trim(),
      base_unit: f.base_unit,
      min_stock: Number(f.min_stock) || 0,
      cost_price: Number(f.cost_price) || 0,
      initial_qty: Number(f.initial_qty) || 0,
    })
    err.value = ''
    adding.value = false
    form.value = { sku: '', name: '', base_unit: 'gram', min_stock: 0, cost_price: 0, initial_qty: 0 }
    await load()
  } catch (e) { err.value = e.message }
}
</script>

<template>
  <div>
    <div style="display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap">
      <button class="primary" @click="adding = !adding">+ Tambah Bahan Baru</button>
      <button class="mini" @click="openUsageCsv">Laporan pemakaian CSV</button>
    </div>

    <div v-if="adding" style="border:1px solid #FDE68A; background:#FFFBEB; padding:14px; border-radius:10px; margin-bottom:16px; max-width: 640px">
      <h3 style="margin:0 0 10px">Bahan baru (+ stok awal)</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
        <label>SKU
          <input v-model="form.sku" placeholder="ING-KOPI-BYK" style="" />
        </label>
        <label>Nama bahan
          <input v-model="form.name" placeholder="Biji kopi bulk" style="" />
        </label>
        <label>Satuan dasar
          <select v-model="form.base_unit" style="">
            <option>gram</option>
            <option>ml</option>
            <option>unit</option>
          </select>
        </label>
        <label>Stok minimum
          <input v-model="form.min_stock" type="number" min="0" style="" />
        </label>
        <label>Harga beli / unit (Rp)
          <input v-model="form.cost_price" type="number" min="0" style="" />
        </label>
        <label>Stok awal
          <input v-model="form.initial_qty" type="number" min="0" style="" />
        </label>
      </div>
      <div style="margin-top:12px; display:flex; gap:8px">
        <button class="primary" @click="addIngredient">Simpan</button>
        <button class="ghost" @click="adding = false">Batal</button>
      </div>
    </div>

    <p v-if="err" style="color:#DC2626">{{ err }}</p>

    <div v-if="loading" class="card"><Skeleton :rows="7" :height="18" /></div>
    <template v-else>
      <table>
        <tr><th>Bahan</th><th>SKU</th><th style="text-align:right">Stok</th><th style="text-align:right">Min</th>
            <th style="text-align:right">Harga beli/unit</th><th>Tambah stok</th><th>Waste</th></tr>
        <tr v-for="i in ingredients" :key="i.id">
          <td>{{ i.name }}</td>
          <td style="color:#78716C">{{ i.sku }}</td>
          <td style="text-align:right"><b :style="i.stock_qty <= i.min_stock ? 'color:#DC2626' : ''">{{ num(i.stock_qty) }} {{ i.base_unit }}</b></td>
          <td style="text-align:right">{{ num(i.min_stock) }}</td>
          <td style="text-align:right">{{ rupiah(i.cost_price) }}</td>
          <td>
            <input v-model="i._restockQty" placeholder="0" type="number" min="0" style="width:80px" />
            <button class="primary" @click="restock(i)">+</button>
          </td>
          <td>
            <input v-model="i._wasteQty" placeholder="0" type="number" min="0" style="width:80px" />
            <button class="primary" style="background:#DC2626" @click="waste(i)">−</button>
          </td>
        </tr>
        <tr v-if="!ingredients.length"><td colspan="7" style="color:#78716C">Belum ada bahan — pakai Tambah Bahan Baru di atas.</td></tr>
      </table>

      <div style="display:flex; gap:10px; align-items:center; margin-top:24px">
        <h3 style="margin:0; color:#92400E">Pemakaian bahan</h3>
        <label style="font-size:13px">dari <input v-model="dateFrom" type="date" @change="load" /></label>
        <label style="font-size:13px">sampai <input v-model="dateTo" type="date" @change="load" /></label>
      </div>
      <table v-if="usage.length">
        <tr><th>Bahan</th><th style="text-align:right">Pakai</th><th style="text-align:right">Waste</th>
            <th style="text-align:right">Beli (stok in)</th><th>Satuan</th></tr>
        <tr v-for="r in usage" :key="r.ingredient_id">
          <td>{{ r.name }}</td>
          <td style="text-align:right">{{ num(r.consumed) }}</td>
          <td style="text-align:right" :style="r.wasted > 0 ? 'color:#DC2626' : ''">{{ num(r.wasted) }}</td>
          <td style="text-align:right">{{ num(r.purchased) }}</td>
          <td style="color:#78716C">{{ r.base_unit }}</td>
        </tr>
      </table>
      <p v-else style="color:#78716C">Tidak ada pergerakan stok pada rentang ini.</p>
    </template>
  </div>
</template>

<style scoped>
.mini { color: #92400E; border: 1px solid #FDE68A; padding: 8px 12px; border-radius: 8px; background: #FFFBEB; text-decoration: none; font-size: 13px; }
button.primary { margin-left: 4px; padding: 6px 10px; }
label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
</style>
