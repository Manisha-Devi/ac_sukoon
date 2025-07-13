import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: process.env.VITE_HOST || '0.0.0.0',
    port: parseInt(process.env.VITE_DEV_PORT || '5173'),
    allowedHosts: [
      "bb948baf-d71d-4183-882c-dfc8b9ee2094-00-vj1xcz5mfci9.pike.replit.dev",
      // Add any other hosts you want to allow here
    ],
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Load environment variables
  envPrefix: 'VITE_',
}));
