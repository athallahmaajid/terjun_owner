<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from '../services/api'

const data = ref(null)
const err = ref('')
const from = ref('')
const to = ref('')

const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

async function load() {
  err.value = ''
  try {
    const qs = []
    if (from.value) qs.push(`date_from=${from.value}`)
    if (to.value) qs.push(`date_to=${to.value}`)
    data.value = await api.get(`/dashboard/summary${qs.length ? '?' + qs.join('&') : ''}`)
  } catch (e) {
    err.value = e.message
  }
}
onMounted(load)

const maxHour = computed(() =>
  Math.max(1, ...(data.value?.sales_per_hour || []).map((h) => h.total)))
const maxCat = computed(() =>
  Math.max(1, ...(data.value?.category_sales || []).map((c) => c.revenue)))
</script>

<template>
  <div>
    <div style="display:flex; gap:10px; margin-bottom:14px">
      <input v-model="from" type="date" @change="load" />
      <input v-model="to" type="date" @change="load" />
      <button class="primary" @click="load">Muat</button>
    </div>
    <p v-if="err" style="color:#DC2626">{{ err }}</p>
    <template v-if="data">
      <div class="kpis">
        <div class="card" v-for="k in [
          ['Gross Sales', rupiah(data.kpi?.gross_sales)],
          ['Net Sales', rupiah(data.kpi?.net_sales)],
          ['Transactions', data.kpi?.transactions ?? 0],
          ['Average / Trx', rupiah(data.kpi?.average_transaction)],
          ['Active Orders', data.kpi?.active_orders ?? 0],
        ]" :key="k[0]">
          <div class="kpi-label">{{ k[0].toUpperCase() }}</div>
          <div class="kpi-value">{{ k[1] }}</div>
        </div>
      </div>

      <div class="duo">
        <div class="card">
          <h3>Penjualan per jam</h3>
          <div class="bars">
            <div v-for="h in data.sales_per_hour" :key="h.hour" class="barwrap">
              <div class="bar" :style="{ height: (h.total / maxHour * 100) + '%' }" :title="`${h.hour}:00 — ${rupiah(h.total)}`" />
              <small v-if="h.hour % 3 === 0">{{ h.hour }}</small>
            </div>
          </div>
        </div>
        <div class="card">
          <h3>Per kategori</h3>
          <div v-for="c in data.category_sales.slice(0, 6)" :key="c.name" class="crow">
            <span>{{ c.name }}</span>
            <div class="cbar"><div :style="{ width: (c.revenue / maxCat * 100) + '%' }" /></div>
            <b style="min-width:96px; text-align:right">{{ rupiah(c.revenue) }}</b>
          </div>
        </div>
      </div>

      <div class="duo">
        <div class="card">
          <h3>Produk teratas</h3>
          <table>
            <tr><th>Produk</th><th style="text-align:right">Qty</th><th style="text-align:right">Pendapatan</th></tr>
            <tr v-for="t in data.top_products_revenue" :key="t.name">
              <td>{{ t.name }}</td>
              <td style="text-align:right">{{ t.qty }}</td>
              <td style="text-align:right">{{ rupiah(t.revenue) }}</td>
            </tr>
          </table>
        </div>
        <div class="card">
          <h3>Metode bayar</h3>
          <table>
            <tr><th>Metode</th><th style="text-align:right">Jumlah</th><th style="text-align:right">Total</th></tr>
            <tr v-for="p in data.payment_methods" :key="p.method">
              <td>{{ p.method }}</td>
              <td style="text-align:right">{{ p.count }}</td>
              <td style="text-align:right">{{ rupiah(p.amount) }}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="duo">
        <div class="card">
          <h3>Stok rendah</h3>
          <p v-if="!data.low_stock?.length" style="color:#16A34A">Aman — semuanya di atas ambang.</p>
          <table v-else>
            <tr><th>Bahan</th><th style="text-align:right">Stok</th><th style="text-align:right">Min</th></tr>
            <tr v-for="i in data.low_stock" :key="i.id">
              <td>{{ i.name }}</td>
              <td style="text-align:right">{{ i.stock_qty }} {{ i.base_unit }}</td>
              <td style="text-align:right">{{ i.min_stock }}</td>
            </tr>
          </table>
        </div>
        <div class="card">
          <h3>Aktivitas terkini</h3>
          <table>
            <tr><th>Waktu</th><th>Aktivitas</th></tr>
            <tr v-for="(a, i) in (data.recent_activity || []).slice(0, 8)" :key="i">
              <td>{{ (a.created_at || '').slice(11, 16) }}</td>
              <td>{{ a.title }}</td>
            </tr>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px; }
.kpi-label { font-size: 11px; color: #78716C; letter-spacing: 1px; }
.kpi-value { font-size: 20px; font-weight: 800; color: #92400E; margin-top: 6px; }
.duo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
h3 { margin: 0 0 12px; font-size: 14px; color: #92400E; }
.bars { display: flex; align-items: flex-end; gap: 3px; height: 120px; }
.barwrap { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.bar { width: 100%; background: #B45309; border-radius: 3px 3px 0 0; min-height: 2px; }
small { color: #78716C; font-size: 9px; }
.crow { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; }
.crow span { min-width: 100px; }
.cbar { flex: 1; height: 10px; background: #FEF3C7; border-radius: 5px; overflow: hidden; }
.cbar > div { height: 100%; background: #92400E; }
</style>
