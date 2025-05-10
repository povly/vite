import fs from 'fs';
import path, { normalize } from 'path';
import pug from 'pug';
import config from '../config.js';
import ensureDirectoryExists from '../inc/functions/ensureDirectoryExists.js';

export default function PugConverter() {
  function renderPugToHtml(pugPath) {
    try {
      return pug.renderFile(pugPath, {
        pretty: true,
        basedir: config.pugDir,
      });
    } catch (error) {
      console.error(`⚠️ PUG rendering error:`, error.message);
      return null;
    }
  }
  function generateInitialHtml() {
    ensureDirectoryExists(config.htmlDir);
    fs.readdirSync(config.pugDirPages, {withFileTypes: true}).forEach(file => {
      const _path = file.parentPath; // path file
      const _name = file.name; // name file
      // Check if pug at dir src/pug/pages
      if (_path.includes(config.pugDirPages) && _name.endsWith('.pug')){
        const name = _name.replace('.pug', '.html');
        const html = renderPugToHtml(normalize(path.join(_path, _name)));
        if (html){
          fs.writeFileSync(
            path.join(config.htmlDir, name),
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
        config.pugDir,
        { recursive: true },
        (eventType, filename) => {
          if (filename && filename.endsWith('.pug')) {
            generateInitialHtml();
          }
        }
      )
      server.httpServer?.once('close', () => watcher.close()); // Сервер закрывается, отключаем наблюдатель
    }
  }
}
