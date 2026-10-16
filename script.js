
const homeScreen = document.getElementById("home-screen");
const divisionScreen = document.getElementById("division-screen");
const openDivisionButton = document.getElementById("open-division");
const backHomeButton = document.getElementById("back-home");
const homeLink = document.getElementById("home-link");

const applePile = document.getElementById("apple-pile");
const basketRow = document.getElementById("basket-row");
const appleTotal = document.getElementById("apple-total");
const problemInstruction = document.getElementById("problem-instruction");
const remainingLabel = document.getElementById("remaining-label");
const roundLabel = document.getElementById("round-label");
const scoreLabel = document.getElementById("score-label");
const progressFill = document.getElementById("progress-fill");
const feedback = document.getElementById("feedback");
const checkButton = document.getElementById("check-answer");
const nextButton = document.getElementById("next-round");
const resetButton = document.getElementById("reset-round");
const clearButton = document.getElementById("clear-baskets");
const finishPanel = document.getElementById("finish-panel");
const finishMessage = document.getElementById("finish-message");
const playAgainButton = document.getElementById("play-again");
const finishHomeButton = document.getElementById("finish-home");

const applesArea = document.querySelector(".apples-area");
const basketsArea = document.querySelector(".baskets-area");
const gameActions = document.querySelector(".game-actions");

const challenges = [
  { total: 5, divisor: 1 },
  { total: 8, divisor: 1 },

  { total: 8, divisor: 2 },
  { total: 14, divisor: 2 },

  { total: 12, divisor: 3 },
  { total: 18, divisor: 3 },

  { total: 16, divisor: 4 },
  { total: 20, divisor: 4 },

  { total: 15, divisor: 5 },
  { total: 25, divisor: 5 },

  { total: 18, divisor: 6 },
  { total: 24, divisor: 6 },

  { total: 21, divisor: 7 },
  { total: 28, divisor: 7 },

  { total: 16, divisor: 8 },
  { total: 32, divisor: 8 },

  { total: 27, divisor: 9 },
  { total: 36, divisor: 9 }
];

let currentRound = 0;
let score = 0;
let baskets = [];
let selectedApple = null;
let roundChecked = false;
let completedRounds = new Set();

function showHome() {
  divisionScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  finishPanel.classList.add("hidden");
}

