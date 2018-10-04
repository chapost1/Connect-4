"use strict"; // Global vars
const boardArr = [], rows = 6, columns = 7, // our board size will be 7x6
    playerMarker = document.querySelector(`#playerHead .marker`), // for cosmetics is changing during game
    board = document.getElementById('board'); // used alot dom el. our board
let gameOn = false, // gameOn is false at start,  
    playerOne, playerTwo; // bg-image -> reset game attaches it values.
// on start call resetGame Func for preparing DOM
resetGame(true); // calls on start. drawing board DOM , creates elements && attaching needed column events
function drawBoard(start = false) { // start bool is for app start spinner, comes from resetGame Func
    board.setAttribute(`class`, `active`);
    board.innerHTML = `<div class="board-overlay"></div>`; // gradient
    for (let i = 0; i < columns; i++) { // 7 times
        boardArr[i] = []; // creates 7 first demensions arr cells
        let column = document.createElement(`div`),
            columnOverlay = document.createElement(`div`); // el for events and cursor:pointer
        columnOverlay.addEventListener(`click`, onPlayerChoose.bind(onPlayerChoose, [i, columnOverlay]));
        columnOverlay.addEventListener(`click`, nextCellToInsert.bind(nextCellToInsert, [i, true]));
        columnOverlay.addEventListener(`mouseenter`, nextCellToInsert.bind(nextCellToInsert, [i, true]));
        columnOverlay.addEventListener(`mouseout`, nextCellToInsert.bind(nextCellToInsert, [i, false]));
        columnOverlay.setAttribute(`class`, `column-overlay`); // pose absolute on whole column
        column.setAttribute(`class`, `column`); // pose relative
        column.appendChild(columnOverlay);
        for (let j = 0; j < rows; j++) { // 6 times
            boardArr[i].push(null); // every boardArr Cell has 6 null cells at start
            let columnCell = document.createElement(`div`),
                cellCircle = document.createElement(`div`);
            columnCell.setAttribute(`class`, `cell`); // pose relative
            cellCircle.setAttribute(`class`, `cell-circle`); // pose absolute, the circle user sees
            cellCircle.setAttribute(`data-l`, `${i},${j}`); // data-location for locating in dom
            columnCell.appendChild(cellCircle);
            column.appendChild(columnCell);
        };
        board.appendChild(column);
    };
    if (!gameOn) gameOn = true; // game is on.
    if (start) setTimeout(() => document.querySelector('.spinner').style.display = 'none', 1000); //1s user exp
};
// event for column hover shows user on DOM next cell which can be inserted
function nextCellToInsert(argArr) {
    let i = argArr[0], shine = argArr[1], element; // i is column index , shine is boolean: if to
    for (let r = 0; r < rows; r++) {
        if (boardArr[i][r] !== null) break; // if theres not empty cell, don't procceed
        element = document.querySelector(`div.cell-circle[data-l="${i},${r}"]`);
    }; // shine class, makes cell to be yellow, therefore user knows it is can be applied
    if (element !== undefined) element.setAttribute('class', 'cell-circle ' + (shine ? ' shine' : ''));
};
// when user click on any column he wants to insert a cell into
function onPlayerChoose(argsArr, e) { // makes sure game is on && column is not full before let event pass through
    if (gameOn && e.target.className.indexOf('full') === -1)
        checkColumn(playerOne, argsArr[0], argsArr[1]);// (symbol, column Index , columns-overlay element)
};
// column selected, cheking for next empty spot if exists
function checkColumn(player, column, columnOverlay) {
    for (let i = rows - 1; i >= 0; i--) { // runnin on column searching for empty spots (null)
        if (boardArr[column][i] === null) { // null means empty
            if (0 === i) columnOverlay.setAttribute(`class`, `column-overlay full`); // 0 = last, column is full
            declareCell(player, [column, i]); // declare chosen cell
            break; // empty found, no need to continue after declaring once
        };
    };
};
// declaring chosen cell in our Arr && makes sure user can easy see it on screen
function declareCell(player, location) {
    boardArr[location[0]][location[1]] = player; // current player color insert to boardArr
    let cell = document.querySelector(`div.cell-circle[data-l="${location[0]},${location[1]}"]`);
    cell.setAttribute('class', 'cell-circle active'); // active class is necessary for background-color
    appendStyleForTransition(cell, player, location); // handling style for cell fade in
    gameOn = false; // don't let spam our dom events, a little delay
    setTimeout(() => winningMoves(), 250); // cell opacity transition = 0.5s
};
// basically determines if there is any empty spot in our boardArr
function checkEnd() { // return false means game not ended yet
    for (let i = 0; i < columns; i++) for (let j = 0; j < rows; j++) {
        if (boardArr[i][j] === null) return false; // 1+ null means empty cell.
    };
    return true; // no empties were found => game ended = true
};
// styles append in DOM head for applying fade in transition for cell selected by user.
function appendStyleForTransition(cell, player, location) { // bg-image for specific location in DOM
    cell.setAttribute(`data-b`, `a${location[0]}${location[1]}`); // new data-attr for our cell
    let styleElem = document.head.appendChild(document.createElement("style"));
    styleElem.setAttribute('slot', 'dynamicallySS1'); // attach uniqe attr for future communicating
    styleElem.innerHTML = `.cell-circle.active[data-b=
            a${location[0]}${location[1]}]::before {background-image: ${player};}`; // data-background
};
// styles were appended to DOM head, you can leave them..
function removeAppendedStyles() {// but they are not neccessary anymore, removing them every new game.
    let styles = document.head.getElementsByTagName('style');
    for (let i = styles.length - 1; i >= 0; i--) {
        if (styles[i].slot == `dynamicallySS1`) styles[i].remove(); // remove the styles with this uniqe slot
    };
};
// checking for all winning moves + a tie.
async function winningMoves() {
    let continueGame = true;
    // vertical
    for (let c = 0; c < columns; c++) {
        continueGame = await verticalHorizontalPromise(boardArr[c], c, `Vertical`);
        if (!continueGame) break; // false if won
    };
    // horizontal
    if (continueGame) {
        for (let r = 0; r < rows; r++) {
            let row = [], counter = 0; // counter goes from 0 to 6
            while (columns > counter && continueGame) {// columns = 7
                row.push(boardArr[counter][r]);
                continueGame = await verticalHorizontalPromise(row, r, `Horizontal`);
                counter++; // false if won
            };
        };
    };
    // lateral diagonals - column 0 to other columns bottom rows and column 6 to elese columns bottom rows
    for (let direction = 0; direction < 2; direction++) { // running both directions
        if (!continueGame) break; // no need to run if already over
        let rowsArr = [], counter = rows; // 6
        for (let i = 0; i < rows; i++) {
            let row = []; counter--; // counter goes from 6 (rows) to 0
            for (let r = 0; r <= i; r++) {
                direction === 0 ? // every direction is not alike
                    row.push([[0 + r], [counter + r]]) :// left-corner negative diagonal
                    row.push([[rows - r], [counter + r]]);// right-corner psotive diagonal
            };
            if (row.length > 1) rowsArr.push(row); // if have least.. won't win anyway.
        };
        continueGame = await cookDiagonalArrs(rowsArr); // false if won
    };
    // midial diagonals - inner columns to bottom from tops.
    for (let direction = 0; direction < 2; direction++) { // running both directions
        if (!continueGame) break; // no need to run if already over
        let rowsArr = [], counter = 0; // 0
        for (let i = rows; i > 0; i--) {
            let row = []; counter++; // counter goes from 0 to 6
            for (let r = -1; r < i; r++) {
                if (r >= 0) // prevent minuses which is not exists
                    direction === 0 ? // every direction is not alike
                        row.push([[counter + r], [r]]) :// top => right-bottom negative diagonal
                        row.push([[i - r - 1], [r]]);// top => left-bottom positive diagonal
            };
            if (row.length > 1) rowsArr.push(row); // if have least.. won't win anyway.
        };
        continueGame = await cookDiagonalArrs(rowsArr); // false if won
    };
    // check for a tie
    if (continueGame && checkEnd()) {
        continueGame = stopGame(); // will gameOn false, and remove board activity.
        setTimeout(() => openSnack(`Tie!`), 0);
    };
    if (continueGame) handleTurnPlayerCosmetics(); // game is on. handle DOM
    return !continueGame; // if won, returns true;
};
// checks connected row of vertical || horizontal cases, and if so, send data to DOM cook func. 
function verticalHorizontalPromise(row, r, method) {
    return new Promise(async resolve => {
        let continueGame = true,
            rowValid = await check4(row);
        (rowValid[0] === true) ? // win - continue game = return false;
            continueGame = simpleCellsViewCooker(rowValid[2], r, rowValid[1], method) : null;
        resolve(continueGame); // continue game returns winning move func
    });
};
// diagonal arr needs to have specified locations and color for right DOM handling in case of winning
async function cookDiagonalArrs(rowsArr) {
    let continueGame = true, finalRows = [], finalLocations = [];
    for (let i = 0; i < rowsArr.length; i++) {
        const innerArr = rowsArr[i];
        if (finalRows[i] === undefined || finalLocations[i] === undefined)
            finalRows[i] = [], finalLocations[i] = [];// declare && reset only if not exist yet
        for (let j = 0; j < innerArr.length; j++) {
            let a = innerArr[j][0], b = innerArr[j][1],
                cell = boardArr[a][b]; // locations are in Arr[ 0:[][] ] format
            finalRows[i].push(cell); // for check if has a won
            finalLocations[i].push([a, b]); // for DOM if did won
        };
    };
    // diagonal is tricky one, after well prepared arr, if Valid:
    for (let i = 0; i < finalRows.length; i++) {
        const row = finalRows[i];
        let rowValid = await check4(row);
        if (rowValid[0] === true) { // valid? make sure won't display user wrong cells too.
            let locations = []; // disabling the same color which are not connected
            for (let y = 0; y < rowValid[2].length; y++) {
                locations.push(finalLocations[i][rowValid[2][y]]); // only the winning cells
            };
            // win - continue game = return false;
            continueGame = simpleCellsViewCooker(locations, i, rowValid[1], `Diagonal`);
            break; // if won, no need to procceed
        };
    };
    return continueGame; // returns to winning move func
};
// if winning move have been found, prepare arr for nice html display
function simpleCellsViewCooker(arrCells, i, color, method) {
    let locations = [];
    for (let k = 0; k < arrCells.length; k++) {
        switch (method) {
            case `Vertical`: // column is constant
                locations.push([i, arrCells[k]]); break;
            case `Horizontal`: // row is constant, column is dynamic
                locations.push([arrCells[k], i]); break;
            case `Diagonal`: // both are dynamics
                locations.push([arrCells[k][0][0], arrCells[k][1][0]]); break;
        };
    };
    displayWinningCells(locations); // on board
    setTimeout(() => declareWinner(color, method), 0); // for snack
    return false; // countine game
};
// gets an array to check, returns true if has 4 connected in a row, winning color and bordArr location
function check4(array) {
    return new Promise(resolve => {
        let color, location;
        resolve([array.some(function (cell, i, arr) {
            let equals = (i >= 3 && // makes sure we are talking about 4th+
                cell === arr[i - 3] && // check current cell equals to siblings 3 cells
                cell === arr[i - 2] &&
                cell === arr[i - 1] &&
                typeof cell == 'string'); // checks its not a null.
            if (equals) location = [i, i - 3, i - 2, i - 1], color = cell; // save properties for winning
            return equals; // true if found 4 , false if didn't, first resolve property(array.some's return)
        }), color, location]);
    });
};
// after winner have been found, let the user know it
function declareWinner(color, method) {
    let pOne = `linear-gradient(to right bottom, #c42626, #a92027, #8e1c26, #731923, #59161f)`;
    openSnack(`Player ${(pOne === color) ? `1` : `2`} Wins! \n${method}`); // player won by found color in arr
    document.getElementById(`gameBTN`).innerText = `New Game`;
    stopGame(); // prevent any event / style which shows game is on from work
};
// after every turn, handle html view cosmetics to be as expected
function handleTurnPlayerCosmetics(host = playerOne, pm = playerMarker.innerText) {
    if (!gameOn) gameOn = true;
    playerOne = playerTwo, playerTwo = host; // replace between them
    playerMarker.innerText = (pm.indexOf(`1`) !== -1) ? pm.replace(`1`, `2`) : pm.replace(`2`, `1`);// 1 <=> 2
    playerMarker.style.backgroundImage = playerOne; // player marker DOM turn color
};
// stop game from playing and player from inserting any new data to boardArr
function stopGame() {
    gameOn = false; // stop game anyway
    if (board !== undefined) board.setAttribute(`class`, ``); // some of the styles are seen only in active class
    return gameOn; // continue game is false, goes to winning moves func.
};
// reset neccesary properties and html for user expected view.
function resetGame(start = false, gameBTN = document.getElementById(`gameBTN`)) { // dynamic params
    playerOne = `linear-gradient(to right bottom, #c42626, #a92027, #8e1c26, #731923, #59161f)`, // bg-images
        playerTwo = `linear-gradient(to right bottom, #3ac03a, #35a333, #2f872b, #296d24, #22531d)`;
    playerMarker.innerText = `Player 1`; // starting pose
    playerMarker.style.backgroundImage = playerOne; // starting pose
    if (!start) removeAppendedStyles(); // remove head dynamically added styles
    if (gameBTN !== undefined) gameBTN.innerText = `Restart`; // button starting position
    if (board !== undefined) drawBoard(start); // draw board again without 7 columns listeners && attach
};
// display the user winning move cells
function displayWinningCells(arrCells) {
    for (let i = 0; i < arrCells.length; i++) { // running on winning move locations
        const location = arrCells[i], // location of boardArr winning move, find by data-l attached on draw
            element = document.querySelector(`div.cell-circle[data-l="${location[0]},${location[1]}"]`);
        if (element !== undefined) element.setAttribute('class', 'cell-circle active glow'); // glows like gold
    };
};
// open snack && self destroy function
function openSnack(message, snack = document.querySelector(`.snack`)) { // dom may change, this is default
    if (snack !== undefined) (snack.children[0].innerHTML = message,
        snack.style.bottom = '0'); // snack gets a message and then, appear on screen via transition
    setTimeout(() => { if (snack !== undefined) snack.style.bottom = '-50px'; }, 3000); // 3s life duration
}; /* End */