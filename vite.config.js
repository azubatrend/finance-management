import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/finance-management/', // Apna exact GitHub repo name yahan likho, aage-peeche slash (/) zaroori hai
})