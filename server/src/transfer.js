const axios = require("axios");

const transfer = async (walletAddress, token, amount, apiSecret) => {
  try {
    const response = await axios.post(
      "https://nixarcade-backend.vercel.app/transfer",
      { walletAddress, token, amount },
      {
        headers: {
          "x-api-secret": apiSecret, // Pass the API secret for verification
          "Content-Type": "application/json", // Set the content type explicitly
        },
      },
    );

    // Assuming the response contains the token in the response body
    return response.data.token;
  } catch (error) {
    console.error(
      "Error generating token:",
      error.response?.data || error.message,
    );
    return null; // Return null if the request fails
  }
};

module.exports = transfer;
