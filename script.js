const livesDisplay = document.getElementById("lives");
const arena = document.getElementById("arena");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");

const words = ["leaf", "river", "brick", "cloud", "stone", "apple", "forest",
    "moon", "trail", "lantern"];

    const fallSpeed = 50;
    const spawnInterval = 2.1;
    const maxFrameTime = 0.05;

    const activeWords = [];
    let lives = 3;
    let lastFrameTime;
    let timeSinceSpawn = 0;

    function createWord() {
        const text = words[Math.floor(Math.random() * words.length)];

        const word = document.createElement("span");
        word.className = "word";
        word.textContent = text;

    }

    const position = Math.random() * 100;
    const y = 16;
    word.style.left = `${position}%`;
    word.style.translate = `${-position}%`;
    word.style.top = `${y}px`;
    arena.appendChild(word);
    activeWords.push({element: word, y }); 
}

function updateGame(timestamp) {
    const elapsed = (timestamp - (lastFrameTime ?? timestamp)) / 1000;
    const frameTime = Math.min(elapsed, maxFrameTime);
    lastFrameTime = timestamp;
}

const bottom = arena.clientHeight;
for (let index = activeWords.length -1; index>= 0; index--) {
    const word = activeWords[index];
    word.y += fallSpeed * frameTime;
}

if ( word.y + word.element.height < bottom ) {
    word.element.style.top = `${word.y}px`;
    continue;
}

word.element.remove();
activeWords.splice(index, 1);
lives -= 1;
livesDisplay.textContent = lives;

if (lives === 0) {
    for (const remainingWord of activeWords ) {
        remainingWord.element.remove();
    }
    activeWords.length = 0;
    return;
}

timeSinceSpawn += frameTime;
if (timeSinceSpawn >= spawnInterval ) {
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

    startButton.addEventListener("click", startGame, {once: true });
