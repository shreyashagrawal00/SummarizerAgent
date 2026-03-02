API.interceptors.response.use(
  res => res,
  async (error) => {
    if (error.response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");

      const res = await axios.post("/auth/refresh", { refreshToken });

      localStorage.setItem("accessToken", res.data.accessToken);
      error.config.headers.Authorization =
        `Bearer ${res.data.accessToken}`;

      return axios(error.config);
    }
    return Promise.reject(error);
  }
);