let timerInterval; // Timer interval ID
let timerActive = false; // Timer status
let userName = ""; // User's name

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("sudoku-grid");

    // Initialize the Sudoku grid with 81 inputs
    for (let i = 0; i < 81; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.classList.add("form-control", "text-center", "p-0");
        input.addEventListener("input", validateInput);
        grid.appendChild(input);
    }

    // Attach event listeners for buttons
    const startButton = document.getElementById("start-button");
    const solveButton = document.getElementById("solve-button");
    const resetButton = document.getElementById("reset-button");
    const submitButton = document.getElementById("submit-button");

    startButton.addEventListener("click", () => {
        if (!timerActive) {
            startButton.disabled = true;
            solveButton.disabled = false;
            submitButton.disabled = false;
            startTimer(5 * 60, document.getElementById("timer")); // 5 minutes
        }
    });

    solveButton.addEventListener("click", showSolution);
    resetButton.addEventListener("click", resetGame);
    submitButton.addEventListener("click", submitGame);

    // Show name prompt and initialize the game on page load
    promptUserName();
});

// Prompt for user's name
function promptUserName() {
    userName = prompt("Please enter your name to start the Sudoku game:", "Player");
    if (!userName || userName.trim() === "") {
        userName = "Player"; // Default name
    }
    alert(`Welcome, ${userName}! Get ready to play!`);
    resetGame();
}

// Validate user input to allow only numbers 1-9
function validateInput(event) {
    const value = event.target.value;
    if (!/^[1-9]$/.test(value)) {
        event.target.value = ""; // Clear invalid input
    }
}

// Populate the Sudoku grid with a given puzzle
function setGridValues(values) {
    const grid = Array.from(document.querySelectorAll("#sudoku-grid input"));
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = grid[i * 9 + j];
            cell.value = values[i][j] !== 0 ? values[i][j] : ""; // Fill with numbers or leave empty
            cell.disabled = values[i][j] !== 0; // Disable pre-filled cells
        }
    }
}

// Start the countdown timer
function startTimer(duration, display) {
    let timer = duration;
    timerActive = true;

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;

        display.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        if (--timer < 0) {
            clearInterval(timerInterval);
            timerActive = false;
            alert("Time's up! Submitting your solution.");
            submitGame(); // Auto-submit on timeout
        }
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
    timerActive = false;
}

// Reset the game with a new puzzle
function resetGame() {
    stopTimer();
    document.getElementById("timer").textContent = "Time Remaining: 5:00";
    document.getElementById("start-button").disabled = false;
    document.getElementById("solve-button").disabled = true;
    document.getElementById("submit-button").disabled = true;

    const puzzle = generateRandomSudoku(); // Generate a random Sudoku puzzle
    setGridValues(puzzle);
}

// Show the solution for the current puzzle
function showSolution() {
    if (timerActive) stopTimer(); // Stop the timer if it's running
    const grid = getGridValues();
    solve(grid); // Solve the puzzle
    setGridValues(grid); // Display the solution
    alert("Solution revealed!");
}

// Retrieve the current values from the Sudoku grid
function getGridValues() {
    const grid = Array.from(document.querySelectorAll("#sudoku-grid input"));
    const values = [];
    for (let i = 0; i < 9; i++) {
        values[i] = grid.slice(i * 9, i * 9 + 9).map(input => parseInt(input.value) || 0);
    }
    return values;
}

// Submit the game and calculate score
function submitGame() {
    const grid = getGridValues();
    const isCorrect = checkSolution(grid);

    stopTimer(); // Stop the timer

    const message = isCorrect
        ? `Congratulations, ${userName}! You passed the Sudoku game.`
        : `Sorry, ${userName}. You failed. Try again.`;

    alert(message);
    resetGame(); // Reset the game for a new attempt
}

// Check if the solution is correct
function checkSolution(grid) {
    const solvedGrid = JSON.parse(JSON.stringify(grid)); // Deep copy to avoid modifying the current grid
    return solve(solvedGrid) && JSON.stringify(grid) === JSON.stringify(solvedGrid);
}

// Check if a number can be placed in a cell
function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;

        const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
        const boxCol = 3 * Math.floor(col / 3) + (i % 3);
        if (board[boxRow][boxCol] === num) return false;
    }
    return true;
}

// Solve the Sudoku puzzle using backtracking
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

// Generate a random Sudoku puzzle
function generateRandomSudoku() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillDiagonalBoxes(board);
    solve(board);
    removeRandomCells(board, 40); // Remove 40 cells to create a puzzle
    return board;
}

// Fill diagonal 3x3 boxes with random numbers
function fillDiagonalBoxes(board) {
    for (let i = 0; i < 9; i += 3) {
        fillBox(board, i, i);
    }
}

// Fill a 3x3 box with random numbers
function fillBox(board, rowStart, colStart) {
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let index = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[rowStart + i][colStart + j] = numbers[index++];
        }
    }
}

// Shuffle an array of numbers
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Remove random cells to create a puzzle
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
