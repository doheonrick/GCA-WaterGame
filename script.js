const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");
const playAgainButton = document.getElementById("play-again-button");
const redeemButton = document.getElementById("redeem-button");

const scoreValue = document.getElementById("score-value");
const timerValue = document.getElementById("timer-value");
const livesValue = document.getElementById("lives-value");
const comboValue = document.getElementById("combo-value");
const goalValue = document.getElementById("goal-value");
const feedbackMessage = document.getElementById("feedback-message");

const finalScore = document.getElementById("final-score");
const bestComboText = document.getElementById("best-combo");
const pollutedHitsText = document.getElementById("polluted-hits");
const finalDifficulty = document.getElementById("final-difficulty");
const resultMessage = document.getElementById("result-message");
const redeemPlaceholder = document.getElementById("redeem-placeholder");

const gameArea = document.getElementById("game-area");

const goodSound = new Audio("sounds/good.mp3");
const badSound = new Audio("sounds/bad.mp3");
const winSound = new Audio("sounds/win.mp3");

const difficultySettings =
{
    easy:
    {
        label: "Easy",
        time: 75,
        goal: 120,
        spawnRate: 950,
        goodChance: 0.80,
        minFall: 3.2,
        maxFall: 4.4,
    },
    normal:
    {
        label: "Normal",
        time: 60,
        goal: 160,
        spawnRate: 850,
        goodChance: 0.72,
        minFall: 2.8,
        maxFall: 4.0,
    },
    hard:
    {
        label: "Hard",
        time: 45,
        goal: 220,
        spawnRate: 700,
        goodChance: 0.65,
        minFall: 2.3,
        maxFall: 3.3,
    },
};

const milestoneMessages =
[
    { score: 50, text: "Great start! Clean water is on the way." },
    { score: 100, text: "Halfway there! Keep the cans coming." },
    { score: 150, text: "Amazing impact! You are making a difference." },
];

let currentDifficulty = "normal";
let currentGoal = difficultySettings.normal.goal;

let score = 0;
let timeRemaining = 60;
let lives = 3;
let combo = 0;
let bestCombo = 0;
let pollutedHits = 0;
let milestoneIndex = 0;
let gameRunning = false;

let timerInterval = null;
let spawnInterval = null;

function showScreen(screenToShow)
{
    startScreen.classList.remove("screen-active");
    gameScreen.classList.remove("screen-active");
    resultScreen.classList.remove("screen-active");

    screenToShow.classList.add("screen-active");
}

function setFeedback(message)
{
    feedbackMessage.textContent = message;
}

function playSound(sound)
{
    sound.currentTime = 0;

    sound.play().catch((error) =>
    {
        console.log("Audio playback failed:", error);
    });
}
function updateHud()
{
    scoreValue.textContent = score;
    timerValue.textContent = timeRemaining;
    livesValue.textContent = lives;
    comboValue.textContent = combo;
    goalValue.textContent = currentGoal;
}

function getSelectedDifficulty()
{
    const selectedInput = document.querySelector('input[name="difficulty"]:checked');
    return selectedInput ? selectedInput.value : "normal";
}

function getCurrentSettings()
{
    return difficultySettings[currentDifficulty];
}

function playSound(sound)
{
    sound.currentTime = 0;
    sound.play().catch(() =>
    {
        // Ignore audio playback issues
    });
}

function stopGameLoops()
{
    if (timerInterval !== null)
    {
        window.clearInterval(timerInterval);
        timerInterval = null;
    }

    if (spawnInterval !== null)
    {
        window.clearInterval(spawnInterval);
        spawnInterval = null;
    }
}

function clearGameArea()
{
    gameArea.querySelectorAll(".falling-item, .pop-text").forEach((item) =>
    {
        item.remove();
    });
}

function resetState()
{
    const settings = getCurrentSettings();

    score = 0;
    timeRemaining = settings.time;
    lives = 3;
    combo = 0;
    bestCombo = 0;
    pollutedHits = 0;
    currentGoal = settings.goal;
    milestoneIndex = 0;

    updateHud();
    setFeedback(`Mode: ${settings.label}. Collect clean water cans and avoid pollution.`);
    redeemPlaceholder.classList.add("hidden");
}

function checkMilestones()
{
    if (milestoneIndex >= milestoneMessages.length)
    {
        return;
    }

    const nextMilestone = milestoneMessages[milestoneIndex];

    if (score >= nextMilestone.score)
    {
        setFeedback(nextMilestone.text);
        milestoneIndex += 1;
    }
}

function startGame()
{
    currentDifficulty = getSelectedDifficulty();

    stopGameLoops();
    clearGameArea();
    resetState();

    gameRunning = true;
    showScreen(gameScreen);

    const settings = getCurrentSettings();

    timerInterval = window.setInterval(() =>
    {
        timeRemaining -= 1;
        updateHud();

        if (timeRemaining <= 0)
        {
            endGame("Time is up — mission complete.");
        }
    }, 1000);

    spawnInterval = window.setInterval(spawnItem, settings.spawnRate);
    spawnItem();
}

