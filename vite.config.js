import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "18d23ed9-9492-4541-bade-7fd251b8a8dd-00-1iiy0juljua3y.pike.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
