export async function diceRoll(socket, gameCode) {
  try {
    socket.send(
      JSON.stringify({
        type: "dice_roll",
        gameCode: gameCode,
      }),
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
