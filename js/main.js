// DOTS & BOXES
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––ß
// The game board is composed of rows and columns of boxes.
// Boxes are composed of four edges. Adjacent boxes share a reference to the same edge.
// Two players take turns clicking box edges. The player who clicks the fourth edge surrounding any given 1 × 1 box completes that
// box and takes another turn. When all the boxes are complete, the game ends and the player who has the most boxes wins the game.
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

/*----- Classes -----*/

// Box class used to create boxes objects to be layed out in rows and columns on the board
// A box is composed of four edge objects – 2 horizontal edges ('hedge') and 2 vertical edges ('vedge')
// Note: When creating boxes, check if they share an edge with a box directly above and/or to the left on the board
class Box {
    constructor(boxId, left, top) {
        this.boxId = boxId; // Should only be set once
        this.completedBy = undefined; // Should only be set once
        this.squareEl = undefined;

        // 4 edges of the box
        if (left === undefined) {
            this.left = new Edge();
        } else {
            this.left = left;}
        if (top === undefined) {
            this.top = new Edge();
        } else {
            this.top = top;}
        this.right = new Edge();
        this.bottom = new Edge();
    }

    // Checks the completion state of the box
    checkCompletion() {
        if (this.left.clickedBy != undefined && this.top.clickedBy != undefined && 
            this.right.clickedBy != undefined && this.bottom.clickedBy != undefined) {
            return true; // Returns true only if all the edges have been clicked
        } else {
            return false;
        }
    }

    setCompletedBy(completedBy) {
        if (this.completedBy === undefined) { // CompletedBy state can only be set once
            this.completedBy = completedBy;
        }
    }
}

// Edge class used to create edge objects for boxes
class Edge {
    constructor() {
        this.clickedBy = undefined; // Should only be set once
        this.edgeEl = undefined;
    }
}

/*----- Game state -----*/

// Player objects
const PLAYERS = {
    '1': {
        name: 'Player 1',
        colorPrimary: '#ff5233', // For edge colors and player scores
        colorSecondary: '#ff7d66', // For box colors
        score: 0
    },
    '-1': {
        name: 'Player 2',
        colorPrimary: '#4881ea',
        colorSecondary: '#76a0ef',
        score: 0
    }
};

// Board array to hold rows of box objects
const BOARD = [];

// Default number of rows and columns when website is first loaded
const DEFAULT_NUM_OF_ROWS = 4;
const DEFAULT_NUM_OF_COLS = 4;
// Number of rows and columns for the current game as indicated by the rowSizeSelectEl and colSizeSelectEl
let numOfRows = DEFAULT_NUM_OF_ROWS;
let numOfCols = DEFAULT_NUM_OF_COLS;

// True for the first game only
let useDefaultNumOfRowsAndCols = true;

const DEFAULT_START_TURN = 1; // 1 => Player 1, -1 => Player 2
let turn = DEFAULT_START_TURN;

let winnerId; // 1 => Player 1, -1 => Player 2, 0 => Tie


/*----- Cached element references -----*/

let boardEl = document.getElementById('board');
let player1ScoreEl = document.getElementById('player-1-score');
let player2ScoreEl = document.getElementById('player-2-score');
let player1NameEl = document.getElementById('player-1-name');
let player2NameEl = document.getElementById('player-2-name');

let rowSizeSelectEl = document.getElementById('row-select');
let colSizeSelectEl = document.getElementById('col-select');
let mainButtonEl = document.getElementById('main-button');
let barButtonEl = document.getElementById('bar-button');

let modal = document.getElementById('myModal');
let closeEl = document.getElementsByClassName("close")[0];
let modalPEl = document.querySelector('p');

/*----- Event listeners -----*/

// Listen for any click on the board and use event delegation to understand which component was clicked
boardEl.addEventListener('click', onBoardClick);

