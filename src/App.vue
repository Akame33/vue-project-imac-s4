<template>
  <div class="app">
    <AppHeader />
    <AppNavigation />

    <main class="main-content">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from "./components/AppHeader.vue"
import AppNavigation from "./components/AppNavigation.vue"
import AppFooter from "./components/AppFooter.vue"
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px 40px;
  font-family: Arial, Helvetica, sans-serif;
  color: #222;
}

.main-content {
  min-height: 60vh;
}
</style>