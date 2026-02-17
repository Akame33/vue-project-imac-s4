<template>
  <div>
    <h1>Board Game Selector</h1>

    <div id="boardgame-gallery">
      <BoardGameCard
        v-for="game in games" 
        :key="game.id"
        :title="game.title"
        :players="game.players"
        :minutes="game.minutes"
        @select="onSelect"
      />
    </div>
  </div>

  <p v-if="selectedTitle">Jeu selectionné : {{ selectedTitle }}</p>

</template>

<script setup>
import BoardGameCard from "./components/BoardGameCard.vue"
import initialData from "./BoardGameData.js"
import { ref } from "vue" // pour créer des données réactives

const games = ref(initialData) // état réactif
const selectedTitle = ref(null) // état réactif 

// onSelect(gameTitle) Quand une carte de BoardGameCard (je crois) émet select, App.vue récupère le titre et l’affiche en console.
function onSelect(gameTitle) {
  selectedTitle.value = gameTitle // pour la modification réactive
  console.log("Selected:", gameTitle)
}
</script>

<style scoped>
#boardgame-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
