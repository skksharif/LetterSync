import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
    "process.env": process.env // Use actual environment variables
  }
})
