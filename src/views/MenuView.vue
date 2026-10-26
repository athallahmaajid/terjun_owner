<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../services/api'

const items = ref([])
const categories = ref([])
const err = ref('')
const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

async function load() {
  try {
    items.value = await api.get('/menu/items')
    categories.value = await api.get('/menu/categories')
  } catch (e) { err.value = e.message }
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

async function makeCategory() {
  await api.post('/menu/categories', { name: newCat.value })
  newCat.value = ''
  await load()
}

const newCat = ref('')
</script>

<template>
  <div>
    <div style="display:flex; gap:10px; margin-bottom:14px">
      <input v-model="newCat" placeholder="Kategori baru" @keyup.enter="makeCategory" />
      <button class="primary" @click="makeCategory">Tambah Kategori</button>
    </div>
    <p v-if="err" style="color:#DC2626">{{ err }}</p>
    <table>
      <tr><th>Nama</th><th>Kategori</th><th style="text-align:right">Harga</th><th>Aktif</th><th></th></tr>
      <tr v-for="i in items" :key="i.id">
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
    </table>
  </div>
</template>
