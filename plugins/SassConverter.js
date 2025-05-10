import fs from 'fs';
import path from 'path';
import { normalizePath } from 'vite';
import config from '../config.js';
import * as sass from 'sass-embedded';
import ensureDirectoryExists from '../inc/functions/ensureDirectoryExists.js';

export default function SassConverter() {
  function renderSassToCss(path){
    try {
      return sass.compile(path, { style: "compressed" });
    } catch (error){
      console.error(`⚠️ SASS error:`, error.message);
      return null;
    }
  }
  function generateCSS(){
    ensureDirectoryExists(config.cssDir);
    fs.readdirSync(config.sassDirPages, {withFileTypes: true}).forEach((file)=>{
      const _path = file.parentPath;
      const _name = file.name;

      if (_path.includes(config.sassDirPages) && _name.endsWith('.scss')){
        const name = _name.replace('.scss', '.css');
        const resultCSS = renderSassToCss(normalizePath(path.join(_path, _name)));
        if (resultCSS){
          fs.writeFileSync(
            normalizePath(path.join(config.cssDir, name)),
            resultCSS.css
          )
        }
      }
    })
  }
  return {
    name: 'vite-povly-sass-converter',
    configureServer(server) {
      generateCSS();
      const watcher = fs.watch(
        config.sassDir,
        { recursive: true },
        (eventType, filename) => {
          if (filename && filename.endsWith('.scss')) {
            generateCSS();
          }
        }
      )
      server.httpServer?.once('close', () => watcher.close()); // Сервер закрывается, отключаем наблюдатель
    }
  }
}
