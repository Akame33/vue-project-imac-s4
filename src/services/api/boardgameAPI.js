const getGameData = async function(query) {
    const response = await fetch(`https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`)

    
    if (response.status == 200) {
        const data = await response.json()
        console.log(data)
        return data
    } else {
        throw new Error(response.statusText)
    }
}
export {getGameData}