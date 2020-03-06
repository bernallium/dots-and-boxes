// DOTS & BOXES
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//  The game board is composed of rows and columns of boxes.
//  Boxes are composed of four edges. Adjacent boxes share a reference to the same edge.
//  Two players take turns clicking box edges. 
//  The player who clicks the fourth edge surrounding any given box completes that box.
//  When a player completes a box, that player gets another turn to click another edge.
//  Once the board is full, the player that has completed the most number of boxes wins.
// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

/*----- constants -----*/

const Players = {
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

// Default number of rows and columns for game board (3 x 3 grid)
let numOfRows = 3;
let numOfCols = 3;

// Box class used to create boxes objects to be layed out in rows and columns on the board
// A box is composed of four edge objects – 2 horizontal edges ('hedge') and 2 vertical edges ('vedge')
// Note: When creating boxes, check if they share an edge with a box directly above and to the left on the board
class Box {
    constructor(boxId, left, top) {
        this.boxId = boxId;
        this.completedBy = undefined;
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

    // Checks and sets the completion state of the box
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
        this.clickedBy = undefined; // Use setter to set state
        this.edgeEl = undefined;
    }

    // Clicked state can only be set once
    setClickedBy(clickedBy) {
        if (this.clickedBy === undefined) {
            this.clickedBy = clickedBy;
        }
    }
}

/*----- Game state -----*/

let board = [];
let turn = 1;

/*----- Cached element references -----*/

let boardEl = document.getElementById('board');
let player1ScoreEl = document.getElementById('player-1-score');
let player2ScoreEl = document.getElementById('player-2-score');
let rowSizeSelectEl = document.getElementById('row-select');
let colSizeSelectEl = document.getElementById('col-select');
let resetButtonEl = document.querySelector('button');

// Modal references
let modal = document.getElementById('myModal');
let span = document.getElementsByClassName("close")[0];
let modalPEl = document.querySelector('p');

/*----- Event listeners -----*/

// Listen for any click on the board and use event delegation to understand which component was clicked
boardEl.addEventListener('click', handleBoardClick);

// Click listener for the reset button
resetButtonEl.addEventListener('click', function() {
    // Clear the game state before calling init() to avoid pushing duplicate elements on to the board
    clearState();

    // Call init() after clearning the game's state
    init();
    render();
});

/*----- Functions -----*/

function init() {
    renderScores();
    // TODO Remove this
  
    changeBoardDimensions();

    // Build board of box objects (2D array containing rows of box objects)
    let boxId = 0;
    for (let rowId = 0; rowId < numOfRows; rowId++) {
        let row = [];
        for (let colId = 0; colId < numOfCols; colId++) {
            row.push(new Box(boxId++, checkLeft(row, colId), checkAbove(rowId, colId)));
        }
        board.push(row);
    }

    intitBoardEl();
}

function clearState() {
    // Clear the scores
    Players[1].score = 0;
    Players[-1].score = 0;

    // Reset who's turn it is
    turn = 1;

    // Clear the board array
    while(board.length > 0) {
        board.pop();
    }

    // Remove children from board element
    while (boardEl.firstChild) {
        boardEl.removeChild(boardEl.firstChild);
    }
    console.log('Game state cleared');
}



function isGameComplete() {
    if (numOfRows * numOfCols === Players[1].score + Players[-1].score) {
        return true;
    } else {
        return false;
    }
}

function renderGameComplete() {
    if (numOfRows * numOfCols === Players[1].score + Players[-1].score) {
        let gameWinnerString;
        if (Players[1].score === Players[-1].score) {
            gameWinnerString = "It's a tie!"
        } else if (Players[1].score > Players[-1].score) {
            gameWinnerString = `${Players[1].name} wins!`;
        } else {
            gameWinnerString = `${Players[-1].name} wins!`;
        }
        // Set the game completion message and reveal the modal
        modalPEl.innerText = gameWinnerString;
        modal.style.display = "block";
    } else {
        modal.style.display = "none";
    }
}

function changeBoardDimensions() {
    // Update the state variables
    numOfRows = parseInt(rowSizeSelectEl.options[rowSizeSelectEl.selectedIndex].value);
    numOfCols = parseInt(colSizeSelectEl.options[colSizeSelectEl.selectedIndex].value);
    console.log(numOfRows);
    console.log(numOfCols);

    // Change the board element
    boardEl.style.gridTemplateRows = `repeat(${numOfRows}, 1fr 10fr) 1fr`;
    boardEl.style.gridTemplateColumns = `repeat(${numOfCols}, 1fr 10fr) 1fr`;

    // Each box should be 140px
    // boardEl.style.width = `${numOfCols * 140}px`;
    // boardEl.style.height = `${numOfRows * 140}px`;
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function handleBoardClick(evt) {
    // Get which element was clicked
    const targetEl = evt.target;

    // If the element was an edge element (has the hedge or vedge class), 
    // get a reference to the first box object that holds it
    // If it wasn't an edge element, return early
    if (targetEl.classList.contains('vedge') || targetEl.classList.contains('hedge')) {
        const boxRowId = getRowIdAsNum(targetEl.id);
        const boxColId = getColIdAsNum(targetEl.id);
        clickedBox = board[boxRowId][boxColId];
    } else {
        return;
    }
    
    // Get a reference to the edge object that holds clicked edge element
    let clickedEdge;
    if (clickedBox.top.edgeEl === targetEl) {
        clickedEdge = clickedBox.top;
    } else if (clickedBox.right.edgeEl === targetEl) {
        clickedEdge = clickedBox.right
    } else if (clickedBox.bottom.edgeEl === targetEl) {
        clickedEdge = clickedBox.bottom;
    } else if (clickedBox.left.edgeEl === targetEl) {
        clickedEdge = clickedBox.left;
    }

    // If the edge element was already clicked, return early;
    // else set the clicked state of the edge object
    if (clickedEdge.clickedBy != undefined) {
        return;
    } else {
        clickedEdge.setClickedBy(turn);
    }

    // The score before querying all the boxes
    let scoreSumBefore = Players[1].score + Players[-1].score;

    // For every box, set which player completed it and update the scores
    setAllBoxCompletedByStates();

    // The score after querying all the boxes
    let scoreSumAfter = Players[1].score + Players[-1].score;
    
    // Change which player's turn it is only if the scores don't change (ie. Nobody completed a box)
    if (scoreSumBefore === scoreSumAfter) {
        turn *= -1;
    }

    // Once all the game state has been updated, render the changes
    render(clickedEdge);
}

// Checks all boxes for completion state,
// stores which player completed each respective box and
// updates the scores
function setAllBoxCompletedByStates() {
    let player1Score = 0;
    let player2Score = 0;
    for (let rowId = 0; rowId < numOfRows; rowId++) {
        for (let colId = 0; colId < numOfCols; colId++) {
            let box = board[rowId][colId];
            if (box.checkCompletion()) {
                box.setCompletedBy(turn);
                if (box.completedBy === 1) {
                    player1Score++;
                } else if (box.completedBy === -1) {
                    player2Score++;
                }
            }
        }
    }
    Players[1].score = player1Score;
    Players[-1].score = player2Score;
}

// Call render after every turn (ie. after a user clicks an edge that has not been clicked) once game state has all been updated
function render(clickedEdge) {
    renderEdgeColor(clickedEdge);
    renderBoxColor();
    renderScores();
    renderGameComplete();
    console.log(board);
    console.log('Full render');
}

// Renders the edge colour according to which player clicked it
function renderEdgeColor(edgeObj) {
    if (edgeObj != undefined) {
        edgeObj.edgeEl.style.backgroundColor = Players[edgeObj.clickedBy].colorPrimary;
    }
}

// Renders the box colour upon box completion (all four edges have been clicked)
function renderBoxColor() {
    for (let rowId = 0; rowId < numOfRows; rowId++) {
        for (let colId = 0; colId < numOfCols; colId++) {
            let box = board[rowId][colId];
            if (box.checkCompletion()) {
                box.squareEl.style.backgroundColor = Players[box.completedBy].colorSecondary;
            }
        }
    }
}

function renderScores() {
    player1ScoreEl.innerText = `${Players[1].score}`;
    player2ScoreEl.innerText = `${Players[-1].score}`;
    if (turn === 1) {
        player1ScoreEl.parentNode.classList.add("active");
        player2ScoreEl.parentNode.classList.remove("active");
    } else if (turn === -1) {
        player1ScoreEl.parentNode.classList.remove("active");
        player2ScoreEl.parentNode.classList.add("active");
    }
}

// Initalise the board elements (squares, hedges and vedges)
function intitBoardEl() {
    for (let rowId = 0; rowId < numOfRows; rowId++) {
        createHedgeRow(rowId);
        createVedgeRow(rowId);
        // Add another HedgeRow for the last row of boxes
        if (rowId + 1 === numOfRows) createHedgeRow(rowId + 1);
    }
}

// Initialize a single row of horizontal edges
function createHedgeRow(rowId) {
    for (let colId = 0; colId < numOfCols; colId++) {
        let dotEl = document.createElement('div');
        let hedgeEl = document.createElement('div');
        dotEl.classList.add('dot');
        hedgeEl.classList.add('hedge');
        boardEl.append(dotEl, hedgeEl);

        // let id = Array.prototype.indexOf.call(hedgeEl.parentNode.children, hedgeEl);
        let id = (`r${rowId}c${colId}`);
        hedgeEl.setAttribute('id', id);
        if (rowId === numOfRows) { // HedgeRow for the bottom of the board
            board[numOfRows - 1][colId].bottom.edgeEl = hedgeEl;
        } else { // All other HedgeRows are for the top of boxes
            board[rowId][colId].top.edgeEl = hedgeEl;
        }
    }
    let dotEl = document.createElement('div');
    dotEl.classList.add('dot');
    boardEl.append(dotEl);
}

// Initalize a single row of vertical edges
function createVedgeRow(rowId) {
    for (let colId = 0; colId < numOfCols; colId++) {
        let vedgeEl = document.createElement('div');
        let squareEl = document.createElement('div');
        vedgeEl.classList.add('vedge');
        squareEl.classList.add('square');
        boardEl.append(vedgeEl, squareEl);

        // let id = Array.prototype.indexOf.call(vedgeEl.parentNode.children, vedgeEl);
        let id = (`r${rowId}c${colId}`);
        vedgeEl.setAttribute('id', id);
        board[rowId][colId].left.edgeEl = vedgeEl; // left.edgeEl
        board[rowId][colId].squareEl = squareEl;
    }
    let vedgeEl = document.createElement('div');
    vedgeEl.classList.add('vedge');
    boardEl.append(vedgeEl);
    // let id = Array.prototype.indexOf.call(vedgeEl.parentNode.children, vedgeEl);
    let id = (`r${rowId}c${numOfCols}`)
    vedgeEl.setAttribute('id', id);
    // VedgeRow for the right most edge of the board
    board[rowId][numOfCols - 1].right.edgeEl = vedgeEl; // right.edgeEl
}

// If there exists a box to the left of the current box,
// return a reference to the right edge object of that box
function checkLeft(row, colId) {
    if (row[colId - 1] != undefined) { // Do this only if a box on the left actually exists 
        return row[colId - 1].right;
    }
}

// If there exists a box above the current box, 
// return a reference to the bottom edge object of that box
function checkAbove(rowId, colId) {
    if (board[rowId - 1] != undefined) { // Do this only if the row above actually exists
        return board[rowId - 1][colId].bottom;
    }
}

// Grabs the first box that has an edge with the given edgeId and returns that box's rowId
function getRowIdAsNum(edgeId) {
    let rowId = parseInt(edgeId.slice(1, edgeId.indexOf('c')));
    if (rowId === numOfRows) { // The last row edge
        return rowId - 1;
    } else {
        return rowId;
    }
}
 
// Grabs the first box that has an edge with the given edgeId and returns that box's rowId
function getColIdAsNum(edgeId) {
    let colId = parseInt(edgeId.slice(edgeId.indexOf('c') + 1, edgeId.length));
    if (colId === numOfCols) {
        return colId - 1;
    } else {
        return colId;
    }
 }


 // Run the game
init();