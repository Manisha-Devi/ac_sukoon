import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "791ab2a4-3058-4da5-ab33-8340464cc405-00-3cgrpzi1lpf9m.pike.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
