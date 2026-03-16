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
const feedbackMessage = document.getElementById("feedback-message");

const finalScore = document.getElementById("final-score");
const bestComboText = document.getElementById("best-combo");
const pollutedHitsText = document.getElementById("polluted-hits");
const resultMessage = document.getElementById("result-message");
const redeemPlaceholder = document.getElementById("redeem-placeholder");

const gameArea = document.getElementById("game-area");

let score = 0;
let timeRemaining = 60;
let lives = 3;
let combo = 0;
let bestCombo = 0;
let pollutedHits = 0;
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

function resetState()
{
    score = 0;
    timeRemaining = 60;
    lives = 3;
    combo = 0;
    bestCombo = 0;
    pollutedHits = 0;

    updateHud();
    setFeedback("Collect clean water cans and avoid pollution.");
    redeemPlaceholder.classList.add("hidden");
}

function updateHud()
{
    scoreValue.textContent = score;
    timerValue.textContent = timeRemaining;
    livesValue.textContent = lives;
    comboValue.textContent = combo;
}

function setFeedback(message)
{
    feedbackMessage.textContent = message;
}

function clearGameArea()
{
    const items = gameArea.querySelectorAll(".falling-item, .pop-text");
    items.forEach((item) =>
    {
        item.remove();
    });
}

function startGame()
{
    stopGameLoops();
    clearGameArea();
    resetState();

    gameRunning = true;
    showScreen(gameScreen);

    timerInterval = window.setInterval(() =>
    {
        timeRemaining -= 1;
        updateHud();

        if (timeRemaining <= 0)
        {
            endGame("Time is up — mission complete.");
        }
    }, 1000);

    spawnInterval = window.setInterval(() =>
    {
        spawnItem();
    }, 850);

    spawnItem();
}

function stopGameLoops()
{
    if (timerInterval)
    {
        window.clearInterval(timerInterval);
        timerInterval = null;
    }

    if (spawnInterval)
    {
        window.clearInterval(spawnInterval);
        spawnInterval = null;
    }
}

function endGame(message)
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
    resultMessage.textContent = getResultMessage(message);

    showScreen(resultScreen);
}

function getResultMessage(baseMessage)
{
    if (score >= 250)
    {
        return `${baseMessage} Amazing work delivering clean water.`;
    }

    if (score >= 150)
    {
        return `${baseMessage} Strong round — keep building momentum.`;
    }

    return `${baseMessage} Try again and beat your score.`;
}

function spawnItem()
{
    if (!gameRunning)
    {
        return;
    }

    const item = document.createElement("button");
    const isGoodItem = Math.random() < 0.72;
    const itemLeft = getRandomXPosition();

    item.classList.add("falling-item");
    item.style.left = `${itemLeft}px`;
    item.style.animationDuration = `${getRandomDuration()}s`;

    if (isGoodItem)
    {
        item.classList.add("good-item");
        item.setAttribute("aria-label", "Clean water can");

        const image = document.createElement("img");
        image.src = "img/water-can-transparent.png";
        image.alt = "Yellow water can";
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

function getRandomXPosition()
{
    const gameAreaWidth = gameArea.clientWidth;
    const itemWidth = 80;
    const maxX = Math.max(gameAreaWidth - itemWidth, 0);

    return Math.floor(Math.random() * maxX);
}

function getRandomDuration()
{
    return (Math.random() * 1.2 + 2.8).toFixed(2);
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

    updateHud();

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

    updateHud();
    setFeedback("Polluted drop hit. Be careful.");

    showPopText(item, "-1 Life", "bad");
    item.remove();

    if (lives <= 0)
    {
        endGame("Mission failed — you ran out of lives.");
    }
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

function resetRound()
{
    startGame();
}

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetRound);
playAgainButton.addEventListener("click", startGame);

redeemButton.addEventListener("click", () =>
{
    redeemPlaceholder.classList.remove("hidden");
});

showScreen(startScreen);
updateHud();