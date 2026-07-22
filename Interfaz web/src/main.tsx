import "./styles/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router";
import App from "./app/App.tsx";
import { apiStatusService } from "./services/api-status.service";

const renderApp = async () => {
  try {
    await apiStatusService.waitUntilReady();
  } catch (error) {
    console.error("Backend no disponible:", error);
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>,
  );
};

void renderApp();
