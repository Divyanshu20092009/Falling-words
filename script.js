const arena = document.getElementById("arena");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const gameOverMessage = document.getElementById("game-over");
const typingStatus = document.getElementById("typing-status");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const livesDisplay = document.getElementById("lives");
const comboDisplay = document.getElementById("combo");

const words = ["leaf", "river", "brick", "cloud", "stone", "apple", "forest", "moon", "trail", "lantern"];

const baseFallSpeed = 50;
const baseSpawnInterval = 2.1;
const maxFrameTime = 0.05;

const activeWords = [];
let score = 0;
let lives = 3;
let combo = 0;
let lastFrameTime;
let timeSinceSpawn = 0;
let target = null;
let typedCount = 0;
let frameId;

function difficultyStage() {
  return Math.min(Math.floor(combo / 5), 4);
}

function formatScore(value) {
  return String(value).padStart(4, "0");
}

function updateHud() {
  scoreDisplay.textContent = formatScore(score);
  levelDisplay.textContent = String(difficultyStage() + 1).padStart(2, "0");
  comboDisplay.textContent = combo || "—";
}

function updateLives() {
  livesDisplay.replaceChildren();
  livesDisplay.setAttribute("aria-label", `${lives} ${lives === 1 ? "life" : "lives"} remaining`);
  for (let index = 0; index < lives; index++) {
    const icon = document.createElement("img");
    icon.src = "life-icon.png";
    icon.alt = "";
    livesDisplay.appendChild(icon);
  }
}

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

function removeWord(index, completed = false) {
  const word = activeWords[index];
  activeWords.splice(index, 1);

  if (word === target) {
    target = null;
    typedCount = 0;
    updateTyping();
  }

  if (completed) {
    word.element.className = "word burning";
    word.element.replaceChildren(word.element.textContent);
    word.element.setAttribute("aria-hidden", "true");
    setTimeout(() => word.element.remove(), 600);
  } else {
    word.element.remove();
  }
}

function updateTyping(prefix = "", wrong = false) {
  typingStatus.textContent = prefix || "Start typing";
  typingStatus.classList.toggle("wrong", wrong);
}

function updateWord() {
  const element = target.element;
  const text = element.textContent;
  element.classList.remove("wrong");
  const typed = text.slice(0, typedCount);
  updateTyping(typed);

  if (typedCount === 0) {
    element.textContent = text;
    target = null;
    return;
  }

  const prefix = document.createElement("span");
  prefix.className = "typed";
  prefix.textContent = typed;
  element.replaceChildren(prefix, text.slice(typedCount));
}

function handleKeydown(event) {
  if (pauseButton.disabled || event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }

  if (event.shiftKey && event.key.toLowerCase() === "p") {
    event.preventDefault();
    if (!event.repeat) {
      togglePause();
    }
    return;
  }

  if (frameId === undefined) {
    return;
  }

  if (event.key === "Backspace" || event.key === "Escape") {
    event.preventDefault();
    if (target) {
      typedCount = event.key === "Escape" ? 0 : typedCount - 1;
      updateWord();
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
    updateTyping(text.slice(0, typedCount), true);
    return;
  }

  typedCount += 1;
  if (typedCount === text.length) {
    combo += 1;
    score += 10 + (combo - 1) * 2;
    updateHud();
    removeWord(activeWords.indexOf(target), true);
    return;
  }

  updateWord();
}

function updateGame(timestamp) {
  const elapsed = (timestamp - (lastFrameTime ?? timestamp)) / 1000;
  const frameTime = Math.min(elapsed, maxFrameTime);
  lastFrameTime = timestamp;

  let stage = difficultyStage();
  const fallDistance = (baseFallSpeed + stage * 10) * frameTime;
  const bottom = arena.clientHeight;
  for (let index = activeWords.length - 1; index >= 0; index--) {
    const word = activeWords[index];
    word.y += fallDistance;

    if (word.y + word.element.offsetHeight < bottom) {
      word.element.style.top = `${word.y}px`;
      continue;
    }

    removeWord(index);
    lives -= 1;
    updateLives();
    combo = 0;
    updateHud();
    stage = 0;

    if (lives === 0) {
      endGame();
      return;
    }
  }

  const spawnInterval = baseSpawnInterval - stage * 0.2;
  timeSinceSpawn += frameTime;
  if (timeSinceSpawn >= spawnInterval) {
    createWord();
    timeSinceSpawn -= spawnInterval;
  }

  frameId = requestAnimationFrame(updateGame);
}

function togglePause() {
  if (frameId !== undefined) {
    cancelAnimationFrame(frameId);
    frameId = undefined;
    pauseButton.textContent = "Resume";
    return;
  }

  lastFrameTime = undefined;
  pauseButton.textContent = "Pause";
  frameId = requestAnimationFrame(updateGame);
}

function endGame() {
  while (activeWords.length > 0) {
    removeWord(activeWords.length - 1);
  }
  frameId = undefined;
  pauseButton.disabled = true;
  gameOverMessage.textContent = `GAME OVER\nFINAL SCORE: ${formatScore(score)}`;
  gameOverMessage.hidden = false;
  startButton.textContent = "RESTART";
  startScreen.hidden = false;
  startButton.focus();
}

function startGame() {
  if (startScreen.hidden) {
    return;
  }

  arena.replaceChildren(startScreen);
  score = 0;
  lives = 3;
  combo = 0;
  updateHud();
  updateLives();
  lastFrameTime = undefined;
  timeSinceSpawn = 0;

  gameOverMessage.hidden = true;
  startScreen.hidden = true;
  pauseButton.textContent = "Pause";
  pauseButton.disabled = false;
  createWord();
  frameId = requestAnimationFrame(updateGame);
}

updateLives();
startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
document.addEventListener("keydown", handleKeydown);
