import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "bb948baf-d71d-4183-882c-dfc8b9ee2094-00-vj1xcz5mfci9.pike.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
