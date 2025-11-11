import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");

if (!container) throw new Error("Root container not found");

// Store root on window to avoid duplicate createRoot calls during HMR
const anyWindow = window as any;
if (!anyWindow.__root) {
  anyWindow.__root = createRoot(container);
}
anyWindow.__root.render(<App />);
