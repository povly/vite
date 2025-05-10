import fs from 'fs';
import path from 'path';
import { normalizePath } from 'vite';
import pathConfig from '../pathConfig.js';
import * as sass from 'sass-embedded';
import ensureDirectoryExists from '../inc/functions/ensureDirectoryExists.js';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

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
    ensureDirectoryExists(pathConfig.dist.css);
    fs.readdirSync(pathConfig.styles.pages, {withFileTypes: true}).forEach((file)=>{
      const _path = file.parentPath;
      const _name = file.name;

      if (_path.includes(pathConfig.styles.pages) && _name.endsWith('.scss')){
        const name = _name.replace('.scss', '.css');
        const resultCSS = renderSassToCss(normalizePath(path.join(_path, _name)));
        if (resultCSS){
          postcss([autoprefixer]).process(resultCSS.css, { from: undefined }).then(result => {
            result.warnings().forEach(warn => {
              console.warn(warn.toString())
            })
            fs.writeFileSync(
              normalizePath(path.join(pathConfig.dist.css, name)),
              result.css
            )
          })
        }
      }
    })
  }
  return {
    name: 'vite-povly-sass-converter',
    configureServer(server) {
      generateCSS();
      const watcher = fs.watch(
        pathConfig.styles.src,
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