// Click listener for the reset button
mainButtonEl.addEventListener('click', function() {
    // Clear the game state before calling init() to avoid pushing duplicate elements on to the board
    clearGameState();
    // Call init() after clearing the game's state
    init(); 
    render();
});

barButtonEl.addEventListener('click', function() {
    // Clear the game state before calling init() to avoid pushing duplicate elements on to the board
    clearGameState();
    // Call init() after clearing the game's state
    init(); 
    render();
});

/*----- Functions -----*/

// Initalise a game
function init() {
    // Set the default board dimensions for the first game)
    if (useDefaultNumOfRowsAndCols) {
        for(let i, j = 0; i = rowSizeSelectEl.options[j]; j++) {
            if (parseInt(i.value) === DEFAULT_NUM_OF_ROWS) {
                rowSizeSelectEl.selectedIndex = j;
                break;
            }
        }
        for(let i, j = 0; i = colSizeSelectEl.options[j]; j++) {
            if (parseInt(i.value) === DEFAULT_NUM_OF_COLS) {
                colSizeSelectEl.selectedIndex = j;
                break;
            }
        }
    }

    // Only use default settings once
    useDefaultNumOfRowsAndCols = false;
    player1NameEl.innerText = PLAYERS[1].name;
    player2NameEl.innerText = PLAYERS[-1].name;
    renderScores();
    renderBoardDimensions();

    // Build 2D array containing rows of box objects
    let boxId = 0;
    for (let rowId = 0; rowId < numOfRows; rowId++) {
        let row = [];
        for (let colId = 0; colId < numOfCols; colId++) {
            row.push(new Box(boxId++, checkLeft(row, colId), checkAbove(rowId, colId)));
        }
        BOARD.push(row);
    }
    intitBoardEl();
}

// Resets necessary variables required for a new game
function clearGameState() {
    PLAYERS[1].score = 0;
    PLAYERS[-1].score = 0;
    turn = DEFAULT_START_TURN;
    winnerId = undefined;
    numOfRows = parseInt(rowSizeSelectEl.options[rowSizeSelectEl.selectedIndex].value);
    numOfCols = parseInt(colSizeSelectEl.options[colSizeSelectEl.selectedIndex].value);
    while(BOARD.length > 0) {
        BOARD.pop();
    }
    while (boardEl.firstChild) {
        boardEl.removeChild(boardEl.firstChild);
    }
}

// Initalise the board elements (squares, dots, hedges, and vedges)
function intitBoardEl() {
    for (let rowId = 0; rowId < numOfRows; rowId++) {
        initHedgeRow(rowId);
        initVedgeRow(rowId);
        // Add another HedgeRow for the last row of boxes
        if (rowId + 1 === numOfRows) initHedgeRow(rowId + 1);
    }
}

// Initialise a single row of horizontal edges from left -> right
function initHedgeRow(rowId) {
    for (let colId = 0; colId < numOfCols; colId++) {
        let dotEl = document.createElement('div');
        let hedgeEl = document.createElement('div');
        dotEl.classList.add('dot');
        hedgeEl.classList.add('hedge');
        hedgeEl.setAttribute('id', `r${rowId}c${colId}`);
        boardEl.append(dotEl, hedgeEl);

        // Update box object containing those elements
        if (rowId === numOfRows) { // HedgeRow for the bottom of the board
            BOARD[numOfRows - 1][colId].bottom.edgeEl = hedgeEl;
        } else { // All other HedgeRows are for the top of boxes
            BOARD[rowId][colId].top.edgeEl = hedgeEl;
        }
    }
    let dotEl = document.createElement('div');
    dotEl.classList.add('dot');
    boardEl.append(dotEl);
}

