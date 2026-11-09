<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../services/api'
import Skeleton from '../components/Skeleton.vue'

const items = ref([])
const categories = ref([])
const err = ref('')
const loading = ref(true)
const adding = ref(false)
const newCat = ref('')
const form = ref({ code: '', name: '', category_id: '', price: 0, note: '', is_active: true })
const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

async function load() {
  loading.value = true
  try {
    err.value = ''
    items.value = await api.get('/menu/items?include_inactive=true')
    categories.value = await api.get('/menu/categories')
  } catch (e) { err.value = e.message }
  finally { loading.value = false }
}
onMounted(load)

async function save(item) {
  try {
    await api.put(`/menu/items/${item.id}`, {
      name: item.name,
      price: Number(item.price),
      is_active: !!item.is_active,
      category_id: item.category_id,
      sku: item.sku,
      description: item.description,
    })
    err.value = ''
  } catch (e) { err.value = e.message }
  await load()
}

function autoCode(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 10) || 'MENU'
}

function uniqueCode(base, taken) {
  let code = base
  let n = 2
  while (taken.has(code)) code = `${base}${n++}`
  return code
}

async function createMenu() {
  const f = form.value
  const name = f.name.trim()
  if (!name) { err.value = 'Nama menu wajib diisi'; return }
  if (!f.category_id) { err.value = 'Pilih kategori menu'; return }
  const price = Number(f.price)
  if (!Number.isFinite(price) || price < 0) { err.value = 'Harga tidak boleh negatif'; return }

  const taken = new Set(items.value.map((i) => i.code))
  const code = f.code.trim() ? f.code.trim().toUpperCase() : uniqueCode(autoCode(name), taken)

  try {
    await api.post('/menu/items', {
      category_id: f.category_id,
      code,
      name,
      price: Math.round(price),
      is_active: !!f.is_active,
      note: f.note.trim() || null,
    })
    err.value = ''
    adding.value = false
    form.value = { code: '', name: '', category_id: '', price: 0, note: '', is_active: true }
    await load()
  } catch (e) { err.value = e.message }
}

async function makeCategory() {
  const name = newCat.value.trim()
  if (!name) return
  try {
    const taken = new Set(categories.value.map((c) => c.code))
    await api.post('/menu/categories', {
      code: uniqueCode(autoCode(name), taken),
      name,
      sort_order: categories.value.length + 1,
    })
    newCat.value = ''
    err.value = ''
    await load()
  } catch (e) { err.value = e.message }
}
</script>

<template>
  <div>
    <div style="display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap">
      <button class="primary" @click="adding = !adding">+ Tambah Menu Baru</button>
      <div style="display:flex; gap:8px; margin-left:auto">
        <input v-model="newCat" placeholder="Kategori baru" @keyup.enter="makeCategory" />
        <button class="primary" @click="makeCategory">Tambah Kategori</button>
      </div>
    </div>

    <div v-if="adding" style="border:1px solid #FDE68A; background:#FFFBEB; padding:14px; border-radius:10px; margin-bottom:16px; max-width:640px">
      <h3 style="margin:0 0 10px">Menu baru</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
        <label>Nama menu
          <input v-model="form.name" placeholder="Kopi Susu" />
        </label>
        <label>Kode
          <input v-model="form.code" placeholder="otomatis dari nama jika kosong" />
        </label>
        <label>Kategori
          <select v-model="form.category_id">
            <option value="" disabled>— pilih kategori —</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </label>
        <label>Harga (Rp)
          <input v-model.number="form.price" type="number" min="0" step="500" />
        </label>
        <label style="grid-column:1 / -1">Catatan
          <input v-model="form.note" placeholder="opsional" />
        </label>
        <label style="flex-direction:row; align-items:center; gap:8px">
          <input type="checkbox" v-model="form.is_active" />
          Aktif dijual
        </label>
      </div>
      <div style="margin-top:12px; display:flex; gap:8px">
        <button class="primary" @click="createMenu">Simpan</button>
        <button class="ghost" @click="adding = false">Batal</button>
      </div>
    </div>

    <p v-if="err" style="color:#DC2626">{{ err }}</p>
    <div v-if="loading" class="card"><Skeleton :rows="8" :height="18" /></div>
    <table v-else>
      <tr><th>Kode</th><th>Nama</th><th>Kategori</th><th style="text-align:right">Harga</th><th>Aktif</th><th></th></tr>
      <tr v-for="i in items" :key="i.id">
        <td style="color:#78716C">{{ i.code }}</td>
        <td><input v-model="i.name" style="border:none; background:transparent; width:100%" /></td>
        <td>
          <select v-model="i.category_id" style="border:none; background:transparent">
            <option :value="null">—</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </td>
        <td style="text-align:right">
          <input v-model.number="i.price" style="border:none; background:transparent; text-align:right; width:110px" />
        </td>
        <td><input type="checkbox" v-model="i.is_active" /></td>
        <td><button class="primary" @click="save(i)">Simpan</button></td>
      </tr>
      <tr v-if="!items.length"><td colspan="6" style="color:#78716C">Belum ada menu — pakai Tambah Menu Baru di atas.</td></tr>
    </table>
  </div>
</template>

<style scoped>
button.ghost { background: transparent; border: 1px solid #FDE68A; color: #92400E; padding: 9px 14px; border-radius: 8px; cursor: pointer; }
label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
</style>
