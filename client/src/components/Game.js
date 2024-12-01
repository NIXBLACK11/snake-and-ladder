import React from "react";
import { useState, useEffect, useRef } from "react";
import Dice from "./Dice";
import SnakesAndLadders from "../engine/SnakesAndLadders";
import { diceRoll } from "../socket/diceRoll";
import { getMoves } from "../socket/getMoves";
import { useRecoilValue } from "recoil";
import { Toaster, toast } from "react-hot-toast";
import WinnerPopup from "./WinnerPopup";

import {
  socketState,
  codeState,
  colorState,
  maxPlayersState,
} from "../atoms/atom";

let FINISHED_PLAYERS = [];

const colors = ["blue", "yellow", "green", "red"];

function movePiece(pieceId, coordinateIndex) {
  const ROW_STEP_LENGTH = 10; // Each row occupies 10% of the board height
  const COL_STEP_LENGTH = 10; // Each column occupies 10% of the board width
  const BOARD_SIZE = 10; // 10x10 board (100 squares total)

  coordinateIndex--;

  const pieceElement = document.getElementById(pieceId);

  if (!pieceElement) {
    console.error(`Piece with ID '${pieceId}' not found.`);
    return;
  }

  const boardElement = document.getElementById("snl-board");

  if (!boardElement) {
    console.error(`Board element not found.`);
    return;
  }

  // Calculate row and column based on index
  const row = Math.floor(coordinateIndex / BOARD_SIZE); // 0-based row
  let col = coordinateIndex % BOARD_SIZE; // 0-based column

  // Adjust column for zigzag rows
  if (row % 2 === 1) {
    // Reverse column for odd rows (zigzag effect)
    col = BOARD_SIZE - 1 - col;
  }

  // Calculate bottom and left in percentages
  const bottom = row * ROW_STEP_LENGTH; // Row to percentage
  const left = col * COL_STEP_LENGTH; // Column to percentage

  // Center the piece
  const pieceWidth = pieceElement.offsetWidth; // Actual width of the piece
  const pieceHeight = pieceElement.offsetHeight; // Actual height of the piece
  const boardWidth = boardElement.offsetWidth; // Board width
  const boardHeight = boardElement.offsetHeight; // Board height

  // Convert offsets to percentages
  const offsetX = (pieceWidth / boardWidth) * 25; // Horizontal offset in % (half of piece width)
  const offsetY = (pieceHeight / boardHeight) * 25; // Vertical offset in % (half of piece height)

  // Update piece position
  pieceElement.style.bottom = `calc(${bottom}% + ${offsetY}%)`;
  pieceElement.style.left = `calc(${left}% + ${offsetX}%)`;
}

function highlightPiece(player) {
  const pieceId = `p${player}`;
  const pieceElement = document.getElementById(pieceId);
  pieceElement.classList.add("highlight");
}

