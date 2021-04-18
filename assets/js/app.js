import { layout } from "./layout.js"
import Ghost from "./Ghost.js";

const GRID = document.querySelector(".grid");
const pacmanStartIndex = 490;
const numberOfColumns = 28;
const TILES = [];
const tileTypes = {
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
                tile.tileType = tileTypes[0];
                break;
            case 1:
                tile.element.className = tileTypes[1];
                break;
            case 2:
                tile.element.className = tileTypes[2];
                break;
            case 3:
                tile.tileType = tileTypes[3];
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

    TILES[pacmanCurrentIndex].emptyTile();

    if (targetTile.tileType === "pac-dot")
        updateScore(+1);
    if (targetTile.tileType === "power-pellet")
        eatPowerPellet();

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

window.addEventListener("keydown", movePacman);

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
    // moveGhost(the_ghost);
});

function moveGhost(the_ghost) {
    the_ghost.timerID = setInterval(function () {

        const direction = Object.values(DIRECTIONS)[Math.floor(Math.random() * 4)];
        const targetTile = TILES[the_ghost.currentIndex + direction];

        if (targetTile.class !== "WALL" && !targetTile.ghost) {
            delete TILES[the_ghost.currentIndex].element.dataset.ghost;
            the_ghost.currentIndex += direction
            if (the_ghost.isScared) targetTile.ghost = "scared";
            else targetTile.ghost = the_ghost.ghostName;
        }

    }, the_ghost.speed)
}

// ===== ===== ===== ===== =====
// Check ghost encounters on browser repaint
// ===== ===== ===== ===== =====

function checkGhostEncounter() {
    const requestID = requestAnimationFrame(checkGhostEncounter)
    ghosts.forEach(the_ghost => {
        if (TILES[the_ghost.currentIndex].tileType !== "pac-man")
            return;

        switch (the_ghost.isScared) {
            case true:
                updateScore(+100);
                delete TILES[the_ghost.currentIndex].element.dataset.ghost;
                the_ghost.currentIndex = the_ghost.startIndex;
                break;
            case false:
                ghosts.forEach(the_ghost => clearInterval(the_ghost.timerID));
                window.removeEventListener("keydown", movePacman);
                setTimeout(() => {
                    alert("Game Over!")
                }, 3000);
                cancelAnimationFrame(requestID);
                break;
        }
    });

}

requestAnimationFrame(checkGhostEncounter)

// ===== ===== ===== ===== =====
// Start new game
// ===== ===== ===== ===== =====

function startNewGame() {
    updateScore(-score);

    TILES[pacmanCurrentIndex].emptyTile();
    pacmanCurrentIndex = pacmanStartIndex;
    TILES[pacmanCurrentIndex].tileType = "pac-man";
    window.addEventListener("keydown", movePacman);

    TILES.forEach((tile, i) => {
        if (layout[i] === 0) tile.tileType = tileTypes[0];
        if (layout[i] === 3) tile.tileType = tileTypes[3];
    });

    ghosts.forEach(the_ghost => {
        clearInterval(the_ghost.timerID);
        moveGhost(the_ghost);
        if (the_ghost.currentIndex !== the_ghost.startIndex)
            TILES[the_ghost.currentIndex].emptyTile();
        the_ghost.currentIndex = the_ghost.startIndex;
        the_ghost.isScared = false;
    })

}

document.querySelector("#new-game button").addEventListener("click", startNewGame);