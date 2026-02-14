let pokemonList = [];
let score = 0;
let questionCount = 0;
let currentCorrect = null;
let currentOptions = [];

const scoreEl = document.getElementById('score');
const questionCountEl = document.getElementById('question-count');
const pokemonImageEl = document.getElementById('pokemon-image');
const optionsContainer = document.getElementById('options-container');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');

document.addEventListener('DOMContentLoaded', async () => {
  await fetchPokemonList();
  startGame();
});

async function fetchPokemonList() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
    const data = await response.json();
    pokemonList = data.results.map(pokemon => {
      const id = parseInt(pokemon.url.split('/').filter(Boolean).pop());
      return { id, name: pokemon.name };
    });
  } catch (error) {
    console.error('Failed to fetch Pokémon list:', error);
    alert('Failed to load Pokémon data. Please refresh the page.');
  }
}

function startGame() {
  score = 0;
  questionCount = 0;
  updateScoreDisplay();
  loadQuestion();
}

function updateScoreDisplay() {
  scoreEl.textContent = score;
  questionCountEl.textContent = questionCount;
}

function getRandomPokemon() {
  const randomIndex = Math.floor(Math.random() * pokemonList.length);
  return pokemonList[randomIndex];
}

function getRandomWrongOptions(correctPokemon, count = 3) {
  const wrongOptions = [];
  const used = new Set([correctPokemon.name]);
  while (wrongOptions.length < count) {
    const random = getRandomPokemon();
    if (!used.has(random.name)) {
      wrongOptions.push(random.name);
      used.add(random.name);
    }
  }
  return wrongOptions;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function loadQuestion() {
  feedbackEl.classList.add('hidden');
  nextBtn.classList.add('hidden');
  pokemonImageEl.classList.remove('pokemon-revealed');
  pokemonImageEl.classList.add('pokemon-silhouette');

  optionsContainer.innerHTML = '';

  questionCount++;
  updateScoreDisplay();

  const correctPokemon = getRandomPokemon();
  currentCorrect = correctPokemon.name;

  const wrongOptions = getRandomWrongOptions(correctPokemon, 3);
  const allOptions = shuffleArray([correctPokemon.name, ...wrongOptions]);
  currentOptions = allOptions;

  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${correctPokemon.id}.png`;
  pokemonImageEl.src = imageUrl;
  pokemonImageEl.alt = `Silhouette of ${correctPokemon.name}`;

  allOptions.forEach(option => {
    const button = document.createElement('button');
    button.className = 'option-btn fade-in';
    button.textContent = formatPokemonName(option);
    button.addEventListener('click', () => handleAnswer(option, button));
    optionsContainer.appendChild(button);
  });
}

function formatPokemonName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
}

function handleAnswer(selectedName, buttonElement) {
  const buttons = optionsContainer.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.disabled = true);

  const isCorrect = selectedName === currentCorrect;
  if (isCorrect) {
    score++;
    updateScoreDisplay();
    buttonElement.classList.add('correct');
    pokemonImageEl.classList.add('bounce');
    showFeedback(true, 'Correct!');
  } else {
    buttonElement.classList.add('wrong');
    buttons.forEach(btn => {
      if (btn.textContent.toLowerCase() === formatPokemonName(currentCorrect).toLowerCase()) {
        btn.classList.add('correct');
      }
    });
    buttonElement.classList.add('shake');
    showFeedback(false, `Wrong! It's ${formatPokemonName(currentCorrect)}`);
  }

  pokemonImageEl.classList.remove('pokemon-silhouette');
  pokemonImageEl.classList.add('pokemon-revealed');

  setTimeout(() => {
    nextBtn.classList.remove('hidden');
    pokemonImageEl.classList.remove('bounce', 'shake');
  }, 1000);
}

function showFeedback(isCorrect, message) {
  feedbackEl.textContent = message;
  feedbackEl.className = 'text-center p-4 rounded-lg mb-4 font-semibold fade-in';
  if (isCorrect) {
    feedbackEl.classList.add('correct');
  } else {
    feedbackEl.classList.add('wrong');
  }
  feedbackEl.classList.remove('hidden');
}

nextBtn.addEventListener('click', loadQuestion);