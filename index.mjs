import readline from "readline";

// Create an interface to read lines from the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ask the user for a name
rl.question("What's your pokemon's name? ", (name) => {
  // save the name
  fetchPokemonData(name);
  rl.close();
});

async function fetchPokemonData(name) {
  try {
    const { default: fetch } = await import("node-fetch");
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await response.json();
    // Print name
    console.log(data.name);
    // weight
    console.log(data.weight);
    // print id
    console.log(data.id);
  } catch (error) {
    console.error("Error:", error);
  }
}
