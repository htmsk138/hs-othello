var cellCount = 64;
var offsetBase = Math.sqrt(cellCount);

var gameData, gameVue;

/**
 * Initialisation
 */
function init() {
  resetGameData();
  placeInitialStones();
}

/*
 * Reset game data
 */
function resetGameData() {
  gameData = {
    turn: 1,
    cells: [],
    offsets: [
        1, offsetBase-1, offsetBase, offsetBase+1,
        -1, (offsetBase-1)*-1, offsetBase*-1, (offsetBase+1)*-1
      ],
    stones: ["O", "X"],
    isFlipped: false,
    counts: [2, 2],
  };
}

/*
 * Place 4 stones in the centre
 */
function placeInitialStones() {
  for (var i = 0; i < cellCount; i++) {
    switch (i) {
      case (cellCount / 2) - (offsetBase / 2) - 1: //27
      case (cellCount / 2) + (offsetBase / 2): //36
        gameData.cells.push(gameData.stones[1])
        break;

      case (cellCount / 2) - (offsetBase / 2): //28
      case (cellCount / 2) + (offsetBase / 2) - 1: //35
        gameData.cells.push(gameData.stones[0]);
        break;

      default:
        gameData.cells.push('');
        break;
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  init();

  /**
   * Vue object
   */
  gameVue = new Vue({
    el: "#app",
    data: gameData,
    methods: {
      /**
       * Cell click event
       */
      play: function (cellNo) {
        if (this.isGameOver || this.cells[cellNo]) {
          return;
        }

        this.isFlipped = false;
        for (var i = 0; i < this.offsets.length; i++) {
          var flipping = this.checkFlippable(cellNo, this.offsets[i]);
          this.flipStones(flipping);
        }

        if (this.isFlipped) {
          Vue.set(this.cells, cellNo, this.currentStone);
          Vue.set(this.counts, this.turn, ++this.counts[this.turn]);
          this.changeTurn();
        }
      },
      /**
       * See if there are any stones flippable in the direction
       */
      checkFlippable: function (target, offset) {
        var current = target;
        var flipping = [];

        while (true) {
          current += offset;

          // Break if current is out of board
          if (current >= cellCount || current < 0) {
            break;
          }

          var checking = this.cells[current];
          if (checking) {
            if (checking === this.currentStone) {
              if (flipping.length) {
                return flipping;
              }
              break;

            } else {
              flipping.push(current);
            }

          } else {
            break;
          }

          // Break if reached edge
          if (offset !== 8 && offset !== -8) {
            if (current % 8 == 0 || current % 8 == 7) {
              break;
            }
          }
        }

        return null;
      },
      /**
       * Flip the flippable stones
       */
      flipStones: function (flipping) {
        if (flipping === null || !flipping.length) {
          return;
        }

        for (var i = 0; i < flipping.length; i++) {
          Vue.set(this.cells, flipping[i], this.currentStone);
          Vue.set(this.counts, this.turn, ++this.counts[this.turn]);
          Vue.set(this.counts, 1 - this.turn, --this.counts[1 - this.turn]);
        }
        this.isFlipped = true;
      },
      /**
       * Switch the player
       */
      changeTurn: function() {
        this.turn = this.turn ? 0 : 1;

        // Switch back if the new player had nothing to do
        if (this.isPass()) {
          this.turn = this.turn ? 0 : 1;
        }
      },
      /**
       * Check if the current player can play
       */
      isPass: function() {
        if (this.isGameOver) {
          return false;
        }

        for (var i = 0; i < this.cells.length; i++) {
          if (this.cells[i]) {
            continue;
          }

          for (var j = 0; j < this.offsets.length; j++) {
            if (this.checkFlippable(i, this.offsets[j]) !== null) {
              return false;
            }
          }
        }
        return true;
      }
    },
    computed: {
      /**
       * Current player's stone
       */
      currentStone: function () {
        return this.stones[this.turn];
      },
      /**
       * Check if game is over
       */
      isGameOver: function () {
        if (!this.counts[0] ||
            !this.counts[1] ||
            this.counts[0] + this.counts[1] === cellCount) {
          return true;
        }

        return false;
      },
      /**
       * Return the game result. Only called when the game is over
       */
      result: function () {
        var diff = this.counts[0] - this.counts[1];

        if (diff === 0) {
          return "It's a draw";
        }
        else if (diff > 0) {
          return this.stones[0] + ' wins!';
        }
        else {
          return this.stones[1] + ' wins!';
        }
      }
    }
  });
});
