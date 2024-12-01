const BOARD_SIZE = 100;
const SNAKES = {
  38: 20,
  45: 7,
  51: 10,
  65: 54,
  91: 73,
  97: 61,
};

const LADDERS = {
  5: 58,
  14: 49,
  42: 60,
  53: 72,
  64: 83,
  75: 94,
};

class SnakesAndLadders {
  constructor(numPlayers) {
    this.NUM_PLAYERS = numPlayers;
    this.CURRENT_POSITIONS = [0, 0, 0, 0];
    this.TURN = 0;
    this.WINNER = null;
  }

  isValidPosition(position) {
    return position >= 0 && position <= BOARD_SIZE;
  }

  checkSnakeOrLadder(position) {
    // Check if position has a snake head
    if (SNAKES[position]) {
      return {
        type: "snake",
        from: position,
        to: SNAKES[position],
      };
    }

    // Check if position has a ladder bottom
    if (LADDERS[position]) {
      return {
        type: "ladder",
        from: position,
        to: LADDERS[position],
      };
    }

    return null;
  }

  hasPlayerWon(position) {
    return position === BOARD_SIZE;
  }

  switchTurn() {
    this.TURN++;
    this.TURN = this.TURN % this.NUM_PLAYERS;
  }

  move(diceValue, gamePlayer) {
    if (diceValue < 1 || diceValue > 6) {
      throw new Error("Invalid dice value");
    }

    const currentPlayer = this.TURN;
    if (currentPlayer !== gamePlayer) {
      return {
        player: currentPlayer,
        moves: moves,
        isValid: false,
      };
    }

    let currentPosition = this.CURRENT_POSITIONS[currentPlayer];
    let moves = [];

    // Calculate new position
    let newPosition = currentPosition + diceValue;

    // Check if move is valid (doesn't exceed board size)
    if (newPosition > BOARD_SIZE) {
      this.switchTurn();
      return {
        player: currentPlayer,
        moves: moves,
        isValid: false,
      };
    }

    // Add the dice roll move
    moves.push({
      player: currentPlayer,
      type: "move",
      from: currentPosition,
      to: newPosition,
      isValid: true,
    });

    // Check for snakes and ladders
    let chainReaction = this.checkSnakeOrLadder(newPosition);
    while (chainReaction) {
      moves.push({
        player: currentPlayer,
        type: chainReaction.type,
        from: chainReaction.from,
        to: chainReaction.to,
        isValid: true,
      });
      newPosition = chainReaction.to;
      chainReaction = this.checkSnakeOrLadder(newPosition);
    }

    // Update position
    this.CURRENT_POSITIONS[currentPlayer] = newPosition;

    // Check if player has won
    if (this.hasPlayerWon(newPosition)) {
      this.WINNER = currentPlayer;
    } else {
      // Switch turn if no 6 was rolled
      if (diceValue !== 6) {
        this.switchTurn();
      }
    }

    return {
      player: currentPlayer,
      moves: moves,
      isValid: true,
      position: newPosition,
      hasWon: this.WINNER === currentPlayer,
    };
  }

  getCurrentPlayer() {
    return this.TURN;
  }

  getPlayerPositions() {
    return { ...this.CURRENT_POSITIONS };
  }

  getWinner() {
    return this.WINNER;
  }

  isGameOver() {
    return this.WINNER !== null;
  }
}

export default SnakesAndLadders;
