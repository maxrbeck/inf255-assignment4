"use strict";

/*
 * Animal Adoption Board
 *
 * EXTRA CREDIT: If you build any Assignment 4 extra credit features, list
 * them here (see README.md). Features that are not listed here will not be
 * graded.
 *
 *   -
 *   -
 */

// ------------------------------------
// Animal Data
// ------------------------------------

// Starts empty and gets filled in by loadAnimals() once animals.json arrives.
// It has to be let because the whole array gets replaced, not just changed.
let animals = [];

// What the user currently wants to see. The page controls change these.
let activeFilter = "all";
let activeSort = "default";

// ------------------------------------
// Display Animals
// ------------------------------------

// Clears the list and draws one card for each animal in animalArray.
// It draws whatever array it is given, so updateDisplay() decides which
// animals to show and in what order.
function displayAnimals(animalArray) {
	const animalList = document.querySelector("#animal-list");
	animalList.innerHTML = "";

	if (animalArray.length === 0) {
		const emptyMessage = document.createElement("p");
		emptyMessage.textContent = "There are no animals to show.";
		emptyMessage.classList.add("empty-message");
		animalList.appendChild(emptyMessage);
		return;
	}

	animalArray.forEach((animal) => {
		const card = document.createElement("article");
		card.classList.add("animal-card");

		// The adopted class lets style.css gray out adopted animals.
		if (animal.adopted) {
			card.classList.add("adopted");
		}

		const heading = document.createElement("h3");
		heading.textContent = animal.name;

		const details = document.createElement("p");
		details.textContent = `${animal.species}, ${animal.age} years old`;

		const status = document.createElement("p");
		status.textContent = animal.adopted ? "Adopted" : "Available";

		const button = document.createElement("button");
		button.type = "button";
		button.textContent = animal.adopted ? "Return" : "Adopt";

		// This callback doesn't run now. It runs later, each time the user
		// clicks this card's button. It knows which animal to change because
		// the arrow function was created inside this forEach() callback, so it
		// remembers this card's animal (a closure) and passes its id along.
		button.addEventListener("click", () => toggleAdoption(animal.id));

		card.append(heading, details, status, button);
		animalList.appendChild(card);
	});
}

// ------------------------------------
// Adopt or Return an Animal
// ------------------------------------

// Flips one animal between available and adopted, then redraws the page.
function toggleAdoption(animalId) {
	const animal = animals.find((a) => a.id === animalId);

	// find() returns undefined when nothing matches, so stop here instead of
	// causing an error on the next line.
	if (!animal) {
		return;
	}

	animal.adopted = !animal.adopted;
	updateDisplay();
}

// ------------------------------------
// Filter, Sort, and Update
// ------------------------------------

// Builds the list the user asked for (activeFilter and activeSort), draws
// it, and refreshes the count.
function updateDisplay() {
	// sort() rearranges the array it is called on. Working on a copy leaves
	// the animals array in its original order, so "Original order" still
	// has something to go back to.
	let visible = animals.slice();

	if (activeFilter === "available") {
		visible = visible.filter((a) => !a.adopted);
	} else if (activeFilter === "adopted") {
		visible = visible.filter((a) => a.adopted);
	}

	if (activeSort === "name") {
		visible.sort((a, b) => a.name.localeCompare(b.name));
	} else if (activeSort === "age") {
		// A negative result puts a before b, so smaller ages come first.
		visible.sort((a, b) => a.age - b.age);
	}

	displayAnimals(visible);
	updateCount();
}

// ------------------------------------
// Available Count
// ------------------------------------

// Counts from the full animals array, not the visible cards, so the
// message doesn't change when the user filters or sorts.
function updateCount() {
	const countText = document.querySelector("#animal-count");
	const available = animals.filter((a) => !a.adopted);
	countText.textContent = `${available.length} of ${animals.length} animals are available for adoption.`;
}

// ------------------------------------
// Page Controls
// ------------------------------------

const allButton = document.querySelector("#show-all");
const availableButton = document.querySelector("#show-available");
const adoptedButton = document.querySelector("#show-adopted");
const sortSelect = document.querySelector("#sort-animals");

// All three filter buttons do the same thing with a different value, so
// they share this function.
function setFilter(filter) {
	activeFilter = filter;
	updateDisplay();
}

allButton.addEventListener("click", () => setFilter("all"));
availableButton.addEventListener("click", () => setFilter("available"));
adoptedButton.addEventListener("click", () => setFilter("adopted"));

sortSelect.addEventListener("change", () => {
	activeSort = sortSelect.value;
	updateDisplay();
});

// ------------------------------------
// Load Animals
// ------------------------------------

// Gets the animals from public/animals.json and shows them. While waiting
// it shows a loading message, and if anything goes wrong it shows an error
// instead of leaving the page blank.
async function loadAnimals() {
	const countText = document.querySelector("#animal-count");
	const animalList = document.querySelector("#animal-list");

	countText.textContent = "Loading animals...";
	animalList.innerHTML = "";

	try {
		// await pauses only this function until the server answers. The rest
		// of the page keeps running in the meantime, so the browser can still
		// draw the loading message and respond to clicks while we wait.
		const response = await fetch("/animals.json");

		// fetch() only fails by itself when the request can't happen at all,
		// like when there's no internet. If the server answers with an error
		// like 404 or 500, fetch() still counts that as a success, so we
		// have to check response.ok ourselves.
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}

		animals = await response.json();
		updateDisplay();
	} catch (error) {
		// The error goes to the console for debugging, and the user gets a
		// friendly message instead.
		console.error(error);
		countText.textContent = "";

		const errorMessage = document.createElement("p");
		errorMessage.textContent =
			"Sorry, the animals couldn't be loaded. Try refreshing the page.";
		errorMessage.classList.add("error-message");
		animalList.appendChild(errorMessage);
	}
}

loadAnimals();
