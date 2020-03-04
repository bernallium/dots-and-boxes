// DOTS & BOXES
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//  The game board is composed of rows and columns of boxes.
//  Boxes are composed of four edges. Adjacent boxes share a reference to same edge.
//  Two players take turns clicking box edges. 
//  The player who clicks the fourth edge surrounding any given box completes that box.
//  When a player completes a box, that player gets another turn to click another edge.
//  Once the board is full, the player that has completed the most number of boxes wins.
// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

/*----- constants -----*/

const Players = {
    '1': {
        colorPrimary: '#4881ea',
        colorSecondary: '#76a0ef',
        score: 0
    },
    '-1': {
        colorPrimary: '#ff5233',
        colorSecondary: '#ff7d66',
        score: 0
    }
};

const numOfRows = 3; // Rows of boxes
const numOfCols = 3; // Rows of columns

// Box class used to create boxes objects to be layed out in rows and columns on the board
// A box is composed of four edge objects
// Note: When creating boxes, check if they share an edge with a box directly above and to the left on the board
class Box {
    constructor(boxId, left, top) {
        this.boxId = boxId;
        this.isComplete = false; // TODO Maybe delete this?
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
        if (this.left.clickedBy === undefined || this.top.clickedBy === undefined || 
            this.right.clickedBy === undefined || this.bottom.clickedBy === undefined) {
            return false; // Returns false if any of the edges have not been clicked;
        } else {
            if (this.completedBy === undefined) this.completedBy = turn; // CompletedBy state can only be set once
            return true;
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

const board = [];
let winner;
let turn;

/*----- Cached element references -----*/

let boardEl = document.getElementById('board');
let resetButtonEl = document.querySelector('button');

/*----- Event listeners -----*/

// Listen for any click on the board and use event delegation to understand which component was clicked
boardEl.addEventListener('click', handleBoardClick);

/*----- Functions -----*/

function init() {
    turn = 1;

    // Build board (2D array) of box objects
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

function handleBoardClick(evt) {
    // Get which element was clicked
    const targetEl = evt.target;

    // If the element was an edge element (has the hedge or vedge class), 
    // get a reference to the first box object that contains it
    let clickedBox;
    if (targetEl.classList.contains('vedge') || targetEl.classList.contains('hedge')) {
        const boxRowId = getRowIdAsNum(targetEl.id);
        const boxColId = getColIdAsNum(targetEl.id);
        clickedBox = board[boxRowId][boxColId];
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

    // Set the clicked state of the edge object
    clickedEdge.setClickedBy(turn);
    // Check the completion state of the box object
    clickedBox.checkCompletion();

    // Once alll the game state has been updated, render the changes
    render(clickedBox, clickedEdge);
    turn *= -1;
}

// Call render after every turn once game state has all been updated
function render(clickedBox, clickedEdge) {
    renderEdgeColor(clickedEdge);
    renderBoxColor();
    console.log(board);
}

// Renders the edge colour according to which player clicked it
function renderEdgeColor(edgeObj) {
    edgeObj.edgeEl.style.backgroundColor = Players[edgeObj.clickedBy].colorPrimary;
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

function intitBoardEl() {
    for (let rowId = 0; rowId < numOfRows; rowId++) {
        createHedgeRow(rowId);
        createVedgeRow(rowId);
        // Add another HedgeRow for the last row of boxes
        if (rowId === numOfRows - 1) createHedgeRow(rowId + 1);
    }
}

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
// return a reference to the right edge of that box
function checkLeft(row, colId) {
    if (row[colId - 1] != undefined) { // Do this only if a box on the left actually exists 
        return row[colId - 1].right;
    }
}

// If there exists a box above the current box, 
// return a reference to the bottom edge of that Box
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

init();


// –––––––––– TEST STUFF HERE ––––––––––

// console.log('board.length: ' + board.length);
console.log(board);
// console.log(board[0][0].right === board[0][1].left);
// console.log(board[0][0].bottom === board[1][0].top);