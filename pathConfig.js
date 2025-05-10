import path from 'path';
import { normalizePath } from 'vite';

const createPath = (...segments) => normalizePath(path.join(__dirname, ...segments));

const pathConfig = {
  rootSrc: createPath(),
  pug: {
    src: createPath('src', 'pug'),
    pages: createPath('src', 'pug', 'pages')
  },
  dist: {
    html: createPath('dist'),
    css: createPath('dist', 'css'),
    fonts: createPath('dist', 'fonts')
  },
  styles: {
    src: createPath('src', 'sass'),
    pages: createPath('src', 'sass', 'pages')
  },
  assets: {
    fontsSrc: createPath('src', 'fonts')
  }
};

export default pathConfig;
