import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from "vite";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import FullReload from 'vite-plugin-full-reload';
import pug from 'pug';

// Constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUG_DIR = path.join(__dirname, 'src/pug/pages');
const HTML_DIR = path.join(__dirname, 'src/html');

// Utility functions
function ensureDirectoryExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function renderPugToHtml(pugPath) {
  try {
    return pug.renderFile(pugPath, {
      pretty: true,
      basedir: path.join(__dirname, 'src/pug'),
    });
  } catch (error) {
    console.error(`⚠️ PUG rendering error:`, error.message);
    return null;
  }
}

function generateInitialHtml() {
  ensureDirectoryExistence(HTML_DIR);

  fs.readdirSync(PUG_DIR).forEach(file => {
    if (file.endsWith('.pug')) {
      const name = file.replace('.pug', '');
      const html = renderPugToHtml(path.join(PUG_DIR, file));

      if (html) {
        fs.writeFileSync(
          path.join(HTML_DIR, `${name}.html`),
          html
        );
      }
    }
  });
}
// Initial HTML generation
generateInitialHtml();

// Vite configuration
export default defineConfig({
  root: 'src/html',
  base: './',
  server: {
    host: true,
  },
  plugins: [
    {
      name: 'file-process',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.pug')) {
          try {
            const relativePath = path.relative(PUG_DIR, file);
            const outputName = relativePath.replace('.pug', '.html');
            const html = renderPugToHtml(file);
            if (html) {
              fs.writeFileSync(
                path.join(HTML_DIR, outputName),
                html
              );
              console.log(`♻️ Updated: ${outputName}`);
            }
            server.ws.send({ type: "full-reload" });
          } catch (error) {
            console.error('⚠️ Hot reload error:', error.message);
          }
        }
        return [];
      }
    },
    FullReload(['src/pug/**/*.pug'], { delay: 200 })
  ],
  resolve: {
    alias: {
      '@src': path.join(__dirname, 'src'),
    },
  },
});
