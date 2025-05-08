import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from "vite";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import FullReload from 'vite-plugin-full-reload'; // Решил проблему перезагрузки файлов

import pug from 'pug';

// Получаем текущую директорию через import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Функция для рендеринга Pug в HTML
function renderPugToHtml(pugPath) {
  return pug.renderFile(pugPath, {
    pretty: true,
    basedir: path.join(__dirname, 'src/pug')
  });
}

// Функция для генерации html
function generateInitialHtml() {
  const pagesDir = path.join(__dirname, 'src/pug/pages');
  const outputDir = path.join(__dirname, 'src/html');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.readdirSync(pagesDir).forEach(file => {
    if (file.endsWith('.pug')) {
      const name = file.replace('.pug', '');
      const html = renderPugToHtml(path.join(pagesDir, file));
      fs.writeFileSync(
        path.join(outputDir, `${name}.html`),
        html
      );
    }
  });
}

// Генерация html при запуске
generateInitialHtml();

export default defineConfig({
  root: 'src/html', // Указываем корень как 'src/html'
  base: './',
  server: {
    host: true,
    cors: true,
    strictPort: true,
    port: Number(process.env.PORT) || 5000,
    hmr: {
      host: "localhost",
    },
    watch: {
      include: path.join(__dirname, 'src/pug/**/*.pug'),
    },
  },
  plugins: [
    {
      name: 'pug-hot-reload',
      handleHotUpdate() {
        generateInitialHtml();
        return [];
      }
    },
    FullReload(['src/pug/**/*.pug'])
  ],
  resolve: {
    alias: {
      '@src': path.join(__dirname, 'src'),
    },
  },
});
