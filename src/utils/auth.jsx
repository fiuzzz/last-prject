export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  // Decode token untuk mendapatkan payload (jika menggunakan JWT)
  try {
      const payload = JSON.parse(atob(token.split(".")[1]));

    return payload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
