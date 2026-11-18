const arena = document.getElementById("arena");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");

const words = ["leaf", "river", "brick", "cloud", "stone", "apple", "forest",
    "moon", "trail", "lantern"];

    function createWord() {
        const text = words[Math.floor(Math.random() * words.length)];

        const word = document.createElement("span");
        word.className = "word";
        word.textContent = text;

        arena.appendChild(word);
    }

    const position = Math.random() * 100;
    word.style.left = `${position}%`;
    word.style.translate = `${-position}%`;
}



    function startGame() {
        startScreen.hidden = true;
        createWord();
    }

    startButton.addEventListener("click", startGame, {once: true });
    