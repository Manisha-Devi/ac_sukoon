import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "11698198-5cbc-4f5f-89b7-660543d4348b-00-xiu84gvxfz2d.pike.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
