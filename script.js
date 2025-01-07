let timerInterval; // Timer interval ID
let timerActive = false; // Timer status

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("sudoku-grid");
    for (let i = 0; i < 81; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        grid.appendChild(input);
    }

    // Generate and set the initial random Sudoku puzzle
    resetGame();

    // Attach event listeners for buttons
    const startButton = document.getElementById("start-button");
    const solveButton = document.getElementById("solve-button");
    const resetButton = document.getElementById("reset-button");

    startButton.addEventListener("click", () => {
        if (!timerActive) {
            startButton.disabled = true;
            solveButton.disabled = false;
            startTimer(5 * 60, document.getElementById("timer"));
        }
    });

    solveButton.addEventListener("click", showSolution);
    resetButton.addEventListener("click", resetGame);
});

function setGridValues(values) {
    const grid = Array.from(document.querySelectorAll("#sudoku-grid input"));
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = grid[i * 9 + j];
            cell.value = values[i][j] !== 0 ? values[i][j] : "";
            cell.disabled = values[i][j] !== 0; // Disable pre-filled cells
        }
    }
}

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    timerActive = true; // Mark the timer as active
    timerInterval = setInterval(() => {
        if (!timerActive) {
            clearInterval(timerInterval);
            return;
        }

        minutes = Math.floor(timer / 60);
        seconds = timer % 60;
        display.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        if (--timer < 0) {
            clearInterval(timerInterval);
            timerActive = false;
            alert("Time's up! Here's the solution. You failed.");
            showSolution();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerActive = false; // Stop the timer
}

function resetGame() {
    stopTimer(); // Stop the timer if running
    document.getElementById("timer").textContent = "Time Remaining: 5:00";
    document.getElementById("start-button").disabled = false;
    document.getElementById("solve-button").disabled = true;

    const puzzle = generateRandomSudoku();
    setGridValues(puzzle);
}

function showSolution() {
    if (timerActive) stopTimer(); // Stop the timer if active
    const grid = getGridValues();
    solve(grid);
    setGridValues(grid);
    alert("Solution revealed. You failed to solve the puzzle in time.");
}

function getGridValues() {
    const grid = Array.from(document.querySelectorAll("#sudoku-grid input"));
    const values = [];
    for (let i = 0; i < 9; i++) {
        values[i] = grid.slice(i * 9, i * 9 + 9).map(input => {
            const value = parseInt(input.value);
            return isNaN(value) ? 0 : value;
        });
    }
    return values;
}

function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
        const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
        const boxCol = 3 * Math.floor(col / 3) + i % 3;
        if (board[boxRow][boxCol] === num) return false;
    }
    return true;
}

function solve(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solve(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function generateRandomSudoku() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillDiagonalBoxes(board);
    solve(board);
    removeRandomCells(board, 40); // Remove 40 cells to create a puzzle
    return board;
}

function fillDiagonalBoxes(board) {
    for (let i = 0; i < 9; i += 3) {
        fillBox(board, i, i);
    }
}

function fillBox(board, rowStart, colStart) {
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let index = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[rowStart + i][colStart + j] = numbers[index++];
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function removeRandomCells(board, count) {
    while (count > 0) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            count--;
        }
    }
}
