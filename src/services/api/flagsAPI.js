export async function getCountryData() {
  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,flags,region,population,cca2"
  )

  const data = await response.json()

  return data
    .filter((country) => country.name?.common && country.flags?.png)
    .map((country, index) => {

      let difficulty = "medium"

      if (country.population > 50000000) difficulty = "easy"
      else if (country.population < 10000000) difficulty = "hard"

      return {
        id: country.cca2 || String(index),
        name: country.name.common,
        flagUrl: country.flags.png,
        region: country.region || "Other",
        population: country.population || 0,
        difficulty
      }
    })
}