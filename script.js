const Gameboard = (function () {
  let board = Array(9).fill(null);

  let getBoard = () => {
    return board;
  };

  const setMark = (index, marker) => {
    if (board[index] === null) {
      board[index] = marker;
      return true;
    }
    return false;
  };

  const checkWin = () => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const checkTie = () => {
    return board.every((cell) => cell !== null) && !checkWin();
  };

  const reset = () => {
    board.fill(null);
  };

  return {
    getBoard,
    setMark,
    checkWin,
    checkTie,
    reset,
  };
})();

function Player(name, marker) {
  return {
    name: name,
    marker: marker,
    score: 0,

    getWin() {
      return `${this.name}'s win!`;
    },

    getTurn() {
      return `${this.name}'s turn!`;
    },
  };
}

const GamePlay = function () {
  let players = [];
  let currentPlayerIndex = 0;
  let gameActive = true;

  const switchPlayer = () => {
    if (currentPlayerIndex === 0) {
      currentPlayerIndex = 1;
    } else {
      currentPlayerIndex = 0;
    }
  };

  const getCurrentPlayer = () => players[currentPlayerIndex];

  const StartGame = (Player_1, Player_2) => {
    players = [Player_1, Player_2];
    currentPlayerIndex = 0;
    gameActive = true;
    Gameboard.reset();

    console.log(`Игра началась! Первый ход: ${getCurrentPlayer().getTurn()}`);
  };

  const updatePlayers = (player1, player2) => {
    players = [player1, player2];
    currentPlayerIndex = 0;
    gameActive = true;
    Gameboard.reset();
  };

  return {
    StartGame,
    getCurrentPlayer,
    switchPlayer,
    updatePlayers,
    get isGameActive() {
      return gameActive;
    },
    setGameActive: (value) => {
      gameActive = value;
    },
  };
};

const DisplayGame = function () {
  let boardContainer;
  let scoreAndTurn;
  let resetBtn;
  let gamePlay;
  let player1, player2;

  const init = () => {
    boardContainer = document.querySelector(".game_container");
    scoreAndTurn = document.querySelector(".score");
    resetBtn = document.querySelector(".reset_btn");

    gamePlay = GamePlay();

    createBoard();
    updateBoard();
    setupEventListeners();

    const dialog = document.getElementById("myDialog");
    dialog.showModal();
  };

  const createBoard = () => {
    boardContainer.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index =
        i; /* Теперь у моих div элементов с одним и тем же классом будут индексы, по которым
                                я различаю свои ячейки и мне нужно создавать каждый класс отдельно для каждой ячейки*/
      boardContainer.appendChild(cell);
    }
  };

  const updateBoard = () => {
    const board = Gameboard.getBoard();
    const cells = document.querySelectorAll(".cell");

    cells.forEach((cell, index) => {
      cell.textContent = board[index] || "";
      if (board[index] === "X") {
        cell.classList.add("x-mark");
        cell.classList.remove("o-mark");
      } else if (board[index] === "O") {
        cell.classList.add("o-mark");
        cell.classList.remove("x-mark");
      } else {
        cell.classList.remove("x-mark", "o-mark");
      }
    });
  };

  const updateDisplay = () => {
    if (scoreAndTurn && gamePlay.getCurrentPlayer()) {
      const currentPlayer = gamePlay.getCurrentPlayer();
      const p1Score = player1 ? player1.score : 0;
      const p2Score = player2 ? player2.score : 0;
      scoreAndTurn.textContent = `${currentPlayer.name}'s turn (${currentPlayer.marker}) \n Score: ${p1Score} - ${p2Score}`;
    }
  };

  const handleCellClick = (index) => {
    const currentPlayer = gamePlay.getCurrentPlayer();

    if (!gamePlay.isGameActive) {
      scoreAndTurn.textContent = "Game Over! Press Reset to play again.";
      return;
    }

    const success = Gameboard.setMark(index, currentPlayer.marker);

    if (success) {
      updateBoard();
      const winner = Gameboard.checkWin();
      if (winner) {
        scoreAndTurn.textContent = `${currentPlayer.name} wins! 🎉 | Score: ${player1.score} - ${player2.score}`;
        currentPlayer.score += 1;
        gamePlay.setGameActive(false);
        updateDisplay();

        if (currentPlayer.score === 5) {
          scoreAndTurn.textContent = `${currentPlayer.name} wins the match! 🏆`;
          return;
        }
        setTimeout(() => {
          if (confirm(`${currentPlayer.name} wins! Play again?`)) {
            Gameboard.reset();
            updateBoard();

            gamePlay.setGameActive(true);
            gamePlay.switchPlayer();
            updateDisplay();
          }
        }, 100);
        return;
      }

      if (Gameboard.checkTie()) {
        scoreAndTurn.textContent = "It's a tie! 🤝";
        gamePlay.setGameActive(false);

        setTimeout(() => {
          if (confirm("It's a tie! Play again?")) {
            Gameboard.reset();
            updateBoard();
            gamePlay.setGameActive(true);
            gamePlay.switchPlayer(); // Меняем игрока для следующей игры
            updateDisplay();
          }
        }, 100);
        return;
      }

      gamePlay.switchPlayer();
      updateDisplay();
    } else {
      // Если ячейка занята
      scoreAndTurn.textContent = "Cell is taken! Try again.";
      setTimeout(() => updateDisplay(), 1000);
    }
  };

  const handleReset = () => {
    Gameboard.reset();
    gamePlay.setGameActive(true);

    if (player1) player1.score = 0;
    if (player2) player2.score = 0;
    gamePlay.switchPlayer();
    updateBoard();
    updateDisplay();

    const dialog = document.getElementById("myDialog");
    dialog.showModal();
  };

  const setupEventListeners = () => {
    boardContainer.addEventListener("click", (event) => {
      const cell = event.target.closest(".cell");
      if (cell && gamePlay.isGameActive) {
        const index = parseInt(cell.dataset.index);
        handleCellClick(index);
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", handleReset);
    }
  };

  const startGameWithNames = (name1, name2) => {
    // Создаём игроков с введёнными именами
    player1 = Player(name1 || "Player 1", "X");
    player2 = Player(name2 || "Player 2", "O");

    // Запускаем игру
    gamePlay.StartGame(player1, player2);
    updateBoard();
    updateDisplay();
  };

  return {
    init,
    startGameWithNames,
  };
};

const game = DisplayGame();
game.init();

const dialog = document.getElementById("myDialog");


const openBtn = document.querySelector(".reset_btn");
openBtn.addEventListener("click", () => {
  dialog.showModal();
});

dialog.addEventListener("close", () => {
  if (dialog.returnValue === "play") {
    const player1Name = document.getElementById("player_one_name").value;
    const player2Name = document.getElementById("player_two_name").value;

    console.log("Игрок 1:", player1Name);
    console.log("Игрок 2:", player2Name);

    game.startGameWithNames(player1Name, player2Name);
  }

  document.getElementById("player_one_name").value = "";
  document.getElementById("player_two_name").value = "";
});
