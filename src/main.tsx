import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initKeepAlive } from "./utils/keepAlive";

// Keep Supabase free-tier project alive — pings every 3 days silently
initKeepAlive();

createRoot(document.getElementById("root")!).render(<App />);
