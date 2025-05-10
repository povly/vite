import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from "vite";
import PugConverter from './plugins/PugConverter';
import SassConverter from './plugins/SassConverter';
import pathConfig from './pathConfig';

export default defineConfig(() => ({
  root: pathConfig.dist.html,
  base: './',
  server: { host: true },
  plugins: [
    PugConverter(),
    SassConverter(),
  ],
}));
