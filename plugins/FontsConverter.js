import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { normalizePath } from 'vite';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';
import pathConfig from '../pathConfig';
import ensureDirectoryExists from '../inc/functions/ensureDirectoryExists.js';

export default function FontsConverter() {
  function getRelativePath(fullPath) {
    return path.relative(pathConfig.assets.fontsSrc, fullPath);
  }
  function convertTtfFile(ttfPath) {
    try {
      ensureDirectoryExists(pathConfig.dist.fonts); // create directory fonts
      const ttfBuffer = fs.readFileSync(ttfPath);
      const woff = ttf2woff(ttfBuffer);
      const woff2 = ttf2woff2(ttfBuffer);
      const relativePath = getRelativePath(ttfPath); // We delete the coincidence - get subrirectory and file
      const outputSubdir = normalizePath(path.dirname(path.join(pathConfig.dist.fonts, relativePath))); // Get subdir file
      const fileName = path.basename(ttfPath, '.ttf'); // Get fileName

      ensureDirectoryExists(outputSubdir); // create subdirectory fonts

      // WOFF
      const woffPath = normalizePath(path.join(outputSubdir, `${fileName}.woff`));
      fs.writeFileSync(woffPath, woff);

      // WOFF2
      const woff2Path = normalizePath(path.join(outputSubdir, `${fileName}.woff2`));
      fs.writeFileSync(woff2Path, woff2);

      console.log(`✓ Converted: ${relativePath}`);

    } catch (error) {
      console.error(`⚠️ Font conversion error (${ttfPath}):`, error.message);
    }
  }
  function deleteConverterFiles(ttfPath) {
    try {
      const relativePath = getRelativePath(ttfPath);
      const outputSubdir = path.dirname(path.join(pathConfig.dist.fonts, relativePath));
      const fileName = path.basename(ttfPath, '.ttf');

      // Delete WOFF
      const woffPath = path.join(outputSubdir, `${fileName}.woff`);
      if (fs.existsSync(woffPath)) {
        fs.unlinkSync(woffPath);
      }

      // Delete WOFF2
      const woff2Path = path.join(outputSubdir, `${fileName}.woff2`);
      if (fs.existsSync(woff2Path)) {
        fs.unlinkSync(woff2Path);
      }
      console.log(`🗑 Removed converted files for: ${relativePath}`);
    } catch (error) {
      console.error(`⚠️ Font deletion error (${ttfPath}):`, error.message);
    }
  }
  function proccessAllFonts() {
    glob.sync(`${pathConfig.assets.fontsSrc}/**/*.ttf`).forEach((ttfPath) => {
      convertTtfFile(normalizePath(ttfPath));
    })
  }
  return {
    name: 'vite-povly-fonts-converter',
    configureServer(server) {
      proccessAllFonts();
      const watcher = fs.watch(
        pathConfig.assets.fontsSrc,
        { recursive: true },
        (eventType, filename) => {
          if (!filename || !filename.endsWith('.ttf')) return;

          const fullPath = normalizePath(path.join(pathConfig.assets.fontsSrc, filename));

          switch (eventType) {
            case 'change':
              convertTtfFile(fullPath);
              break;
            case 'rename':
              if (fs.existsSync(fullPath)) {
                convertTtfFile(fullPath);
              } else {
                deleteConverterFiles(fullPath);
              }
              break;
          }
        }
      );

      server.httpServer?.once('close', () => watcher.close());
    },
    buildStart() {
      proccessAllFonts();
    }
  }
}
