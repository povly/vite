import fs from 'fs';
import path from 'path';
import { normalizePath } from 'vite';
import pug from 'pug';

const NODE_ENV = process.env.NODE_ENV;
export default function PugConverter() {
  const dirmame = normalizePath(path.join(__dirname, '..'));
  const pugDir = normalizePath(path.join(dirmame, 'src/pug'));
  const pugDirPages = normalizePath(path.join(pugDir, 'pages'));
  const htmlDir = NODE_ENV !== 'dev' ? normalizePath(path.join(dirmame, 'src/html')) : normalizePath(path.join(dirmame, 'dist'));
  function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
  function renderPugToHtml(pugPath) {
    try {
      return pug.renderFile(pugPath, {
        pretty: true,
        basedir: pugDir,
      });
    } catch (error) {
      console.error(`⚠️ PUG rendering error:`, error.message);
      return null;
    }
  }
  function generateInitialHtml() {
    ensureDirectoryExists(htmlDir);
    fs.readdirSync(pugDirPages, {withFileTypes: true}).forEach(file => {
      const _path = file.parentPath; // path file
      const _name = file.name; // name file
      // Check if pug at dir src/pug/pages
      if (_path.includes(pugDirPages) && _name.endsWith('.pug')){
        const name = _name.replace('.pug', '.html');
        const html = renderPugToHtml(normalizePath(path.join(_path, _name)));
        if (html){
          fs.writeFileSync(
            path.join(htmlDir, name),
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
        pugDir,
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
