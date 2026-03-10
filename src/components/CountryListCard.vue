<template>
  <article class="country-card">
    <img :src="flagUrl" :alt="name" class="country-image" />
    <div class="country-content">
      <h3>{{ name }}</h3>
      <p>{{ region }}</p>
      <p>{{ population.toLocaleString() }} habitants</p>
    </div>
  </article>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  flagUrl: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  population: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.country-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.country-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
  background: #f7f7f7;
}

.country-content {
  padding: 12px;
}

.country-content h3,
.country-content p {
  margin: 0 0 8px;
}
</style>