function showDivision() {
  homeScreen.classList.add("hidden");
  divisionScreen.classList.remove("hidden");

  startGame();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function currentChallenge() {
  return challenges[currentRound];
}

function startGame() {
  currentRound = 0;
  score = 0;
  completedRounds = new Set();

  loadRound();
}

function loadRound() {
  const challenge = currentChallenge();

  baskets = Array.from(
    { length: challenge.divisor },
    () => []
  );

  selectedApple = null;
  roundChecked = false;

  finishPanel.classList.add("hidden");
  applesArea.classList.remove("hidden");
  basketsArea.classList.remove("hidden");
  gameActions.classList.remove("hidden");

  checkButton.classList.remove("hidden");
  nextButton.classList.add("hidden");
  clearButton.classList.remove("hidden");

  resetButton.disabled = false;
  resetButton.style.opacity = "1";

  appleTotal.textContent = `${challenge.total} 🍎`;

  problemInstruction.textContent =
    `Reparta ${challenge.total} maçãs igualmente entre ` +
    `${challenge.divisor} ` +
    `${challenge.divisor === 1 ? "cesto" : "cestos"}.`;

  roundLabel.textContent =
    `Desafio ${currentRound + 1} de ${challenges.length}`;

  scoreLabel.textContent = `Acertos: ${score}`;

  progressFill.style.width =
    `${((currentRound + 1) / challenges.length) * 100}%`;

  feedback.textContent =
    "Vamos começar! Arraste as maçãs para os cestos.";

  feedback.className = "feedback";

  renderApples();
  renderBaskets();
  updateRemaining();
}

function renderApples() {
  applePile.innerHTML = "";

  const challenge = currentChallenge();

  const placedCount = baskets.reduce(
    (sum, basket) => sum + basket.length,
    0
  );

  const remaining = challenge.total - placedCount;

  for (let i = 0; i < remaining; i++) {
    const apple = document.createElement("button");

    apple.type = "button";
    apple.className = "apple";
    apple.textContent = "🍎";
    apple.draggable = true;

    apple.setAttribute(
      "aria-label",
      `Maçã disponível ${i + 1}. Arraste ou selecione e escolha um cesto.`
    );

    apple.addEventListener("dragstart", (event) => {
      if (roundChecked) {
        event.preventDefault();
        return;
      }

      selectedApple = apple;

      event.dataTransfer.setData("text/plain", "apple");
      event.dataTransfer.effectAllowed = "move";
    });

    apple.addEventListener("click", () => {
      if (roundChecked) return;

      applePile
        .querySelectorAll(".apple")
        .forEach((item) => item.classList.remove("selected"));

      selectedApple = apple;
      apple.classList.add("selected");

      feedback.textContent =
        "Agora clique em um cesto para colocar a maçã.";

      feedback.className = "feedback";
    });

    applePile.appendChild(apple);
  }
}

function renderBaskets() {
  basketRow.innerHTML = "";

  baskets.forEach((basket, index) => {
    const basketButton = document.createElement("button");

    basketButton.type = "button";
    basketButton.className = "basket";

    basketButton.setAttribute(
      "aria-label",
      `Cesto ${index + 1}, com ${basket.length} maçãs.`
    );

    basketButton.innerHTML = `
      <span class="basket-label">
        Cesto ${index + 1}
      </span>

      <span class="basket-icon" aria-hidden="true">
        🧺
      </span>

      <span class="basket-apples">
        ${basket.map(() => "🍎").join(" ")}
      </span>

      <span class="basket-count">
        ${basket.length}
        ${basket.length === 1 ? "maçã" : "maçãs"}
      </span>
    `;

    basketButton.addEventListener("dragover", (event) => {
      if (roundChecked || !selectedApple) return;

      event.preventDefault();
      basketButton.classList.add("drag-over");
    });

    basketButton.addEventListener("dragleave", () => {
      basketButton.classList.remove("drag-over");
    });

    basketButton.addEventListener("drop", (event) => {
      event.preventDefault();

      basketButton.classList.remove("drag-over");

      if (roundChecked) return;

      moveAppleToBasket(index);
    });

    basketButton.addEventListener("click", () => {
      if (roundChecked) return;

      if (selectedApple) {
        moveAppleToBasket(index);
      } else {
        feedback.textContent =
          "Primeiro selecione uma maçã e depois escolha o cesto.";

        feedback.className = "feedback";
      }
    });

    basketRow.appendChild(basketButton);
  });
}

function moveAppleToBasket(basketIndex) {
  if (roundChecked || !selectedApple) return;

  const challenge = currentChallenge();

  const placedCount = baskets.reduce(
    (sum, basket) => sum + basket.length,
    0
  );

  if (placedCount >= challenge.total) {
    feedback.textContent =
      "Todas as maçãs já estão nos cestos. Retire algumas para reorganizar.";

    feedback.className = "feedback";

    selectedApple = null;
    return;
  }

  baskets[basketIndex].push("🍎");
  selectedApple = null;

  renderApples();
  renderBaskets();
  updateRemaining();

  feedback.textContent =
    "Muito bem! Continue repartindo as maçãs igualmente.";

  feedback.className = "feedback";
}

function updateRemaining() {
  const challenge = currentChallenge();

  const placedCount = baskets.reduce(
    (sum, basket) => sum + basket.length,
    0
  );

  const remaining = challenge.total - placedCount;

  remainingLabel.textContent =
    `Maçãs fora dos cestos: ${remaining}`;
}

function resetRound() {
  if (roundChecked) return;

  const challenge = currentChallenge();

  baskets = Array.from(
    { length: challenge.divisor },
    () => []
  );

  selectedApple = null;

  feedback.textContent =
    "Tudo pronto para tentar novamente!";

  feedback.className = "feedback";

  renderApples();
  renderBaskets();
  updateRemaining();
}

function clearBaskets() {
  if (roundChecked) return;

  const challenge = currentChallenge();

  baskets = Array.from(
    { length: challenge.divisor },
    () => []
  );

  selectedApple = null;

  renderApples();
  renderBaskets();
  updateRemaining();

  feedback.textContent =
    "Pronto! Todas as maçãs voltaram para a área inicial.";

  feedback.className = "feedback";
}

function checkAnswer() {
  if (roundChecked) return;

  const challenge = currentChallenge();

  const placedCount = baskets.reduce(
    (sum, basket) => sum + basket.length,
    0
  );

  if (placedCount < challenge.total) {
    const missing = challenge.total - placedCount;

    feedback.textContent =
      `Ainda faltam ${missing} ` +
      `${missing === 1 ? "maçã" : "maçãs"} para colocar nos cestos.`;

    feedback.className = "feedback error";
    return;
  }

  const counts = baskets.map((basket) => basket.length);

  const equallyShared = counts.every(
    (count) => count === counts[0]
  );

  if (!equallyShared) {
    feedback.textContent =
      "Quase! Todos os cestos precisam ter a mesma quantidade de maçãs. Tente reorganizar.";

    feedback.className = "feedback error";
    return;
  }

  roundChecked = true;

  if (!completedRounds.has(currentRound)) {
    score += 1;
    completedRounds.add(currentRound);
  }

  scoreLabel.textContent = `Acertos: ${score}`;

  const result = counts[0];

  feedback.textContent =
    `Muito bem! ${challenge.total} ÷ ${challenge.divisor} = ${result}. ` +
    `Cada cesto ficou com ${result} ` +
    `${result === 1 ? "maçã" : "maçãs"}!`;

  feedback.className = "feedback success";

  checkButton.classList.add("hidden");
  clearButton.classList.add("hidden");
  nextButton.classList.remove("hidden");

  resetButton.disabled = true;
  resetButton.style.opacity = "0.5";

  basketRow.querySelectorAll(".basket").forEach((basket) => {
    basket.disabled = true;
    basket.style.cursor = "default";
    basket.style.borderStyle = "solid";
    basket.style.borderColor = "#9acb98";
    basket.style.background = "#eff9ed";
  });

  applePile.innerHTML =
    '<p class="feedback success">🎉 Divisão correta!</p>';
}

function nextRound() {
  if (!roundChecked) return;

  if (currentRound < challenges.length - 1) {
    currentRound += 1;
    loadRound();
  } else {
    showFinish();
  }
}

function showFinish() {
  applesArea.classList.add("hidden");
  basketsArea.classList.add("hidden");
  gameActions.classList.add("hidden");

  finishPanel.classList.remove("hidden");

  roundLabel.textContent = "Desafios concluídos!";
  scoreLabel.textContent = `Acertos: ${score}`;
  progressFill.style.width = "100%";

  finishMessage.textContent =
    `Você acertou ${score} de ${challenges.length} desafios. ` +
    "Parabéns por praticar a divisão!";
}

openDivisionButton.addEventListener("click", showDivision);

backHomeButton.addEventListener("click", showHome);

homeLink.addEventListener("click", (event) => {
  event.preventDefault();
  showHome();
});

resetButton.addEventListener("click", resetRound);
clearButton.addEventListener("click", clearBaskets);
checkButton.addEventListener("click", checkAnswer);
nextButton.addEventListener("click", nextRound);
playAgainButton.addEventListener("click", startGame);
finishHomeButton.addEventListener("click", showHome);

// Deixa a página inicial pronta ao abrir o site.
loadRound();
showHome();
