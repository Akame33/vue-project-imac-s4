export async function getCountryData() {
  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,flags,region,population,cca2"
  )

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()

  return data
    .filter((country) => country.name?.common && country.flags?.png)
    .map((country, index) => ({
      id: country.cca2 || String(index),
      name: country.name.common,
      flagUrl: country.flags.png,
      region: country.region || "Other",
      population: country.population || 0
    }))
}