<template>
    <section>
        <p v-if="loading" class="status">Loading countries...</p>
        <p v-else-if="error" class="status error">{{ error }}</p>

        <template v-else>
            <section class="controls">
                <label>
                    Region:
                    <select v-model="quizRegion" @change="restartQuiz">
                        <option value="All">All</option>
                        <option v-for="region in regions" :key="region" :value="region">
                            {{ region }}
                        </option>
                    </select>
                </label>

                <label>
                    Difficulty:
                    <select v-model="quizDifficulty" @change="restartQuiz">
                        <option value="all">All</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </label>

                <button class="restart-button" @click="restartQuiz">
                    Restart quiz
                </button>
            </section>

            <section class="score-bar">
                <p><strong>Result:</strong> {{ score }}/{{ questionNumber - 1 }}</p>
                <p><strong>Question:</strong> {{ questionNumber }}/{{ maxQuestions }}</p>
            </section>

            <p v-if="sortedQuizCountries.length < 4" class="status">
                Not enough countries to build a quiz.
            </p>

            <section v-else-if="quizFinished" class="final-screen">
                <h2>Quiz finished</h2>
                <p>Your result : {{ score }}/{{ maxQuestions }}</p>
                <button class="restart-button" @click="restartQuiz">Restart</button>
            </section>

            <transition name="fade" mode="out-in">
                <CountryCard v-if="currentQuestion && !quizFinished" :key="currentQuestion.correctAnswer"
                    :flagUrl="currentQuestion.flagUrl" :options="currentQuestion.options"
                    :correctAnswer="currentQuestion.correctAnswer" :answered="answered" :selectedAnswer="selectedAnswer"
                    :statusMessage="statusMessage" @select-answer="selectAnswer" @next-question="nextQuestion" />
            </transition>
        </template>
    </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import CountryCard from "../components/CountryCard.vue"
import { getCountryData } from "../services/api/flagsAPI.js"

const countries = ref([])
const loading = ref(false)
const error = ref("")

const quizRegion = ref(localStorage.getItem("quizRegion") || "All")
const quizDifficulty = ref(localStorage.getItem("quizDifficulty") || "all")

const score = ref(0)
const questionNumber = ref(1)
const maxQuestions = 10
const currentQuestion = ref(null)
const answered = ref(false)
const selectedAnswer = ref("")
const statusMessage = ref("")
const quizFinished = ref(false)
const usedCountryIds = ref([])

watch(quizRegion, (value) => {
    localStorage.setItem("quizRegion", value)
})

watch(quizDifficulty, (value) => {
    localStorage.setItem("quizDifficulty", value)
})

const regions = computed(() => {
    const uniqueRegions = [...new Set(countries.value.map((country) => country.region))]
    return uniqueRegions.sort((a, b) => a.localeCompare(b))
})

const filteredQuizCountries = computed(() => {
    let result = countries.value

    if (quizRegion.value !== "All") {
        result = result.filter((country) => country.region === quizRegion.value)
    }

    if (quizDifficulty.value !== "all") {
        result = result.filter((country) => country.difficulty === quizDifficulty.value)
    }

    return result
})

const sortedQuizCountries = computed(() => {
    return [...filteredQuizCountries.value].sort((a, b) => a.name.localeCompare(b.name))
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
        statusMessage.value = "Well done!"
    } else {
        statusMessage.value = `Nice try, the correct answer was ${currentQuestion.value.correctAnswer}.`
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
        error.value = err.message || "An unexpected error occurred."
    } finally {
        loading.value = false
    }
}

onMounted(loadCountries)
</script>

<style scoped>
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

.final-screen {
    padding: 24px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 16px;
    text-align: center;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.35s ease, transform 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

@media (max-width: 640px) {

    .controls,
    .score-bar {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>