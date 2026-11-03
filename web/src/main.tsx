import { createRoot } from "react-dom/client";
import "./base.css";
import "./ui.css";
import "./print.css";
import { App } from "./App";

// No StrictMode on purpose: its double-mount would start every long stage twice on the server.
createRoot(document.getElementById("root")!).render(<App />);
