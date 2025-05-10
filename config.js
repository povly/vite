import path from 'path';
import { normalizePath } from 'vite';


const config = {
  rootDir: normalizePath(path.join(__dirname)),
  pugDir: normalizePath(path.join(__dirname, 'src', 'pug')),
  pugDirPages: normalizePath(path.join(__dirname, 'src', 'pug', 'pages')),
  htmlDir: normalizePath(path.join(__dirname, 'dist')),
  sassDir: normalizePath(path.join(__dirname, 'src', 'sass')),
  sassDirPages: normalizePath(path.join(__dirname, 'src', 'sass', 'pages')),
  cssDir: normalizePath(path.join(__dirname, 'dist', 'css')),
}
export default config;
