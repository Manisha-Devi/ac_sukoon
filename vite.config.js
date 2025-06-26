import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "9357cea6-eb5a-44eb-a643-99b20e17c699-00-1i6krfzew3b0g.pike.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
