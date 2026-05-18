import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/SIMU_Sistem-Informasi-Manajemen-Uang/',
  plugins: [react(), tailwindcss()],
})