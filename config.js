import path from 'path';
import { normalizePath } from 'vite';

const NODE_ENV = process.env.NODE_ENV;

const config = {
  rootDir: normalizePath(path.join(__dirname)),
  pugDir: normalizePath(path.join(__dirname, 'src/pug')),
  pugDirPages: normalizePath(path.join(__dirname, 'src/pug/pages')),
  htmlDir: NODE_ENV !== 'dev' ? normalizePath(path.join(__dirname, 'src/html')) : normalizePath(path.join(__dirname, '../dist')),
}
export default config;
