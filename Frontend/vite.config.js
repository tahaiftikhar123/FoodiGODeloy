// /client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ADD THIS BLOCK:
  server: {
    port: 3000, // Standard port for the main client
  }
});