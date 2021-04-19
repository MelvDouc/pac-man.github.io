import { layout } from "./layout.js"
import Ghost from "./Ghost.js";
import { AUDIO } from "./Audio.js"

const GRID = document.querySelector(".grid");
const pacmanStartIndex = 490;
const numberOfColumns = 28;
const TILES = [];
const TILE_TYPES = {
    0: "pac-dot",
    1: "WALL",
    2: "ghost-lair",
    3: "power-pellet",
    4: "empty"
}
const DIRECTIONS = {
    up: -numberOfColumns,
    down: numberOfColumns,
    left: -1,
    right: 1
}
let gameOver = false;

// ===== ===== ===== ===== =====
// Update Score
// ===== ===== ===== ===== =====

let score = 0;

function updateScore(change) {
    const scoreDisplay = document.querySelector("#score p");
    score += change;
    scoreDisplay.innerText = score;
}


// ===== ===== ===== ===== =====
// Create board
// ===== ===== ===== ===== =====

function createBoard() {
    document.documentElement.style.setProperty("--columns", numberOfColumns);
    updateScore(0);

    for (let i = 0; i < layout.length; i++) {
        const element = document.createElement("div");

        const tile = {
            element: element,
            get class() {
                return this.element.className;
            },
            get tileType() {
                return this.element.dataset.tile;
            },
            set tileType(type) {
                this.element.dataset.tile = type;
            },
            get ghost() {
                return this.element.dataset.ghost;
            },
            set ghost(ghostName) {
                this.element.dataset.ghost = ghostName;
            },
            emptyTile() {
                delete this.element.dataset.tile;
                delete this.element.dataset.ghost;
            }
        };

        switch (layout[i]) {
            case 0:
                tile.tileType = TILE_TYPES[0];
                break;
            case 1:
                tile.element.className = TILE_TYPES[1];
                break;
            case 2:
                tile.element.className = TILE_TYPES[2];
                break;
            case 3:
                tile.tileType = TILE_TYPES[3];
                break;
        }

        GRID.append(element);
        TILES.push(tile);

    }
}

createBoard()

// ===== ===== ===== ===== =====
// movePacman helper functions
// ===== ===== ===== ===== =====

function eatPowerPellet() {
    updateScore(+10);
    ghosts.forEach(the_ghost => the_ghost.isScared = true);
    setTimeout(() => {
        ghosts.forEach(the_ghost => the_ghost.isScared = false);
    }, 10000);
}

function moveToTile(direction) {
    const targetTile = TILES[pacmanCurrentIndex + direction];

    if (targetTile.class === "WALL" || targetTile.class === "ghost-lair")
        return;

    if (targetTile.element.matches("[data-ghost]:not([data-ghost='scared'])")) {
        gameOver = true;
        setGameOver();
        return;
    }

    TILES[pacmanCurrentIndex].emptyTile();

    if (targetTile.tileType === "pac-dot") {
        updateScore(+1);
        AUDIO.eatDot.play()
    }
    if (targetTile.tileType === "power-pellet")
        eatPowerPellet();
    if (targetTile.ghost === "scared") {
        updateScore(+100);
        delete targetTile.element.dataset.ghost;
        const ghost = ghosts
            .find(the_ghost => the_ghost.currentIndex === pacmanCurrentIndex + direction)
        ghost.currentIndex = ghost.startIndex;
    }

    pacmanCurrentIndex += direction;
    TILES[pacmanCurrentIndex].tileType = "pac-man"
}

// ===== ===== ===== ===== =====
// Move Pac-Man
// ===== ===== ===== ===== =====

let pacmanCurrentIndex = pacmanStartIndex;
TILES[pacmanCurrentIndex].tileType = "pac-man";

function movePacman(e) {

    switch (e.key) {
        case "ArrowUp":
            moveToTile(DIRECTIONS.up)
            break;
        case "ArrowDown":
            moveToTile(DIRECTIONS.down)
            break;
        case "ArrowLeft":
            if (pacmanCurrentIndex === 364) moveToTile(numberOfColumns - 1);
            else moveToTile(DIRECTIONS.left)
            break;
        case "ArrowRight":
            if (pacmanCurrentIndex === 391) moveToTile(-numberOfColumns + 1);
            else moveToTile(DIRECTIONS.right)
            break;
    }

}

// ===== ===== ===== ===== =====
// Ghosts
// ===== ===== ===== ===== =====

const ghosts = [
    new Ghost("blinky", 348, 250),
    new Ghost("pinky", 376, 400),
    new Ghost("inky", 351, 300),
    new Ghost("clyde", 379, 500)
]

ghosts.forEach(the_ghost => {
    TILES[the_ghost.currentIndex].ghost = the_ghost.ghostName;
});

function moveGhost(the_ghost) {
    the_ghost.timerID = setInterval(function () {

        const direction = Object.values(DIRECTIONS)[Math.floor(Math.random() * 4)];
        const targetTile = TILES[the_ghost.currentIndex + direction];

        if (targetTile.class !== "WALL" && !targetTile.ghost) {
            if (targetTile.tileType === "pac-man") {
                if (the_ghost.isScared) {
                    updateScore(+100);
                    delete TILES[the_ghost.currentIndex].element.dataset.ghost;
                    the_ghost.currentIndex = the_ghost.startIndex;
                    TILES[the_ghost.currentIndex].ghost = (the_ghost.isScared) ? "scared" : the_ghost.ghostName;
                } else {
                    gameOver = true;
                    setGameOver();
                }
            } else {
                delete TILES[the_ghost.currentIndex].element.dataset.ghost;
                the_ghost.currentIndex += direction;
                TILES[the_ghost.currentIndex].ghost = (the_ghost.isScared) ? "scared" : the_ghost.ghostName;
            }
        }
    }, the_ghost.speed)
}

// ===== ===== ===== ===== =====
// Handle game over
// ===== ===== ===== ===== =====

function setGameOver() {
    if (!gameOver) return;
    window.removeEventListener("keydown", movePacman);
    ghosts.forEach(the_ghost => clearInterval(the_ghost.timerID));
    alert('game over')
}

// ===== ===== ===== ===== =====
// Start new game
// ===== ===== ===== ===== =====

function activatePacman() {
    TILES[pacmanCurrentIndex].emptyTile();
    pacmanCurrentIndex = pacmanStartIndex;
    TILES[pacmanCurrentIndex].tileType = "pac-man";
    window.addEventListener("keydown", movePacman);
}

function activateGhosts() {
    ghosts.forEach(the_ghost => {
        the_ghost.isScared = false;
        clearInterval(the_ghost.timerID);
        if (the_ghost.currentIndex !== the_ghost.startIndex)
            TILES[the_ghost.currentIndex].emptyTile();
        the_ghost.currentIndex = the_ghost.startIndex;
        TILES[the_ghost.currentIndex].ghost = the_ghost.ghostName;
        setTimeout(() => {
            moveGhost(the_ghost)
        }, 1000);
    });
}

function startNewGame() {

    gameOver = false;

    updateScore(-score);

    activatePacman()

    TILES.forEach((tile, i) => {
        if (layout[i] === 0) tile.tileType = TILE_TYPES[0];
        if (layout[i] === 3) tile.tileType = TILE_TYPES[3];
    });

    activateGhosts();

    AUDIO.startGame.play();
}

document.querySelector("#new-game button").addEventListener("click", startNewGame);