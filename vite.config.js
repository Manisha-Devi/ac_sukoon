import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "20a255cc-543f-40a6-b463-d2b33e604771-00-39pfwdw8fo5d9.sisko.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
