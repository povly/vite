import path from 'path';
import { normalizePath } from 'vite';

const createPath = (...segments) => normalizePath(path.join(__dirname, ...segments));

const pathConfig = {
  rootSrc: createPath(),
  pug: {
    src: createPath('src', 'pug'),
    pages: createPath('src', 'pug', 'pages'),
  },
  js: {
    src: createPath('src', 'js'),
    pages: createPath('src', 'js', 'pages'),
    blocks: createPath('src', 'js', 'blocks'),
  },
  dist: {
    html: createPath('dist'),
    css: createPath('dist', 'css'),
    fonts: createPath('dist', 'fonts'),
    img: createPath('dist', 'images'),
    js: createPath('dist', 'js'),
  },
  styles: {
    src: createPath('src', 'sass'),
    pages: createPath('src', 'sass', 'pages')
  },
  assets: {
    fontsSrc: createPath('src', 'fonts'),
    imagesSrc: createPath('src', 'images'),
  }
};

export default pathConfig;
