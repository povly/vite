import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from "vite";
import SassConverter from './plugins/SassConverter';
import pathConfig from './pathConfig';
import FontsConverter from './plugins/FontsConverter';
import ImageOptimizer from './plugins/ImageOptimizer';
import JsCompiler from './plugins/JSCompiler';
import PugConverter from "@povly/vite-plugin-pug"

export default defineConfig(() => ({
  root: pathConfig.dist.html,
  base: './',
  server: { host: true },
  plugins: [
    PugConverter(),
    SassConverter(),
    FontsConverter(),
    ImageOptimizer(),
    JsCompiler(),
  ],
  build: {
    write: false
  }
}));
