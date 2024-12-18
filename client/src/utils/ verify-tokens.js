import axios from "axios";

export const verifyToken = async (token, apiSecret) => {
  console.log("verify func Token:", token);
  try {
    const response = await axios.post(
      "https://nixarcade-backend.vercel.app/verify-token", // Use localhost if testing locally
      { token },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": apiSecret,
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error(
      "Error verifying token:",
      error.response?.data || error.message,
    );
    return null;
  }
};