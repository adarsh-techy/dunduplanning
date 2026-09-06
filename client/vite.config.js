import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// This file only affects local dev (`npm run dev`) -- a production build
// (`npm run build`) ships static files with no server or proxy of its own,
// which is why the app talks to the API via an absolute VITE_API_URL in
// that case instead (see src/config/env.js and client/.env.example).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Matches server/.env's PORT so moving the backend to another port only
  // needs changing in one place. Falls back to 5050, the project default.
  const apiTarget = env.VITE_DEV_API_PORT
    ? `http://localhost:${env.VITE_DEV_API_PORT}`
    : 'http://localhost:5050';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/uploads': { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
