import fs from 'fs';
import path from 'path';
import pug from 'pug';
import { normalizePath } from 'vite';
import pathConfig from '../pathConfig.js';
import ensureDirectoryExists from '../inc/functions/ensureDirectoryExists.js';

export default function PugConverter() {
  function renderPugToHtml(pugPath) {
    try {
      return pug.renderFile(pugPath, {
        pretty: true,
        basedir: pathConfig.pug.src,
      });
    } catch (error) {
      console.error(`⚠️ PUG rendering error:`, error.message);
      return null;
    }
  }
  function generateInitialHtml() {
    ensureDirectoryExists(pathConfig.dist.html);
    fs.readdirSync(pathConfig.pug.pages, {withFileTypes: true}).forEach(file => {
      const _path = file.parentPath; // path file
      const _name = file.name; // name file
      // Check if pug at dir src/pug/pages
      if (_path.includes(pathConfig.pug.pages) && _name.endsWith('.pug')){
        const name = _name.replace('.pug', '.html');
        const html = renderPugToHtml(normalizePath(path.join(_path, _name)));
        if (html){
          fs.writeFileSync(
            path.join(pathConfig.dist.html, name),
            html
          )
        }
      }
    });
  }
  return {
    name: 'vite-povly-pug-converter',
    configureServer(server) {
      generateInitialHtml();
      const watcher = fs.watch(
        pathConfig.pug.src,
        { recursive: true },
        (eventType, filename) => {
          if (filename && filename.endsWith('.pug')) {
            generateInitialHtml();
          }
        }
      )
      server.httpServer?.once('close', () => watcher.close()); // Сервер закрывается, отключаем наблюдатель
    },
    buildStart() {
      generateInitialHtml();
    }
  }
}
