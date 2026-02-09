<template>
  <div>
    <h1>Board Games</h1>

    <div id="boardgame-gallery">
      <BoardGameCard
        v-for="game in boardGamesData"
        :key="game.id"
        :title="game.title"
        :players="game.players"
        :minutes="game.minutes"
        @select="onSelect"
      />
    </div>
  </div>
</template>

<script setup>
import BoardGameCard from "./components/BoardGameCard.vue"
import boardGamesData from "./BoardGameData.js"

function onSelect(gameTitle) {
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