function unhighlightPiece() {
  document.querySelectorAll(".piece.highlight").forEach((ele) => {
    ele.classList.remove("highlight");
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function playMoveSound() {
  const moveSound = new Audio("/piece.mp3"); // Update the path to your sound file
  moveSound.play();
}

async function performMoves(moves) {
  const move = moves[0]; // The first move will always be processed

  const pieceId = `p${move.player}`;
  const fromPosition = move.from;
  const toPosition = move.to;

  const step = fromPosition < toPosition ? 1 : -1;

  for (
    let position = fromPosition;
    position !== toPosition + step;
    position += step
  ) {
    movePiece(pieceId, position); // Move step by step
    playMoveSound(); // Play move sound for each step
    await delay(300); // Wait for 300 milliseconds before the next move
  }

  // If there is a second move (snake or ladder move)
  if (moves.length > 1) {
    const secondMove = moves[1];
    const secondFromPosition = secondMove.from;
    const secondToPosition = secondMove.to;

    // Determine if the second move is forward or backward
    const secondStep = secondFromPosition < secondToPosition ? 1 : -1;

    // Move the piece from the second 'fromPosition' to 'toPosition' of the snake or ladder
    for (
      let position = secondFromPosition;
      position !== secondToPosition + secondStep;
      position += secondStep
    ) {
      movePiece(pieceId, position); // Move step by step
      await delay(50);
    }
    playMoveSound(); // Play move sound for each step
  }
}

function LudoUI() {
  const code = useRecoilValue(codeState);
  const maxPlayers = useRecoilValue(maxPlayersState);

  const socket = useRecoilValue(socketState);
  const color = useRecoilValue(colorState);
  const [canMove, setCanMove] = useState(false);

  const [diceValue, setDiceValue] = useState(1);
  const [turn, setTurn] = useState(0);
  const [isDiceDisabled, setIsDiceDisabled] = useState(false);

  const gameRef = useRef(null);

  const diceRef = useRef(null);

  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const setPlayerWon = (player) => {
    if (player == -1) player = colors.indexOf(color);
    setWinner(player); // Show the popup when a player wins
    setGameOver(true);
  };

  const closePopup = () => {
    setWinner(null); // Close the popup
  };

  useEffect(() => {
    if (maxPlayers > 0 && !gameRef.current) {
      gameRef.current = new SnakesAndLadders(maxPlayers);
      console.log("Game initialized with", maxPlayers, "players");
    }
  }, [maxPlayers]);

  useEffect(() => {
    unhighlightPiece();
    setIsDiceDisabled(false);
  }, [turn]);

  const handleDice = (value) => {
    if (colors[gameRef.current.TURN] === color) {
      diceRoll(socket, code);
    }
  };

  const handleRoll = (value) => {
    setDiceValue(value);
    delay(1000);
    if (colors[gameRef.current.TURN] === color) {
      getMoves(socket, code, gameRef.current.TURN, value);
    }
    unhighlightPiece();
  };

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data.toString());
        console.log("Message from server:", message);

        if (message.type === "dice_roll") {
          if (message.turn === turn) {
            diceRef.current.rollToValue(message.diceValue);
            handleRoll(message.diceValue);
          }
        } else if (message.type === "move_piece") {
          const result = message.result;
          gameRef.current.move(message.diceValue, message.game_player);
          if (result != null && result.isValid) {
            performMoves(result.moves);
          }
          setTurn(gameRef.current.TURN);
          setIsDiceDisabled(false);
          setCanMove(false);
          unhighlightPiece();
        } else if (message.type === "player_won") {
          setPlayerWon(message.player);
        } else if (message.type === "move_piece_test") {
          gameRef.current.CURRENT_POSITIONS[message.player] = Number(
            message.position,
          );
          movePiece(`p${message.player}`, Number(message.position));
        } else if (message.type == "player_left") {
          toast.error("Player Left! : " + colors[Number(message.player)]);
        } else if (message.type == "wont_work") {
          toast.error("This won't work baby!");
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    socket.onmessage = handleMessage;

    return () => {
      socket.onmessage = null;
    };
  }, [socket, turn]);

  const handleTest = (event) => {
    event.preventDefault(); // Prevents the page from refreshing on form submission
    const player = Number(event.target.piece.value[0]);
    const position = Number(event.target.position.value);
    socket.send(
      JSON.stringify({
        type: "move_piece_test",
        player: player,
        position: position,
        gameCode: code,
      }),
    );
  };

  return (
    <>
      <div
        className="top-0 w-full h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url('/game-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="relative top-0 w-full flex justify-between p-4">
            <div className="bg-gray-800 bg-opacity-70 p-2 rounded-lg">
              <h1 className="font-bold text-white font-custom">
                Your Color:{" "}
                <span className={`text-color-${color.toLowerCase()} font-bold`}>
                  {color.toUpperCase()}
                </span>
              </h1>
            </div>
            <div className="bg-gray-800 bg-opacity-70 p-2 rounded-lg">
              <h1 className="font-bold text-white font-custom">
                Game Code: {code}
              </h1>
            </div>
          </div>
          <div className="flex justify-center bg-grey">
            <div
              id="snl-board"
              className="mx-4 justify-center bg-grey relative"
            >
              <img
                src="/snlboard.jpg"
                className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
                style={{ height: "auto", maxHeight: "70vh" }}
              />
              {Array.from({ length: maxPlayers }).map((_, player) => (
                <div
                  key={`p${player}`}
                  id={`p${player}`}
                  className={`piece player-${player}-piece absolute`}
                  style={{
                    bottom: `${player * 1.5}%`, // Place the pieces inside the "Start" box initially
                    left: `-10%`, // Distribute pieces in the corners (adjust as needed)
                  }}
                ></div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-4">
            {gameOver ? (
              <button
                onClick={() => {
                  window.location.href = "https://nixarcade.fun";
                }}
                className="px-6 py-3 bg-[#EEE4B1] hover:bg-[#D6CCA1] text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#EEE4B1] focus:ring-opacity-50"
              >
                Home
              </button>
            ) : (
              <Dice
                id="dice"
                ref={diceRef}
                disabled={isDiceDisabled}
                rollingTime={700}
                size={70}
                onRoll={handleDice}
                sound={"/dice.mp3"}
              />
            )}
          </div>
        </div>
        {winner !== null && (
          <WinnerPopup player={winner} onClose={closePopup} />
        )}

        <Toaster position="top-center" reverseOrder={false} />
      </div>

      <div className="flex justify-center mt-4">
        <form
          onSubmit={handleTest}
          className="flex flex-col items-center bg-gray-800 p-4 rounded-lg bg-opacity-70"
        >
          <div className="mb-2">
            <label className="text-white font-bold mr-2" htmlFor="piece">
              Piece:
            </label>
            <input
              type="text"
              id="piece"
              name="piece"
              className="p-1 rounded-md"
              required
            />
          </div>
          <div className="mb-2">
            <label className="text-white font-bold mr-2" htmlFor="position">
              Position:
            </label>
            <input
              type="text"
              id="position"
              name="position"
              className="p-1 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-1 px-4 rounded-lg mt-2 hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
}

export default LudoUI;
