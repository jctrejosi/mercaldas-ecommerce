import "./styles/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./app/App.tsx";
import { apiStatusService } from "./services/api-status.service";

const renderApp = async () => {
  try {
    await apiStatusService.waitUntilReady();
  } catch (error) {
    console.error("Backend no disponible:", error);
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>,
  );
};

void renderApp();
