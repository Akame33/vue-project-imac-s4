<template>
  <div class="app">
    <header class="app-header">
      <h1>Quizz Drapeaux</h1>
      <p>Teste tes connaissances en drapeaux</p>
    </header>

    <main>
      <section class="controls">
        <label>
          Région :
          <select v-model="selectedRegion" @change="restartQuiz">
            <option value="All">All</option>
            <option v-for="region in regions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </label>

        <label>
          Trier par :
          <select v-model="sortOption" @change="restartQuiz">
            <option value="name-asc">Nom A-Z</option>
            <option value="name-desc">Nom Z-A</option>
            <option value="population-desc">Population élevée à basse</option>
            <option value="population-asc">Population basse à élevée</option>
          </select>
        </label>

        <button class="restart-button" @click="restartQuiz">Recommencer le quizz</button>
      </section>

      <section class="score-bar">
        <p><strong>Score :</strong> {{ score }}/{{ questionNumber - 1 }}</p>
        <p><strong>Meilleur score :</strong> {{ bestScore }}</p>
        <p><strong>Question :</strong> {{ questionNumber }}/{{ maxQuestions }}</p>
      </section>

      <p v-if="loading" class="status">Chargement des pays...</p>
      <p v-else-if="error" class="status error">{{ error }}</p>
      <p v-else-if="sortedCountries.length < 10" class="status"> Pas assez de pays pour en faire un quizz</p>

      <section v-else-if="quizFinished" class="final-screen">
        <h2>Quizz terminé</h2>
        <p>Votre score: {{ score }}/{{ maxQuestions }}</p>
        <button class="restart-button" @click="restartQuiz">Rejouer</button>
      </section>

      <CountryCard
        v-else-if="currentQuestion"
        :flagUrl="currentQuestion.flagUrl"
        :options="currentQuestion.options"
        :correctAnswer="currentQuestion.correctAnswer"
        :answered="answered"
        :selectedAnswer="selectedAnswer"
        :statusMessage="statusMessage"
        @select-answer="selectAnswer"
        @next-question="nextQuestion"
      />

      <section class="country-preview" v-if="sortedCountries.length">
        <h2>Aperçu des pays</h2>
        <p class="preview-text">
          Cela provient de l'API RestCountries. Elle est filtrée par région et triée selon l'ordre que vous avez sélectionné.
        </p>

        <div class="preview-grid">
          <article
            v-for="country in sortedCountries.slice(0, 300)"
            :key="country.id"
            class="preview-card"
          >
            <img :src="country.flagUrl" :alt="country.name" />
            <h3>{{ country.name }}</h3>
            <p>{{ country.region }}</p>
            <p>{{ country.population.toLocaleString() }} Population</p>
          </article>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>Alice JACQUES • IMAC • Projet Vue.js • Quizz drapeaux</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import CountryCard from "./components/CountryCard.vue"
import { getCountryData } from "./services/api/flagsAPI.js"

const countries = ref([])
const loading = ref(false)
const error = ref("")

const selectedRegion = ref(localStorage.getItem("selectedRegion") || "All")
const sortOption = ref(localStorage.getItem("sortOption") || "name-asc")
const bestScore = ref(Number(localStorage.getItem("bestScore")) || 0)

const score = ref(0)
const questionNumber = ref(1)
const maxQuestions = 10
const currentQuestion = ref(null)
const answered = ref(false)
const selectedAnswer = ref("")
const statusMessage = ref("")
const quizFinished = ref(false)

watch(selectedRegion, (value) => {
  localStorage.setItem("selectedRegion", value)
})

watch(sortOption, (value) => {
  localStorage.setItem("sortOption", value)
})

watch(bestScore, (value) => {
  localStorage.setItem("bestScore", String(value))
})

const regions = computed(() => {
  const uniqueRegions = [...new Set(countries.value.map((country) => country.region))]
  return uniqueRegions.sort((a, b) => a.localeCompare(b))
})

const filteredCountries = computed(() => {
  if (selectedRegion.value === "All") {
    return countries.value
  }

  return countries.value.filter((country) => country.region === selectedRegion.value)
})

const sortedCountries = computed(() => {
  const result = [...filteredCountries.value]

  switch (sortOption.value) {
    case "name-asc":
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "name-desc":
      result.sort((a, b) => b.name.localeCompare(a.name))
      break
    case "population-asc":
      result.sort((a, b) => a.population - b.population)
      break
    case "population-desc":
      result.sort((a, b) => b.population - a.population)
      break
  }

  return result
})

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function shuffle(array) {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function buildQuestion() {
  const pool = sortedCountries.value

  if (pool.length < 4) {
    currentQuestion.value = null
    return
  }

  const correctCountry = getRandomItem(pool)

  const wrongOptions = shuffle(
    pool.filter((country) => country.id !== correctCountry.id)
  )
    .slice(0, 3)
    .map((country) => country.name)

  const options = shuffle([correctCountry.name, ...wrongOptions])

  currentQuestion.value = {
    flagUrl: correctCountry.flagUrl,
    correctAnswer: correctCountry.name,
    options
  }

  answered.value = false
  selectedAnswer.value = ""
  statusMessage.value = ""
}

function selectAnswer(option) {
  if (answered.value || !currentQuestion.value) return

  selectedAnswer.value = option
  answered.value = true

  if (option === currentQuestion.value.correctAnswer) {
    score.value += 1
    statusMessage.value = "Bien joué !"
  } else {
    statusMessage.value = `Bien tenté, la réponse correcte était ${currentQuestion.value.correctAnswer}.`
  }
}

function nextQuestion() {
  if (questionNumber.value >= maxQuestions) {
    quizFinished.value = true

    if (score.value > bestScore.value) {
      bestScore.value = score.value
    }

    return
  }

  questionNumber.value += 1
  buildQuestion()
}

function restartQuiz() {
  score.value = 0
  questionNumber.value = 1
  quizFinished.value = false
  buildQuestion()
}

async function loadCountries() {
  loading.value = true
  error.value = ""

  try {
    countries.value = await getCountryData()
    restartQuiz()
  } catch (err) {
    error.value = err.message || "Une erreur inattendue est survenue."
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCountries()
})
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

.app-header {
  padding: 24px 0 16px;
}

.app-header h1 {
  margin: 0 0 8px;
  font-size: 3rem;
}

.app-header p {
  margin: 0;
  color: #555;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
  margin: 20px 0;
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.controls select,
.restart-button {
  padding: 10px 12px;
  font-size: 1rem;
}

.restart-button {
  border: none;
  border-radius: 12px;
  background: #111827;
  color: white;
  cursor: pointer;
}

.score-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 16px 0 24px;
}

.score-bar p {
  margin: 0;
}

.status {
  margin: 20px 0;
}

.error {
  color: #dc2626;
}

.final-screen {
  padding: 24px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 16px;
  text-align: center;
}

.country-preview {
  margin-top: 36px;
}

.preview-text {
  color: #555;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.preview-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 14px;
  overflow: hidden;
  padding-bottom: 12px;
}

.preview-card img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}

.preview-card h3,
.preview-card p {
  margin: 10px 12px 0;
}

.app-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
  text-align: center;
  color: #666;
}

@media (max-width: 640px) {
  .app-header h1 {
    font-size: 2.2rem;
  }

  .controls,
  .score-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>