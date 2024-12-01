const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const {
  handleInitGame,
  handleJoinGame,
  handleClientDisconnection,
  diceRoll,
  movePiece,
  movePieceTest,
} = require("./gameManager");

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const debug = true;

// CORS setup
const corsOptions = {
  origin: /\.vercel\.com$/,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

// Middleware
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res, next) => {
  res.json({ message: "Hello, World!" });
});

// WebSocket setup
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "init_game":
          handleInitGame(ws, data);
          break;
        case "join_game":
          handleJoinGame(ws, data);
          break;
        case "dice_roll":
          diceRoll(ws, data);
          break;
        case "move_piece":
          movePiece(ws, data);
          break;
        case "move_piece_test":
          if (debug === true) movePieceTest(ws, data);
          break;
        case "winner_address":
          console.log(data.publicKey);
          break;
        default:
          throw new Error("Unknown message type");
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Error processing your request",
        }),
      );
    }
  });

  ws.on("close", () => {
    handleClientDisconnection(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
