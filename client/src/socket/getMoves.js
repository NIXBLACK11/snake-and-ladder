export async function getMoves(socket, gameCode, player, diceValue) {
  try {
    socket.send(
      JSON.stringify({
        type: "move_piece",
        player: player,
        diceValue: diceValue,
        gameCode: gameCode,
      }),
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
