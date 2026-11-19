const arena = document.getElementById("arena");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const livesDisplay = document.getElementById("lives");
const scoreDisplay = document.getElementById("score");
const comboDisplay = document.getElementById("combo");
const pauseButton = document.getElementById("pause-button");
const gameOverMessage = document.getElementById("game-over");

const words = ["leaf", "river", "brick", "cloud", "stone", "apple", "forest", "moon", "trail", "lantern"];

const basefallSpeed = 50;
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
let frameid;

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

function removeWord(index, completed = false)  {
  const word = activeWords[index];
  activeWords.splice(index, 1);

  if (word === target) {
    target = null;
    typedCount = 0;
  }
}

if (completed) {
    words.element.className = "word burning";
    words.element.replaceChildren(words.element.textContent);
    words.element.setAttribute("aria-hidden", "true");
    setTimeout(() => word.element.remove(), 600);
} else {
    words.element.remove();
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
  if (frameid === undefined || lives === 0 || event.ctrlKey || event.altKey || event.metaKey) {
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
    combo += 1;1
    score += 10 + (combo - 1) * 2;
    scoreDisplay.textContent = score;
    comboDisplay.textContent = combo;
    removeWord(activeWords.indexOf(target));
    return;
  }

  updateWord();
}

function updateGame(timestamp) {
  const elapsed = (timestamp - (lastFrameTime ?? timestamp)) / 1000;
  const frameTime = Math.min(elapsed, maxFrameTime);
  lastFrameTime = timestamp;


  let stage = Math.min(Math.floor(combo / 5), 4);
  const fallDistance = (basefallSpeed + stage * 10) * frameTime;
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
    combo = 0;
    comboDisplay.textContent = combo;
    stage = 0;

    if (lives === 0) {
      while (activeWords.length > 0) {
        removeWord(activeWords.length - 1);
      }
      return;
    }
  }

  timeSinceSpawn += frameTime;
  if (timeSinceSpawn >= baseSpawnInterval) {
    createWord();
    timeSinceSpawn -= baseSpawnInterval;
  }

  frameid = requestAnimationFrame(updateGame);
}

function togglePause() {
    if (frameid !== undefined) {
        cancelAnimationFrame(frameid);
        frameid = undefined;
        pauseButton.textContent = "RESUME";
        return;
    }
    lastFrameTime = undefined;
    pauseButton.textContent = "Pause";
    frameid = requestAnimationFrame(updateGame);
}

function endGame() {
    while (activeWords.length > 0) {
        removeWord(activeWords.length - 1);
    }
    frameid = undefined;
    pauseButton.disabled =  true;
    gameOverMessage.textContent = `Game Over\nFINAL SCORE: ${score}`;
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
    scoreDisplay.textContent = score;
    updateLives();
    comboDisplay.textContent = combo;
    lastFrameTime = undefined;
    timeSinceSpawn = 0;

    gameOverMessage.hidden = true;
    startScreen.hidden = true;
    pauseButton.textContent = "Pause";
    pauseButton.disabled = false;
    createWord();
    frameid = requestAnimationFrame(updateGame);
}

updateLives();
startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
document.addEventListener("keydown", handleKeydown);
