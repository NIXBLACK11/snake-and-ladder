const SnakesAndLadders = require("./engine/SnakesAndLadders");
// const { transfer } = require("./transfer");

const games = {}; // Maps gameCode to game data

const colors = ["blue", "yellow", "green", "red"];

let currentDiceValue = -1;
const token = "rocky";
const amount = 0.001;

function handleError(ws, error, errorType) {
  console.error(`${errorType}:`, error);
  ws.send(
    JSON.stringify({
      type: "error",
      errorType,
      message: error.message || "An unexpected error occurred",
    }),
  );
}

function handleInitGame(ws, data) {
  try {
    const { gameCode, numPlayers, publicKey } = data;

    if (typeof gameCode !== "string" || typeof numPlayers !== "number") {
      throw new Error("Invalid input data");
    }

    if (!games[gameCode]) {
      const snl = new SnakesAndLadders(numPlayers);
      games[gameCode] = {
        players: [ws],
        publicKeys: [publicKey],
        maxPlayers: numPlayers,
        started: false,
        snl: snl,
      };
      ws.send(JSON.stringify({ type: "game_created", gameCode }));
    } else {
      ws.send(JSON.stringify({ type: "game_exist", gameCode }));
    }
  } catch (error) {
    handleError(ws, error, "init_game_error");
  }
}

function handleJoinGame(ws, data) {
  try {
    const { gameCode, publicKey } = data;

    if (typeof gameCode !== "string") {
      throw new Error("Invalid gameCode");
    }

    const game = games[gameCode];
    if (!game) {
      ws.send(JSON.stringify({ type: "no_game", gameCode }));
      return;
    }

    if (game.players.length < game.maxPlayers) {
      ws.send(
        JSON.stringify({
          type: "game_joined",
          gameCode,
          numPlayers: game.players.length + 1,
          maxPlayers: game.maxPlayers,
        }),
      );
      game.players.forEach((player) => {
        player.send(
          JSON.stringify({
            type: "player_joined",
            gameCode,
          }),
        );
      });

      game.players.push(ws);
      game.publicKeys.push(publicKey);

      if (game.players.length === game.maxPlayers) {
        game.started = true;

        game.players.forEach((player, index) => {
          player.send(
            JSON.stringify({
              type: "start_game",
              gameCode,
              color: colors[index],
              maxPlayers: game.maxPlayers,
              numPlayers: game.players.length,
            }),
          );
        });
      }
    } else {
      ws.send(JSON.stringify({ type: "game_full", gameCode }));
    }
  } catch (error) {
    handleError(ws, error, "join_game_error");
  }
}

function handleClientDisconnection(ws) {
  try {
    for (const gameCode in games) {
      const game = games[gameCode];
      if (!game) continue;
      const playerIndex = game.players.indexOf(ws);

      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        game.publicKeys.splice(playerIndex, 1);

        game.players.forEach((player) => {
          player.send(
            JSON.stringify({
              type: "player_left",
              gameCode,
              player: playerIndex,
            }),
          );
        });

        if (game.players.length === 1 && game.started) {
          game.players.forEach((player) => {
            player.send(JSON.stringify({ type: "player_won", player: -1 }));
          });
          const publicKey = game.publicKeys[0];
          // transfer(publicKey, token, amount, "apiSecret");
        }

        if (game.players.length === 0) {
          delete games[gameCode];
        }

        break;
      }
    }
  } catch (error) {
    console.error("Error handling client disconnection:", error);
  }
}

function diceRoll(ws, data) {
  try {
    const min = 1;
    const max = 6;
    const diceValue = Math.floor(Math.random() * (max - min + 1)) + min;
    const gameCode = data.gameCode;
    const game = games[gameCode];

    if (!game) {
      throw new Error("Game not found");
    }

    currentDiceValue = diceValue;
    const turn = game.snl.TURN;
    game.players.forEach((player) => {
      player.send(
        JSON.stringify({
          type: "dice_roll",
          diceValue,
          turn,
        }),
      );
    });
  } catch (error) {
    handleError(ws, error, "dice_roll_error");
  }
}

function movePiece(ws, data) {
  const gameCode = data.gameCode;
  const diceValue = data.diceValue;
  const game_player = data.player;
  try {
    if (diceValue != currentDiceValue) {
      ws.send(JSON.stringify({ type: "wont_work", game_player }));
      return;
    }
    const game = games[gameCode];

    if (!game) {
      throw new Error("Game not found");
    }

    const snl = game.snl;
    const result = snl.move(diceValue, game_player);
    game.players.forEach((player) => {
      player.send(
        JSON.stringify({
          type: "move_piece",
          result,
          game_player,
          diceValue,
        }),
      );
    });
    if (game.snl.getWinner() !== null) {
      game.players.forEach((player) => {
        player.send(
          JSON.stringify({ type: "player_won", player: game_player }),
        );
      });
      const publicKey = game.publicKeys[game_player];
      // transfer(publicKey, token, amount, "apiSecret");
      games[gameCode] = null;
      delete games.gameCode;
    }
  } catch (error) {
    handleError(ws, error, "move_piece_error");
  }
}

function movePieceTest(ws, data) {
  try {
    const gameCode = data.gameCode;
    const position = Number(data.position);
    const game_player = data.player;

    const game = games[gameCode];

    if (!game) {
      throw new Error("Game not found");
    }

    const snl = game.snl;
    snl.CURRENT_POSITIONS[game_player] = position;
    game.players.forEach((player) => {
      player.send(
        JSON.stringify({
          type: "move_piece_test",
          player: game_player,
          position: position,
        }),
      );
    });
  } catch (error) {
    handleError(ws, error, "move_piece_test");
  }
}

module.exports = {
  handleInitGame,
  handleJoinGame,
  handleClientDisconnection,
  diceRoll,
  movePiece,
  movePieceTest,
};