// Initalise a single row of vertical edges from left -> right
function initVedgeRow(rowId) {
    for (let colId = 0; colId < numOfCols; colId++) {
        let vedgeEl = document.createElement('div');
        let squareEl = document.createElement('div');
        vedgeEl.classList.add('vedge');
        vedgeEl.setAttribute('id', `r${rowId}c${colId}`);
        squareEl.classList.add('square');
        boardEl.append(vedgeEl, squareEl);

        // Updates box object containing those elements
        BOARD[rowId][colId].left.edgeEl = vedgeEl; // Uses left.edgeEl
        BOARD[rowId][colId].squareEl = squareEl;
    }
    // VedgeRow for the right most edge of the board
    let lastVedgeEl = document.createElement('div');
    lastVedgeEl.classList.add('vedge');
    lastVedgeEl.setAttribute('id', `r${rowId}c${numOfCols}`);
    boardEl.append(lastVedgeEl);
    BOARD[rowId][numOfCols - 1].right.edgeEl = lastVedgeEl; // Uses right.edgeEl
}

// When the user clicks on the (x), close the modal
closeEl.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close the modal
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// When the user clicks an edge, update the game state and render the changes
function onBoardClick(evt) {
    // Get which element was clicked
    const targetEl = evt.target;

    // If the element was an edge element (has the hedge or vedge class), 
    // get a reference to the first box object that holds it; else eturn early
    let clickedBoxObj;
    if (targetEl.classList.contains('vedge') || targetEl.classList.contains('hedge')) {
        clickedBoxObj = BOARD[getRowIdAsNum(targetEl.id)][getColIdAsNum(targetEl.id)];
    } else {
        return;
    }
    
    // Get a reference to the edge object that holds the clicked edge element
    let clickedEdgeObj;
    if (clickedBoxObj.top.edgeEl === targetEl) {
        clickedEdgeObj = clickedBoxObj.top;
    } else if (clickedBoxObj.right.edgeEl === targetEl) {
        clickedEdgeObj = clickedBoxObj.right
    } else if (clickedBoxObj.bottom.edgeEl === targetEl) {
        clickedEdgeObj = clickedBoxObj.bottom;
    } else if (clickedBoxObj.left.edgeEl === targetEl) {
        clickedEdgeObj = clickedBoxObj.left;
    }

    // If the edge element was already clicked, return early; else set the clicked state of the edge object
    if (clickedEdgeObj.clickedBy != undefined) {
        return;
    } else {
        clickedEdgeObj.clickedBy = turn;
    }

    // The score before querying all the boxes
    let scoreSumBefore = PLAYERS[1].score + PLAYERS[-1].score;

    // For every box, set which player completed it and update the scores
    setAllBoxCompletedByStates();

    // The score after querying all the boxes
    let scoreSumAfter = PLAYERS[1].score + PLAYERS[-1].score;
    
    // Change which player's turn it is only if the scores don't change (ie. Nobody completed a box)
    if (scoreSumBefore === scoreSumAfter) {
        turn *= -1;
    }

    // Once all the game state has been updated, render the changes
    render(clickedEdgeObj);
}

// Checks all boxes for completion state,
// stores which player completed each respective box and updates the scores
function setAllBoxCompletedByStates() {
    let player1Score = 0;
    let player2Score = 0;
    for (let rowId = 0; rowId < numOfRows; rowId++) {
        for (let colId = 0; colId < numOfCols; colId++) {
            let box = BOARD[rowId][colId];
            if (box.checkCompletion()) {
                if (box.completedBy === undefined) box.completedBy = turn;
                if (box.completedBy === 1) {
                    player1Score++;
                } else if (box.completedBy === -1) {
                    player2Score++;
                }
            }
        }
    }
    PLAYERS[1].score = player1Score;
    PLAYERS[-1].score = player2Score;
}

// Checks if the game is complete
function isGameComplete() {
    winnerId = 1;return true;
    if (numOfRows * numOfCols === PLAYERS[1].score + PLAYERS[-1].score) {
        if (PLAYERS[1].score === PLAYERS[-1].score) {
            winnerId = 0;
        } else if (PLAYERS[1].score > PLAYERS[-1].score) {
            winnerId = 1;
        } else {
            winnerId = -1;
        }
        return true;
    } else {
        return false;
    }
}

