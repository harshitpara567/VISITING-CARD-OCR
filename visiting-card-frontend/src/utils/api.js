import axios from 'axios';

const API_BASE_URL = 'http://172.16.16.169:1337/api'; // Replace with your actual backend IP

// Sign Up API
export const signUpUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Login API
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
export const getScannedCards = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cards`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserDetails = async (email, token) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/user-details?filters[email][$eq]=${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Strapi returns an array under `data`
    return response.data.data[0]?.attributes;
  } catch (err) {
    console.log("Error fetching user details:", err);
    throw err;
  }
};
