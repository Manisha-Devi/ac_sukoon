import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "6f99698c-317b-4683-b9a0-38c116436a3a-00-1mqijti62ipii.pike.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
