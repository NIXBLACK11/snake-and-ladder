import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "./components/Landing";
import Game from "./components/Game";
import Waiting from "./components/Waiting";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/waiting" element={<Waiting />} />
        <Route path="/game/:gameCode" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
