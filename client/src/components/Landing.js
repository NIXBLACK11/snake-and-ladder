import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { initGame } from "../socket/initGame";
import { joinGame } from "../socket/joinGame";
import { useRecoilState } from "recoil";
import {
  socketState,
  codeState,
  numPlayersState,
  colorState,
  maxPlayersState,
  publicKeyState,
} from "../atoms/atom";
import { Toaster, toast } from "react-hot-toast";

function Landing() {
  const [view, setView] = useState("main");
  const [createCode, setCreateCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [code, setCode] = useRecoilState(codeState);
  const [color, setColor] = useRecoilState(colorState);
  const [numPlayers, setNumPlayers] = useRecoilState(numPlayersState);
  const [maxPlayers, setMaxPlayers] = useRecoilState(maxPlayersState);
  const [publicKey, setPublicKey] = useRecoilState(publicKeyState);
  const [socket, setSocket] = useRecoilState(socketState);

  const navigate = useNavigate();
  const clickRef = useRef(new Audio("click.wav"));
  const typeRef = useRef(new Audio("type.wav"));

  const debouncedPlaySound = useCallback(() => {
    typeRef.current.play();
  }, []);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.origin !== "https://nixarcade.fun") {
        console.error("Origin not allowed");
        return;
      }
      const { publicKey } = event.data;
      if (publicKey) {
        console.log("Received publicKey:", publicKey);

        setPublicKey(publicKey);
      }
    });
  });
  useEffect(() => {
    // Establish WebSocket connection on component mount
    if (socket) return;
    const ws = new WebSocket("wss://snl.nixarcade.fun/ws"); // Replace with your WebSocket URL
    // const ws = new WebSocket("ws://localhost:5000/"); // Replace with your WebSocket URL

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data.toString());
        console.log("Message from server:", message);

        // if (message.type === "game_created" || message.type === "game_joined") {
        //   setCode(message.gameCode);
        //   if (message.type == "game_joined") setNumPlayers(message.numPlayers);
        //   navigate("/waiting");
        // }

        switch (message.type) {
          case "game_created":
            setCode(message.gameCode);
            navigate("/waiting");
            break;
          case "game_exist":
            toast.error("Game with this code already exists.");
            break;
          case "game_joined":
            setCode(message.gameCode);
            setNumPlayers(message.numPlayers);
            setMaxPlayers(message.maxPlayers);
            navigate("/waiting");
            break;
          case "no_game":
            toast.error("No game found with this code.");
            break;
          case "game_full":
            toast.error("Game is already full.");
            break;
          case "game_started":
            toast.error("Game already started.");
            break;
          case "start_game":
            setCode(message.gameCode);
            setNumPlayers(message.numPlayers);
            setMaxPlayers(message.maxPlayers);
            setColor(message.color);
            navigate(`/game/${message.gameCode}`);
            break;
          default:
            console.log("Unhandled message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
  }, []);

  const handleJoinGame = () => {
    if (socket && joinCode) {
      joinGame(socket, joinCode, publicKey);
    }
  };

  const handleCreateGame = () => {
    if (socket && createCode) {
      initGame(socket, createCode, maxPlayers, publicKey);
    }
  };

  const renderMainView = () => (
    <div className="flex space-x-4">
      <button
        type="button"
        className="w-1/2 bg-[#EEE4B1] hover:bg-[#D6CCA1] text-1xl font-custom text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#EEE4B1] focus:ring-opacity-50"
        onClick={() => {
          clickRef.current.play();
          setView("join");
        }}
      >
        Join Game
      </button>
      <button
        type="button"
        className="w-1/2 bg-[#EEE4B1] hover:bg-[#D6CCA1] text-1xl font-custom text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#EEE4B1] focus:ring-opacity-50"
        onClick={() => {
          clickRef.current.play();
          setView("create");
        }}
      >
        Create Game
      </button>
    </div>
  );

  const renderJoinView = () => (
    <div>
      <input
        type="text"
        className="w-full px-4 py-2 rounded-md text-2xl font-custom bg-gray-700 text-white border border-gray-600 focus:border-[#EEE4B1] focus:ring focus:ring-[#EEE4B1] focus:ring-opacity-50 transition mb-4"
        onChange={(e) => {
          debouncedPlaySound();
          setJoinCode(e.target.value);
        }}
        value={joinCode}
        placeholder="Enter game code to join"
      />
      <button
        type="button"
        className="w-full bg-[#EEE4B1] hover:bg-[#D6CCA1] text-1xl font-custom text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#EEE4B1] focus:ring-opacity-50 mb-4"
        onClick={() => {
          clickRef.current.play();
          handleJoinGame();
        }}
      >
        Join Game
      </button>
      <button
        type="button"
        className="w-full bg-gray-600 hover:bg-gray-700 text-1xl font-custom text-[#EEE4B1] font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        onClick={() => {
          clickRef.current.play();
          setView("main");
        }}
      >
        Back
      </button>
    </div>
  );

  const renderCreateView = () => (
    <div>
      <input
        type="text"
        className="w-full px-4 py-2 rounded-md bg-gray-700 text-2xl font-custom text-white border border-gray-600 focus:border-[#EEE4B1] focus:ring focus:ring-[#EEE4B1] focus:ring-opacity-50 transition mb-4"
        onChange={(e) => {
          debouncedPlaySound();
          setCreateCode(e.target.value);
        }}
        value={createCode}
        placeholder="Enter game code to create"
      />
      <select
        className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-[#EEE4B1] focus:ring focus:ring-[#EEE4B1] focus:ring-opacity-50 transition mb-4"
        onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
        value={maxPlayers}
      >
        <option value={4}>4 Players</option>
        <option value={3}>3 Players</option>
        <option value={2}>2 Players</option>
      </select>
      <button
        type="button"
        className="w-full bg-[#EEE4B1] hover:bg-[#D6CCA1] text-1xl font-custom text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#EEE4B1] focus:ring-opacity-50 mb-4"
        onClick={() => {
          clickRef.current.play();
          handleCreateGame();
        }}
      >
        Create Game
      </button>
      <button
        type="button"
        className="w-full bg-gray-600 hover:bg-gray-700 text-1xl font-custom text-[#EEE4B1] font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        onClick={() => {
          clickRef.current.play();
          setView("main");
        }}
      >
        Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-lg"
            src="icon.png"
            alt="Icon"
          />
          <h1 className="font-color text-5xl font-bold mb-2 font-custom">
            Snakes and Ladders
          </h1>
          <p className="font-color font-custom text-2xl">
            Choose an option to start or join a game
          </p>
        </div>

        <div className="space-y-6">
          {view === "main" && renderMainView()}
          {view === "join" && renderJoinView()}
          {view === "create" && renderCreateView()}
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default Landing;
