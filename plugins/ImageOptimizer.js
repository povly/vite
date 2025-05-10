import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import sharp from 'sharp';
import { optimize as svgoOptimize } from 'svgo';
import { normalizePath } from 'vite';
import pathConfig from '../pathConfig.js';
import ensureDirectoryExists from '../inc/functions/ensureDirectoryExists.js';

const optimizationConfig = {
  quality: {
    jpeg: 80,
    png: 85,
    webp: 82,
    avif: 70,
  },
  compression: {
    avif: 6,
  },
  svgo: {
    plugins: ['preset-default'],
  },
};

export default function ImageOptimizer() {
  function getRelativePath(fullPath) {
    return path.relative(pathConfig.assets.imagesSrc, fullPath);
  }

  function optimizeImage(imgPath) {
    try {
      const ext = path.extname(imgPath).toLowerCase();
      const fileName = path.basename(imgPath, ext);
      const relativePath = getRelativePath(imgPath);
      const outputSubdir = normalizePath(path.dirname(path.join(pathConfig.dist.img, relativePath)));

      ensureDirectoryExists(outputSubdir);

      if (ext === '.svg') {
        const svgContent = fs.readFileSync(imgPath, 'utf8');
        const result = svgoOptimize(svgContent, optimizationConfig.svgo);
        const outputPath = normalizePath(path.join(outputSubdir, `${fileName}.svg`));
        fs.writeFileSync(outputPath, result.data);
        console.log(`✓ Optimized SVG: ${relativePath}`);
        return;
      }

      const image = sharp(imgPath);
      let metadata;

      image.metadata((err, meta) => {
        if (err) throw err;
        metadata = meta;

        // Original format optimization
        image.clone()
          .rotate()
          .withMetadata()
          .toFormat(metadata.format, {
            quality: optimizationConfig.quality[metadata.format],
            mozjpeg: true,
            progressive: true,
          })
          .toFile(normalizePath(path.join(outputSubdir, `${fileName}${ext}`)), (err) => {
            if (err) throw err;
            console.log(`✓ Optimized: ${relativePath}`);
          });

        // WebP conversion
        image.clone()
          .webp({ quality: optimizationConfig.quality.webp })
          .toFile(normalizePath(path.join(outputSubdir, `${fileName}.webp`)), (err) => {
            if (err) console.error(`WebP error: ${err.message}`);
          });

        // AVIF conversion
        image.clone()
          .avif({
            quality: optimizationConfig.quality.avif,
            compression: optimizationConfig.compression.avif,
          })
          .toFile(normalizePath(path.join(outputSubdir, `${fileName}.avif`)), (err) => {
            if (err) console.error(`AVIF error: ${err.message}`);
          });
      });

    } catch (error) {
      console.error(`⚠️ Image processing error (${imgPath}):`, error.message);
    }
  }

  function deleteOptimizedFiles(imgPath) {
    try {
      const ext = path.extname(imgPath).toLowerCase();
      const fileName = path.basename(imgPath, ext);
      const relativePath = getRelativePath(imgPath);
      const outputSubdir = path.dirname(path.join(pathConfig.dist.img, relativePath));

      [ext, '.webp', '.avif'].forEach(format => {
        const filePath = path.join(outputSubdir, `${fileName}${format}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      console.log(`🗑 Removed optimized files for: ${relativePath}`);
    } catch (error) {
      console.error(`⚠️ Image deletion error (${imgPath}):`, error.message);
    }
  }

  function processAllImages() {
    const extensions = ['png', 'jpg', 'jpeg', 'svg'];
    glob.sync(`${pathConfig.assets.imagesSrc}/**/*.{${extensions.join(',')}}`, {
      ignore: '**/*.DS_Store'
    }).forEach(imgPath => {
      optimizeImage(normalizePath(imgPath));
    });
  }

  return {
    name: 'vite-povly-image-optimizer',
    configureServer(server) {
      processAllImages();
      const watcher = fs.watch(
        pathConfig.assets.imagesSrc,
        { recursive: true },
        (eventType, filename) => {
          if (!filename || !['.png', '.jpg', '.jpeg', '.svg'].some(ext => filename.endsWith(ext))) return;

          const fullPath = normalizePath(path.join(pathConfig.assets.imagesSrc, filename));

          switch (eventType) {
            case 'change':
              optimizeImage(fullPath);
              break;
            case 'rename':
              if (fs.existsSync(fullPath)) {
                optimizeImage(fullPath);
              } else {
                deleteOptimizedFiles(fullPath);
              }
              break;
          }
        }
      );

      server.httpServer?.once('close', () => watcher.close());
    },
    buildStart() {
      processAllImages();
    }
  }
}