// Within the context of the game board, if there exists a box to the left of the current box,
// return a reference to the right edge object of that box
function checkLeft(row, colId) {
    if (row[colId - 1] != undefined) {
        return row[colId - 1].right;
    }
}

// Within the context of the game board, if there exists a box above the current box, 
// return a reference to the bottom edge object of that box
function checkAbove(rowId, colId) {
    if (BOARD[rowId - 1] != undefined) {
        return BOARD[rowId - 1][colId].bottom;
    }
}

// Gets the rowId as a number from the edgeId string of some edge element
function getRowIdAsNum(edgeId) {
    let rowId = parseInt(edgeId.slice(1, edgeId.indexOf('c')));
    if (rowId === numOfRows) { // The last row edge
        return rowId - 1;
    } else {
        return rowId;
    }
}
 
// Gets the colId as a number from the edgeId string of some edge element
function getColIdAsNum(edgeId) {
    let colId = parseInt(edgeId.slice(edgeId.indexOf('c') + 1, edgeId.length));
    if (colId === numOfCols) {
        return colId - 1;
    } else {
        return colId;
    }
 }

// The main render function
// To be called after every turn (ie. after a user clicks an edge that has not been clicked) 
// and when the NEW GAME button is clicked
function render(clickedEdge) {
    renderEdgeColor(clickedEdge);
    renderBoxColor();
    renderScores();
    renderGameComplete();
}

// Renders the edge colour according to which player clicked it
function renderEdgeColor(edgeObj) {
    if (edgeObj != undefined) {
        edgeObj.edgeEl.style.backgroundColor = PLAYERS[edgeObj.clickedBy].colorPrimary;
    }
}

// Renders the box colour upon box completion (all four of its edges have been clicked)
function renderBoxColor() {
    for (let rowId = 0; rowId < numOfRows; rowId++) {
        for (let colId = 0; colId < numOfCols; colId++) {
            let box = BOARD[rowId][colId];
            if (box.checkCompletion()) {
                box.squareEl.style.backgroundColor = PLAYERS[box.completedBy].colorSecondary;
            }
        }
    }
}

// Renders the score numbers on for the players' scores
function renderScores() {
    player1ScoreEl.innerText = `${PLAYERS[1].score}`;
    player2ScoreEl.innerText = `${PLAYERS[-1].score}`;
    if (turn === 1) {
        player1ScoreEl.parentNode.classList.add("active");
        player2ScoreEl.parentNode.classList.remove("active");
    } else if (turn === -1) {
        player1ScoreEl.parentNode.classList.remove("active");
        player2ScoreEl.parentNode.classList.add("active");
    }
}

// Renders the game completion modal
function renderGameComplete() {
    if (isGameComplete()) {
        let gameCompleteString;
        switch(winnerId) {
            case 1:
                gameCompleteString = `${PLAYERS[1].name} wins!`;
                break;
            case -1:
                gameCompleteString = `${PLAYERS[-1].name} wins!`;
                break;
            case 0:
                gameCompleteString = "It's a tie!";
                break;
            default:
        }
        modalPEl.innerText = gameCompleteString;
        modal.style.display = "block";
    } else {
        modal.style.display = "none";
    }
}

// Renders the updated board dimensions
function renderBoardDimensions() {
    // Update the state variables
    numOfRows = parseInt(rowSizeSelectEl.options[rowSizeSelectEl.selectedIndex].value);
    numOfCols = parseInt(colSizeSelectEl.options[colSizeSelectEl.selectedIndex].value);

    // Change the board element
    boardEl.style.gridTemplateRows = `repeat(${numOfRows}, 1fr 10fr) 1fr`;
    boardEl.style.gridTemplateColumns = `repeat(${numOfCols}, 1fr 10fr) 1fr`;
}

 // Runs the game
init();