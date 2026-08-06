import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  createElement(StrictMode, null, createElement(App)),
);
