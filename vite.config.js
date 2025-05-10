import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { defineConfig } from "vite";
import PugConverter from './plugins/PugConverter';

// Constants
const NODE_ENV = process.env.NODE_ENV; // .env arguments

export default defineConfig({
  root: NODE_ENV !== 'dev' ? 'src/html' : 'dist',
  base: './',
  server: {
    host: true,
  },
  plugins: [
    PugConverter(),
  ],
  resolve: {
    alias: {
      '@src': path.join(__dirname, 'src'),
    },
  },
});
