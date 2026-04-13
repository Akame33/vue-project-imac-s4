<template>
    <section>
        <p v-if="loading" class="status">Loading countries...</p>
        <p v-else-if="error" class="status error">{{ error }}</p>

        <template v-else>
            <section class="controls">
                <label>
                    Region:
                    <select v-model="selectedRegion">
                        <option value="All">All</option>
                        <option v-for="region in regions" :key="region" :value="region">
                            {{ region }}
                        </option>
                    </select>
                </label>

                <label>
                    Sort by:
                    <select v-model="sortOption">
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                    </select>
                </label>
            </section>

            <section class="preview-grid">
                <CountryListCard v-for="country in sortedCountries" :key="country.id" :name="country.name"
                    :flagUrl="country.flagUrl" :region="country.region" :population="country.population" />
            </section>
        </template>
    </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import CountryListCard from "../components/CountryListCard.vue"
import { getCountryData } from "../services/api/flagsAPI.js"

const countries = ref([])
const loading = ref(false)
const error = ref("")

const selectedRegion = ref(localStorage.getItem("listRegion") || "All")
const sortOption = ref(localStorage.getItem("listSortOption") || "name-asc")

watch(selectedRegion, (value) => {
    localStorage.setItem("listRegion", value)
})

watch(sortOption, (value) => {
    localStorage.setItem("listSortOption", value)
})

const regions = computed(() => {
    const uniqueRegions = [...new Set(countries.value.map((country) => country.region))]
    return uniqueRegions.sort((a, b) => a.localeCompare(b))
})

const filteredCountries = computed(() => {
    if (selectedRegion.value === "All") return countries.value
    return countries.value.filter((country) => country.region === selectedRegion.value)
})

const sortedCountries = computed(() => {
    const result = [...filteredCountries.value]

    if (sortOption.value === "name-asc") {
        result.sort((a, b) => a.name.localeCompare(b.name))
    } else {
        result.sort((a, b) => b.name.localeCompare(a.name))
    }

    return result
})

async function loadCountries() {
    loading.value = true
    error.value = ""

    try {
        countries.value = await getCountryData()
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

.controls select {
    padding: 10px 12px;
    font-size: 1rem;
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
}

.status {
    margin: 20px 0;
}

.error {
    color: #dc2626;
}
</style>