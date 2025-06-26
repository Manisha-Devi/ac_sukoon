import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "dfdfd55b-5474-4c1a-a46b-2d07b43a1c4e-00-2xl6d1pdc6uv5.pike.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
