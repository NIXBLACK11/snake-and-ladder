import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  socketState,
  codeState,
  numPlayersState,
  colorState,
  maxPlayersState,
} from "../atoms/atom";

function Waiting() {
  const socket = useRecoilValue(socketState);
  const gameCode = useRecoilValue(codeState);
  const [_color, setColor] = useRecoilState(colorState);
  const [numPlayers, setNumPlayers] = useRecoilState(numPlayersState);
  const [maxPlayers, setMaxPlayers] = useRecoilState(maxPlayersState);
  const navigate = useNavigate();
  const [status, setStatus] = useState("Waiting for other players...");

  useEffect(() => {
    if (!socket) return;

    const handleMessage2 = (event) => {
      try {
        const message = JSON.parse(event.data.toString());
        console.log("Message from server:", message);

        if (message.type === "start_game") {
          setStatus("Game is starting...");
          setColor(message.color);
          navigate(`/game/${gameCode}`);
        } else if (message.type === "player_joined") {
          setNumPlayers((prevNumPlayers) => prevNumPlayers + 1);
        } else if (message.type == "player_left") {
          setNumPlayers((prevNumPlayers) => prevNumPlayers - 1);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    socket.onmessage = handleMessage2;

    return () => {
      socket.onmessage = null;
    };
  }, [socket, navigate, gameCode, setNumPlayers]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <img
          className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-lg"
          src="icon.png"
          alt="Icon"
        />
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-pulse">
          {status}
        </h1>
        <p className="text-gray-500 mb-2 text-lg">
          Game Code:{" "}
          <span className="font-semibold text-gray-700">{gameCode}</span>
        </p>
        <p className="text-gray-500 mb-8 text-lg">
          Players Joined:{" "}
          <span className="font-semibold text-gray-700">
            {numPlayers} / {maxPlayers}
          </span>
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center items-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}

export default Waiting;
