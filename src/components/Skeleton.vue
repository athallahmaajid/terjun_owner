<template>
  <div class="sk-rows">
    <div
      v-for="n in rows"
      :key="n"
      class="sk"
      :style="{ height: height + 'px', animationDelay: (n - 1) * 0.06 + 's' }"
    />
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Number, default: 4 },
  height: { type: Number, default: 14 },
})
</script>

<style scoped>
.sk-rows { display: flex; flex-direction: column; gap: 10px; }
.sk {
  border-radius: 8px;
  background: linear-gradient(90deg, #FDE68A 0%, #FEF3C7 50%, #FDE68A 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
