// /admin/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ADD THIS BLOCK:
  server: {
    port: 3001, // Unique port to avoid conflict with the client
  }
});