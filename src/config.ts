const API_URL = process.env.REACT_APP_API_URL || "";

export const config = {
  development: false,
  debug: false,
  appKey: "crash-0.1.0",
  api: API_URL ? `${API_URL}/api` : "/api",
  wss: API_URL || window.location.origin,
};
