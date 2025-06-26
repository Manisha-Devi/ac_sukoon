import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "909036ac-8eaa-431b-a28a-f46a097a1cd7-00-zs5lm45hg6ej.sisko.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
});
