<template>
  <button class="card" @click="handleClick">
    <h2>{{ title }}</h2>

    <p>{{ players }} players - {{ minutes }} min</p>

    <p v-if="minutes >= 60">Long game</p>
    <p v-else>Short game</p>
  </button>
</template>

<script setup>

// props : données reçues du parent. Donc le parent App.vue lui donne title players et minutes
const props = defineProps({
  title: String,
  players: Number,
  minutes: Number
})

// gestion d'evenement, déclanchement de l'evenement select quand on clique sur la carte
const emit = defineEmits(['select'])

function handleClick() {
  emit('select', props.title)
}
</script>

<style scoped>
.card {
  border: 1px solid #333;
  border-radius: 10px;
  background-color: blue;
  color: white;
  padding: 10px 20px;
}
</style>
