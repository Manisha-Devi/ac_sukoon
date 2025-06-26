import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "289aab35-14f2-4269-9fbc-31ad350b4827-00-15uvc1js1l8z1.pike.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
