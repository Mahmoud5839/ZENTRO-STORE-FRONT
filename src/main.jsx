import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "./redux/store";
import App from "./App";
import "./index.css";

// environment variable
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log("Google Client ID loaded:", googleClientId ? "✅ Yes" : "❌ No");
console.log("🔑 Google Client ID in main.jsx:", googleClientId);
window.store = store;

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </Provider>,
);
