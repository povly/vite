import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from "vite";
import PugConverter from './plugins/PugConverter';

const NODE_ENV = process.env.NODE_ENV;

export default defineConfig(() => ({
  root: NODE_ENV !== 'dev' ? 'src/html' : 'dist',
  base: './',
  server: { host: true },
  plugins: [
    PugConverter()
  ],
}));
