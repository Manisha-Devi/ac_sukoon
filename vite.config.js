import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "44f69783-00f8-4371-97a2-d45f8e038a40-00-31g56lnmfxil6.pike.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
