export default class Ghost {
    /**
     * @param {string} ghostName 
     * @param {number} startIndex 
     * @param {number} speed 
     */
    constructor(ghostName, startIndex, speed) {
        this.ghostName = ghostName;
        this.startIndex = startIndex;
        this.speed = speed;
        this.currentIndex = this.startIndex;
        this.timerID = NaN;
        // this.requestID = NaN;
        this.isScared = false;
    }
}