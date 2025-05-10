import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { normalizePath } from 'vite';
import { transformSync } from '@babel/core';
import { minify } from 'uglify-js';
import pathConfig from '../pathConfig.js';
import ensureDirectoryExists from '../inc/functions/ensureDirectoryExists.js';

export default function JsCompiler() {
  const babelConfig = {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "entry",
          corejs: "3.22",
        },
      ]
    ]
  };

  function compileFile(filePath, isProduction) {
    try {
      const relativePath = path.relative(pathConfig.js.src, filePath);
      const destPath = normalizePath(path.join(pathConfig.dist.js, relativePath));

      ensureDirectoryExists(path.dirname(destPath));

      // Чтение файла
      const code = fs.readFileSync(filePath, 'utf8');

      // Babel трансформация
      const result = transformSync(code, {
        ...babelConfig,
        filename: filePath
      });

      // Минификация с UglifyJS
      let compiledCode = result.code;
      if (isProduction) {
        const minifyResult = minify(compiledCode, {
          toplevel: true,
          mangle: {
            reserved: ["Swiper"],
          },
        });

        if (minifyResult.error) throw minifyResult.error;
        compiledCode = minifyResult.code;
      }

      // Запись файла
      fs.writeFileSync(destPath, compiledCode);
      console.log(`✓ Compiled: ${relativePath}`);

    } catch (error) {
      console.error(`⚠️ JS compilation error (${filePath}):`, error.message);
    }
  }

  function deleteCompiledFile(filePath) {
    try {
      const relativePath = path.relative(pathConfig.js.src, filePath);
      const destPath = normalizePath(path.join(pathConfig.dist.js, relativePath));

      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
        console.log(`🗑 Removed: ${relativePath}`);
      }
    } catch (error) {
      console.error(`⚠️ JS deletion error (${filePath}):`, error.message);
    }
  }

  function processAll(isProduction = false) {
    const patterns = [
      `${pathConfig.js.src}/main.js`,
      `${pathConfig.js.pages}/**/*.js`,
      `${pathConfig.js.blocks}/**/*.js`,
    ];
    patterns.forEach(pattern => {
      globSync(pattern, { nodir: true }).forEach(file => {
        compileFile(file, isProduction);
      });
    });
  }

  return {
    name: 'vite-povly-js-compiler',
    configureServer(server) {
      processAll(false);

      const watcher = fs.watch(
        pathConfig.js.src,
        { recursive: true },
        (eventType, filename) => {
          if (!filename || !filename.endsWith('.js')) return;

          const fullPath = normalizePath(path.join(pathConfig.js.src, filename));

          switch (eventType) {
            case 'change':
              compileFile(fullPath, false);
              server.ws.send({ type: 'full-reload' });
              break;
            case 'rename':
              if (fs.existsSync(fullPath)) {
                compileFile(fullPath, false);
              } else {
                deleteCompiledFile(fullPath);
              }
              server.ws.send({ type: 'full-reload' });
              break;
          }
        }
      );

      server.httpServer?.once('close', () => watcher.close());
    },
    buildStart() {
      processAll(true);
    }
  }
}
