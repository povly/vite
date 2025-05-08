import { defineConfig } from "vite";
import { resolve } from 'path';



export default defineConfig({
  root: '',
  build: {

  },
  plugins: [
    
  ],

  // Настраиваем алиасы для более удобных импортов
  resolve: {
    alias: {
      '@src': resolve(__dirname, './src'),
    },
  },
})
