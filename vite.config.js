import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from "vite";
import PugConverter from './plugins/PugConverter';
import SassConverter from './plugins/SassConverter';

export default defineConfig(() => ({
  root: 'dist',
  base: './',
  server: { host: true },
  plugins: [
    PugConverter(),
    SassConverter(),
  ],
}));
