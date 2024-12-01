export async function initGame(socket, gameCode, numPlayers, publicKey) {
  try {
    socket.send(
      JSON.stringify({
        type: "init_game",
        gameCode: gameCode,
        numPlayers: numPlayers,
        publicKey: publicKey,
      }),
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
