import { createRoot } from "react-dom/client";
import { initSentry } from "./lib/sentry";
import { initPerformanceMonitoring } from "./lib/performance";
import App from "./App";
import "./index.css";

initSentry();
initPerformanceMonitoring();

createRoot(document.getElementById("root")!).render(<App />);
