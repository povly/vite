import { defineConfig } from "vite";
import path, { resolve } from "node:path";
import url from "node:url";

import vitePug from 'vite-plugin-pug-transformer';
import viteBabel from 'vite-plugin-babel';
import viteMultipage from 'vite-plugin-multipage';
import viteEslint from 'vite-plugin-eslint';
import viteStylelint from 'vite-plugin-stylelint';
import viteSassGlob from 'vite-plugin-sass-glob-import';
import viteImagemin from 'vite-plugin-imagemin';
import viteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';

const root = resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'src'); // entry point
const outDir = resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'build'); //  output point

export default defineConfig({
  root,
  base: './',
  clearScreen: true,
  build: {
    outDir,
    emptyOutDir: true,
    chunkSizeWarningLimit: '1024',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.names.split('.')[1];
          let fileName = assetInfo.name.split('.')[0];

          if (/png|jpe?g|svg|webp|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images';

          } else if (extType === 'css') {
            extType = 'styles';

            return `${extType}/style[extname]`;
          } else if (extType === 'js') {
            extType = 'scripts';

            return `${extType}/${fileName}[extname]`;
          }

          return `${extType}/[name][extname]`;
        },
      }
    }
  },
  plugins: [
    vitePug({
      pugOptions: {
        pretty: true,
      },
    }),
    viteBabel({
      presets: ['@babel/preset-env']
    }),
    viteMultipage({
      mimeCheck: true,
      open: "/",
      pageDir: "pages",
      purgeDir: "pages",
      removePageDirs: true,
      rootPage: "index.html",
    }),
    viteEslint({
      failOnError: false,
    }),
    viteStylelint(),
    viteSassGlob(),
    viteImagemin({
      gifsicle: {
        optimizationLevel: 8,
        interlaced: false,
      },
      mozjpeg: {
        quality: 85,
      },
      pngquant: {
        quality: [0.7, 0.8],
        speed: 4,
      },
      optipng: {
        optimizationLevel: 8,
      },
    }),
    viteSvgSpriteWrapper({
      icons: 'source/images/svg/**/*.svg',
      outputDir: 'dist/images/svg',
      sprite: {
        shape: {
          transform: [{
            svgo: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      convertShapeToPath: false,
                      moveGroupAttrsToElems: false,
                    },
                  },
                },
                {
                  name: 'removeViewBox',
                  active: false
                },
                {
                  name: 'removeEmptyAttrs',
                  active: false
                },
              ],
            },
          }],
        },
      },
    }),
  ],
})
