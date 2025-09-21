import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,   // isse aapke LAN (mobile, same Wi-Fi) pe open hoga
    port: 5173    // default port, chahe to change kar sakte ho
  }
})