function endGame(baseMessage)
{
    if (!gameRunning)
    {
        return;
    }

    gameRunning = false;
    stopGameLoops();
    clearGameArea();

    finalScore.textContent = score;
    bestComboText.textContent = bestCombo;
    pollutedHitsText.textContent = pollutedHits;
    finalDifficulty.textContent = getCurrentSettings().label;
    resultMessage.textContent = getResultMessage(baseMessage);

    if (score >= currentGoal)
    {
        playSound(winSound);
    }

    showScreen(resultScreen);
}

function getResultMessage(baseMessage)
{
    if (score >= currentGoal)
    {
        return `${baseMessage} You reached the mission goal and delivered a strong clean water impact.`;
    }

    if (score >= currentGoal * 0.7)
    {
        return `${baseMessage} Great progress — you were close to the mission goal.`;
    }

    return `${baseMessage} Try again and deliver even more clean water next round.`;
}

function getRandomXPosition()
{
    const gameAreaWidth = gameArea.clientWidth;
    const itemWidth = 80;
    const maxX = Math.max(gameAreaWidth - itemWidth, 0);

    return Math.floor(Math.random() * maxX);
}

function getRandomDuration(min, max)
{
    return (Math.random() * (max - min) + min).toFixed(2);
}

function showPopText(item, text, type)
{
    const pop = document.createElement("div");
    const itemRect = item.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();

    pop.classList.add("pop-text", type);
    pop.textContent = text;
    pop.style.left = `${itemRect.left - gameAreaRect.left + 10}px`;
    pop.style.top = `${itemRect.top - gameAreaRect.top}px`;

    gameArea.appendChild(pop);

    window.setTimeout(() =>
    {
        pop.remove();
    }, 700);
}

function handleGoodClick(item)
{
    combo += 1;
    bestCombo = Math.max(bestCombo, combo);

    let pointsEarned = 10;

    if (combo >= 5)
    {
        pointsEarned += 2;
    }

    score += pointsEarned;
    playSound(goodSound);

    updateHud();
    checkMilestones();

    if (combo >= 5)
    {
        setFeedback(`Combo x${combo}! Bonus points earned.`);
    }
    else
    {
        setFeedback("Nice catch! Clean water delivered.");
    }

    showPopText(item, `+${pointsEarned}`, "good");
    item.remove();
}

function handleBadClick(item)
{
    lives -= 1;
    pollutedHits += 1;
    combo = 0;

    playSound(badSound);
    updateHud();
    setFeedback("Polluted drop hit. Be careful.");

    showPopText(item, "-1 Life", "bad");
    item.remove();

    if (lives <= 0)
    {
        endGame("Mission failed — you ran out of lives.");
    }
}

function spawnItem()
{
    if (!gameRunning)
    {
        return;
    }

    const settings = difficultySettings[currentDifficulty];
    const isGoodItem = Math.random() < settings.goodChance;

    const item = document.createElement("button");
    item.type = "button";
    item.classList.add("falling-item");
    item.style.left = `${getRandomXPosition()}px`;
    item.style.animationDuration = `${getRandomDuration(settings.minFall, settings.maxFall)}s`;

    if (isGoodItem)
    {
        item.classList.add("good-item");
        item.setAttribute("aria-label", "Clean water can");

        const image = document.createElement("img");
        image.src = "img/water-can-transparent.png";
        image.alt = "Yellow water can";
        image.draggable = false;
        item.appendChild(image);
    }
    else
    {
        item.classList.add("bad-item");
        item.setAttribute("aria-label", "Polluted drop");
    }

    item.addEventListener("click", () =>
    {
        if (!gameRunning)
        {
            return;
        }

        if (isGoodItem)
        {
            handleGoodClick(item);
        }
        else
        {
            handleBadClick(item);
        }
    });

    item.addEventListener("animationend", () =>
    {
        if (!gameRunning)
        {
            item.remove();
            return;
        }

        if (gameArea.contains(item))
        {
            if (isGoodItem)
            {
                combo = 0;
                updateHud();
                setFeedback("You missed a clean water can.");
            }

            item.remove();
        }
    });

    gameArea.appendChild(item);
}

function resetRound()
{
    startGame();
}

startButton.addEventListener("click", () =>
    {
        goodSound.load();
        badSound.load();
        winSound.load();
        startGame();
    });
resetButton.addEventListener("click", resetRound);
playAgainButton.addEventListener("click", startGame);

redeemButton.addEventListener("click", () =>
{
    redeemPlaceholder.classList.remove("hidden");
});

showScreen(startScreen);
updateHud();