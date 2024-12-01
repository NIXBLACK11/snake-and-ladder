export async function joinGame(socket, gameCode, publicKey) {
  try {
    socket.send(
      JSON.stringify({
        type: "join_game",
        gameCode: gameCode,
        publicKey: publicKey,
      }),
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
