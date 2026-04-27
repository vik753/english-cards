import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Слеши в начале и в конце обязательны!
  base: '/english-cards/'
})
