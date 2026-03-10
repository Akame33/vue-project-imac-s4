<template>
  <div class="app">
    <header class="app-header">
      <h1>Quizz Drapeaux</h1>
      <p>Explore les drapeaux du monde et teste tes connaissances</p>
    </header>

    <nav class="tabs">
      <button class="tab-button" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
        Liste des drapeaux
      </button>

      <button class="tab-button" :class="{ active: activeTab === 'quiz' }" @click="activeTab = 'quiz'">
        Quizz
      </button>
    </nav>

    <main>
      <p v-if="loading" class="status">Chargement des pays...</p>
      <p v-else-if="error" class="status error">{{ error }}</p>

      <template v-else>
        <!-- LISTE DES DRAPEAUX -->
        <section v-if="activeTab === 'list'">
          <section class="controls">
            <label>
              Région :
              <select v-model="listRegion">
                <option value="All">Toutes</option>
                <option v-for="region in regions" :key="region" :value="region">
                  {{ region }}
                </option>
              </select>
            </label>

            <label>
              Trier par :
              <select v-model="listSortOption">
                <option value="name-asc">Nom A-Z</option>
                <option value="name-desc">Nom Z-A</option>
              </select>
            </label>
          </section>

          <section class="preview-grid">
            <CountryListCard v-for="country in sortedListCountries" :key="country.id" :name="country.name"
              :flagUrl="country.flagUrl" :region="country.region" :population="country.population" />
          </section>
        </section>

        <!-- QUIZ -->
        <section v-else-if="activeTab === 'quiz'">
          <section class="controls">
            <label>
              Région :
              <select v-model="quizRegion" @change="restartQuiz">
                <option value="All">Toutes</option>
                <option v-for="region in regions" :key="region" :value="region">
                  {{ region }}
                </option>
              </select>
            </label>
            <label>
              Difficulté :
              <select v-model="quizDifficulty" @change="restartQuiz">
                <option value="all">Toutes</option>
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </label>

            <button class="restart-button" @click="restartQuiz">
              Recommencer le quiz
            </button>
          </section>

          <section class="score-bar">
            <p><strong>Score :</strong> {{ score }}/{{ questionNumber - 1 }}</p>
            <p><strong>Question :</strong> {{ questionNumber }}/{{ maxQuestions }}</p>
          </section>

          <p v-if="sortedQuizCountries.length < 4" class="status">
            Pas assez de pays pour faire un quiz.
          </p>

          <section v-else-if="quizFinished" class="final-screen">
            <h2>Quiz terminé</h2>
            <p>Votre score : {{ score }}/{{ maxQuestions }}</p>
            <button class="restart-button" @click="restartQuiz">Rejouer</button>
          </section>

          <CountryCard v-else-if="currentQuestion" :flagUrl="currentQuestion.flagUrl" :options="currentQuestion.options"
            :correctAnswer="currentQuestion.correctAnswer" :answered="answered" :selectedAnswer="selectedAnswer"
            :statusMessage="statusMessage" @select-answer="selectAnswer" @next-question="nextQuestion" />
        </section>
      </template>
    </main>

    <footer class="app-footer">
      <p>Alice JACQUES • IMAC • Projet Vue.js • Quiz drapeaux</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import CountryCard from "./components/CountryCard.vue"
import CountryListCard from "./components/CountryListCard.vue"
import { getCountryData } from "./services/api/flagsAPI.js"

const countries = ref([])
const loading = ref(false)
const error = ref("")

const activeTab = ref("list")

const listRegion = ref(localStorage.getItem("listRegion") || "All")
const listSortOption = ref(localStorage.getItem("listSortOption") || "name-asc")

const quizRegion = ref(localStorage.getItem("quizRegion") || "All")

const score = ref(0)
const questionNumber = ref(1)
const maxQuestions = 10
const currentQuestion = ref(null)
const answered = ref(false)
const selectedAnswer = ref("")
const statusMessage = ref("")
const quizFinished = ref(false)
const usedCountryIds = ref([])
const quizDifficulty = ref("all")

watch(listRegion, (value) => {
  localStorage.setItem("listRegion", value)
})

watch(listSortOption, (value) => {
  localStorage.setItem("listSortOption", value)
})

watch(quizRegion, (value) => {
  localStorage.setItem("quizRegion", value)
})

const regions = computed(() => {
  const uniqueRegions = [...new Set(countries.value.map((country) => country.region))]
  return uniqueRegions.sort((a, b) => a.localeCompare(b))
})

const filteredListCountries = computed(() => {
  if (listRegion.value === "All") return countries.value
  return countries.value.filter((country) => country.region === listRegion.value)
})

const sortedListCountries = computed(() => {
  const result = [...filteredListCountries.value]

  if (listSortOption.value === "name-asc") {
    result.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    result.sort((a, b) => b.name.localeCompare(a.name))
  }

  return result
})

const filteredQuizCountries = computed(() => {

  let result = countries.value

  if (quizRegion.value !== "All") {
    result = result.filter(c => c.region === quizRegion.value)
  }

  if (quizDifficulty.value !== "all") {
    result = result.filter(c => c.difficulty === quizDifficulty.value)
  }

  return result
})

const sortedQuizCountries = computed(() => {
  return [...filteredQuizCountries.value].sort((a, b) =>
    a.name.localeCompare(b.name)
  )
})

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function shuffle(array) {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function buildQuestion() {
  const pool = sortedQuizCountries.value

  if (pool.length < 4) {
    currentQuestion.value = null
    return
  }

  const availableCountries = pool.filter(
    (country) => !usedCountryIds.value.includes(country.id)
  )

  if (availableCountries.length === 0) {
    quizFinished.value = true
    currentQuestion.value = null
    return
  }

  const correctCountry = getRandomItem(availableCountries)
  usedCountryIds.value.push(correctCountry.id)

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
    score.value++
    statusMessage.value = "Bien joué !"
  } else {
    statusMessage.value = `Bien tenté, la bonne réponse était ${currentQuestion.value.correctAnswer}.`
  }
}

function nextQuestion() {
  if (questionNumber.value >= maxQuestions) {
    quizFinished.value = true
    return
  }

  questionNumber.value++
  buildQuestion()
}

function restartQuiz() {
  score.value = 0
  questionNumber.value = 1
  quizFinished.value = false
  usedCountryIds.value = []
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

onMounted(loadCountries)
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
  color: #313131;
}

.tabs {
  display: flex;
  gap: 12px;
  margin: 20px 0 24px;
  flex-wrap: wrap;
}

.tab-button {
  border: none;
  border-radius: 12px;
  background: #d9d9d9;
  color: #222;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 1rem;
}

.tab-button.active {
  background: #313131;
  color: white;
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
  background: #313131;
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

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.final-screen {
  padding: 24px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 16px;
  text-align: center;
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