/* This version works with real API
1. Displays a list of pokemons
2. Displays more details for a pokemon if we click on it
3. Has a basic pagination working
4. Can search by id, or search by name
*/

const mainElement = document.querySelector("main")
const buttonPrev = document.getElementById("button-prev")
const buttonNext = document.getElementById("button-next")

// declare a variable to store if the script is busy processing
let isBusy = false

// navUrls stores urls to the next and previous pages
let navUrls = {
    last: "https://pokeapi.co/api/v2/pokemon/",
    next: "https://pokeapi.co/api/v2/pokemon/",
    previous: "https://pokeapi.co/api/v2/pokemon/"
}

// set navigation urls
function setUrls(newUrls) {
    if (newUrls.next != null) navUrls.next = newUrls.next
    else navUrls.next = "https://pokeapi.co/api/v2/pokemon/"
    
    if (newUrls.previous != null) navUrls.previous = newUrls.previous
    else {
        // fix bug with last page, being incorrect
        navUrls.previous = "https://pokeapi.co/api/v2/pokemon/?offset=1140&limit=20"
    }
}

// add navigation events:
buttonNext.addEventListener("click", () => {
    displayAllPokemons(navUrls.next)
})
buttonPrev.addEventListener("click", () => {
    displayAllPokemons(navUrls.previous)
})


// add event to h1(poke dex)===> return to the first page
let buttonPokeDex= document.getElementById('pokedex_h1')
buttonPokeDex.addEventListener('click',()=>displayAllPokemons('https://pokeapi.co/api/v2/pokemon/') )


// on page load display the first page
displayAllPokemons(navUrls.next)

// asyncrounsly get data from url and return a promise
async function getApi(url) {
    const request = await fetch(url)
    const data = await request.json()

    return data
}

// search functionality:
const searchText = document.getElementById("search-text")
const searchButton = document.getElementById("search-button")

// add event listener to search-input field
searchText.addEventListener("input", (event) => {
    const searchTerm = event.target.value
})
// add event listener to searchButton
searchButton.addEventListener("click", () => {
    const searchTerm = searchText.value

    // search by id if searchTerm is a number, otherwise searchByName
    if (parseInt(searchTerm) == searchTerm) searchById(searchTerm)
    else searchByName(searchTerm)
})

// search by id
async function searchById(id) {
    // first check if isBusy is true, if so just return (it terminates this function from running any code)
    if (isBusy) return
    // immediately set isBusy to true
    isBusy = true

    // default url:
    let url = `https://pokeapi.co/api/v2/pokemon/${id}`
    // await and get the data from the url 
    const pokemonDetails = await getApi(url)
    // if found display the pokemon
    if (pokemonDetails) displayPokemonDetails(pokemonDetails)

    isBusy = false
}

// search by name
async function searchByName(searchTerm) {
    searchTerm = searchTerm.toLowerCase().trim()
    // first check if isBusy is true, if so just return (it terminates this function from running any code)
    if (isBusy) return
    // immediately set isBusy to true
    isBusy = true
    // loop through all pokemon-index pages:
    let url = "https://pokeapi.co/api/v2/pokemon/?limit=1154"
    // await and get the data from the url 
    const data = await getApi(url)


    /* 
    // for each loops through all results, then we use an if statement to check if the pokemon is found
    data.results.forEach(async pokemon => {
        // if there is a pokemon matching the searchterm:
        if (pokemon.name == searchTerm) {
            const pokemonDetails = await getApi(pokemon.url)
            // to be sure we first check if the api returned data, then we display the pokemon details
            if (pokemonDetails) displayPokemonDetails(pokemonDetails)
        }
    }) */

    // here we use .find method, to see if a pokemon is found, it does make it easier:
    let pokemonFound = data.results.find(pokemon => pokemon.name == searchTerm)

    if (pokemonFound) {
        const pokemonDetails = await getApi(pokemonFound.url)
        // if found display the pokemon
        if (pokemonDetails) displayPokemonDetails(pokemonDetails)
    }
    else {
        // added this else statement, just to display "No pokemon found!" if there was no pokemon found.
        mainElement.innerHTML = `
        <div class="card card-big">
            <h2 style="color: red;">No pokemon found!</h2>
        </div>
        `
    }

    isBusy = false
}

// function to display all pokemons, takes a url as parameter
async function displayAllPokemons(url) {
    // first check if isBusy is true, if so just return (it terminates this function from running any code)
    if (isBusy) return
    // immediately set isBusy to true
    isBusy = true

    // await and get the data from the url 
    const data = await getApi(url)
    // update the urls (for next / previous page links)
    setUrls(data)

    // clear the page content
    mainElement.innerHTML = ""

    // earlier we used .forEach to loop through the results and display them, 
    // it caused an issue, because forEach does not get the results in the correct order
    // data.results.forEach(async (pokemon) => { // note to self: comment it

    // loop through each element in the data.results array, inside the forEach-method we label the element as pokemon and then open the => arrow function {}
    for (pokemon of data.results) {

        // await and get the pokemonDetails from the url 
        const pokemonDetails = await getApi(pokemon.url)
        const image = pokemonDetails.sprites.front_default

        // create and append the pokemon card elements:
        const pokemonContainer = document.createElement("div")
        pokemonContainer.className = "poke-list"

        const pokemonCard = document.createElement("div")
        pokemonCard.className = "card"
        pokemonContainer.append(pokemonCard)

        const pokemonTitle = document.createElement("h2")
        pokemonTitle.textContent = `${pokemonDetails.id} - ${pokemon.name}`

        const pokemonImage = document.createElement("img")
        // because some pokemons don't have an image, we check first its image is null, and if so we just write "No image found!" as the alt-text
        if (image) pokemonImage.src = image
        else pokemonImage.alt = "No image found!"

        pokemonCard.append(pokemonTitle, pokemonImage)
        mainElement.append(pokemonContainer)
        
        // add a click-event listener to the pokemon card
        pokemonContainer.addEventListener("click", (event) => {
            displayPokemonDetails(pokemonDetails)
        })
    }
    // set isBusy to false so we can process data again (ie: click buttons)
    isBusy = false
}


//==> When clicking on a big card, there is a transition to another big card
// bag ---> I can't take this element and hang an event on it
// let bigCard = document.querySelector('.card card-big')
// bigCard.addEventListener("click", (event) =>
//     console.log(event.target))

// function to display one pokemons details, it takes one parameter:
// that's an object with all the details about that pokemon
function displayPokemonDetails(pokemonDetails) {

    let types = ""
    pokemonDetails.types.forEach(type => {
        types += `<h3>${type.type.name}</h3>`
    })
    
    let stats = ""
    pokemonDetails.stats.forEach(stat => {
        stats += `<h3>${stat.stat.name}</h3><h3>${stat.base_stat}</h3><hr>`
    })

    // because some pokemons don't have an image, we check first its image is null, and if so we replace it with just a #
    if (pokemonDetails.sprites.front_default == null) pokemonDetails.sprites.front_default = "#"

    mainElement.innerHTML = `
    <div class="card card-big">
        <h2>${pokemonDetails.id}. ${pokemonDetails.name}</h2>
        <img src="${pokemonDetails.sprites.front_default}" alt="">

        <div class="card-stats">
            <div class="info">
                <h3 class="height">${pokemonDetails.height / 10}m</h3><h3 class="weight">${pokemonDetails.weight / 10}kg</h3><h3 class="xp">${pokemonDetails.base_experience}xp</h3>
            </div>

            <div class="types">
                ${types}
            </div>

            <div class="stats">
                ${stats}
            </div>
        </div>
    </div>
    `
}