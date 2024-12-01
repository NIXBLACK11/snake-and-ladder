const axios = require("axios");

const setValidGameFalse = async (address) => {
  try {
    const response = await axios.post(
      `https://nixarcade-backend.vercel.app/user/setValidGameFalse`,
      { address },
    );
    console.log(response.data.message);
  } catch (error) {
    console.error(
      "Error setting valid game to false:",
      error.response?.data || error.message,
    );
  }
};

const setLeaderBoard = async (address) => {
  try {
    const response = await axios.post(
      `https://nixarcade-backend.vercel.app/user/gameWon`,
      { address },
    );
    console.log(response.data.message);
  } catch (error) {
    console.error(
      "Error setting valid game to false:",
      error.response?.data || error.message,
    );
  }
};

const transfer = async (walletAddress, amount, apiSecret) => {
  try {
    const token = process.env.SECRET;

    const response = await axios.post(
      "https://nixarcade-backend.vercel.app/transfer",
      { walletAddress, token, amount },
      {
        headers: {
          "x-api-secret": apiSecret,
          "Content-Type": "application/json",
        },
      },
    );
    await setValidGameFalse(walletAddress);
    await setLeaderBoard(walletAddress);
    return true;
  } catch (error) {
    console.error(
      "Error generating token:",
      error.response?.data || error.message,
    );
    return false;
  }
};

module.exports = transfer;
