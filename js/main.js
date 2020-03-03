/*----- constants -----*/

const players = {
    '1': {
        name: '',
        score: 0
    },
    '-1': {
        name: '',
        score: 0
    }
};
// TODO Make row and column numbers dynamic
const numOfRows = 3;
const numOfCols = 3;

class Box {
    constructor(left, top) {
        if (left === undefined) {
            this.left = new Side();
        } else {
            this.left = left;
        }
        if (top === undefined) {
            this.top = new Side();
        } else {
            this.top = top;
        }
        this.right = new Side();
        this.bottom = new Side();
        this.isComplete = false; // Default to false;
    }
    setCompletion() {
        if (this.top.clickedBy * this.right.clickedBy * this.bottom.clickedBy * this.left.clickedBy === false) {
            return false;
        } else {
            return true;
        }
    }
}

class Side {
    constructor(clickedBy) {
        this.clickedBy = clickedBy;
    }
}
/*----- app's state (variables) -----*/

let board = [];
let winner;
let turn;

/*----- cached element references -----*/

let boardEl = document.getElementById('board');

/*----- event listeners -----*/

// Listen for any click on the board and use event delegation to understand which component was clicked
boardEl.addEventListener('click', handleBoardClick);

/*----- functions -----*/

function init() {
    // let row = []; // NOTE Won't work if it's here since you will just be pusing the same row array pointer every time
    for (let rowId = 0; rowId < numOfRows; rowId++) {
        let row = []; // NOTE Make sure you are using new row every iteration
        for (let colId = 0; colId < numOfCols; colId++ ) {
            row.push(new Box(checkLeft(row, colId), checkAbove(rowId, colId)));
        }
        board.push(row);
    }
    intitBoardEl();
}

function handleBoardClick(evt) {
    console.log(evt);
}

function intitBoardEl() {
    for (let i = 0; i < numOfRows; i++) {
        createHedgeRow();
        createVedgeRow();
    }
    createHedgeRow();
}

function createHedgeRow() {
    for (let i = 0; i < numOfCols; i++) {
        let dotEl = document.createElement('div');
        let hedgeEl = document.createElement('div');
        dotEl.classList.add('dot');
        hedgeEl.classList.add('hedge');
        boardEl.append(dotEl, hedgeEl);
    }
    let dotEl = document.createElement('div');
    dotEl.classList.add('dot');
    boardEl.append(dotEl);
}

function createVedgeRow() {
    for (let i = 0; i < numOfCols; i++) {
        let vedgeEl = document.createElement('div');
        let squareEl = document.createElement('div');
        vedgeEl.classList.add('vedge');
        squareEl.classList.add('square');
        boardEl.append(vedgeEl, squareEl);
    }
    let vedgeEl = document.createElement('div');
    vedgeEl.classList.add('vedge');
    boardEl.append(vedgeEl);
}

// If there exists a Box to the left of the current box, 
// return a reference to the right Side of that Box
function checkLeft(row, colId) {
    if (row[colId - 1] != undefined) { // Do this only if a box on the left actually exists 
        return row[colId - 1].right;
    }
}

// If there exists a box above the current box, 
// return a reference to the bottom Side of that Box
function checkAbove(rowId, colId) {
    if (board[rowId - 1] != undefined) { // Do this only if the row above actually exists
        return board[rowId - 1][colId].bottom;
    }
}

init();

// TEST STUFF HERE
console.log('board.length: ' + board.length);
console.log(board);
// console.log(board[0][0].right === board[0][1].left);
// console.log(board[0][0].bottom === board[1][0].top);
