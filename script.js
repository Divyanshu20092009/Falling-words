const arena = document.getElementById("arena");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const livesDisplay = document.getElementById("lives");

const words = ["leaf", "river", "brick", "cloud", "stone", "apple", "forest", "moon", "trail", "lantern"];

const fallSpeed = 50;
const spawnInterval = 2.1;
const maxFrameTime = 0.05;

const activeWords = [];
let lives = 3;
let lastFrameTime;
let timeSinceSpawn = 0;
let target = null;
let typedCount = 0;

function createWord() {
  const text = words[Math.floor(Math.random() * words.length)];
  const word = document.createElement("span");
  word.className = "word";
  word.textContent = text;

  const position = Math.random() * 100;
  const y = 16;
  word.style.left = `${position}%`;
  word.style.translate = `${-position}%`;
  word.style.top = `${y}px`;
  arena.appendChild(word);
  activeWords.push({ element: word, y });
}

function removeWord(index) {
  const word = activeWords[index];
  word.element.remove();
  activeWords.splice(index, 1);

  if (word === target) {
    target = null;
    typedCount = 0;
  }
}

function updateWord() {
  const element = target.element;
  const text = element.textContent;
  element.classList.remove("wrong");

  if (typedCount === 0) {
    element.textContent = text;
    return;
  }

  const prefix = document.createElement("span");
  prefix.className = "typed";
  prefix.textContent = text.slice(0, typedCount);
  element.replaceChildren(prefix, text.slice(typedCount));
}

function handleKeydown(event) {
  if (!startScreen.hidden || lives === 0 || event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    if (target) {
      typedCount -= 1;
      updateWord();
      if (typedCount === 0) {
        target = null;
      }
    }
    return;
  }

  if (!/^[a-z]$/i.test(event.key)) {
    return;
  }

  const letter = event.key.toLowerCase();
  if (!target) {
    for (const word of activeWords) {
      if (word.element.textContent[0] === letter && (!target || word.y > target.y)) {
        target = word;
      }
    }
    if (!target) {
      return;
    }
  }

  const text = target.element.textContent;
  if (letter !== text[typedCount]) {
    target.element.classList.add("wrong");
    return;
  }

  typedCount += 1;
  if (typedCount === text.length) {
    removeWord(activeWords.indexOf(target));
    return;
  }

  updateWord();
}

function updateGame(timestamp) {
  const elapsed = (timestamp - (lastFrameTime ?? timestamp)) / 1000;
  const frameTime = Math.min(elapsed, maxFrameTime);
  lastFrameTime = timestamp;

  const bottom = arena.clientHeight;
  for (let index = activeWords.length - 1; index >= 0; index--) {
    const word = activeWords[index];
    word.y += fallSpeed * frameTime;

    if (word.y + word.element.offsetHeight < bottom) {
      word.element.style.top = `${word.y}px`;
      continue;
    }

    removeWord(index);
    lives -= 1;
    livesDisplay.textContent = lives;

    if (lives === 0) {
      while (activeWords.length > 0) {
        removeWord(activeWords.length - 1);
      }
      return;
    }
  }

  timeSinceSpawn += frameTime;
  if (timeSinceSpawn >= spawnInterval) {
    createWord();
    timeSinceSpawn -= spawnInterval;
  }

  requestAnimationFrame(updateGame);
}

function startGame() {
  startScreen.hidden = true;
  createWord();
  requestAnimationFrame(updateGame);
}

startButton.addEventListener("click", startGame, { once: true });
document.addEventListener("keydown", handleKeydown);
