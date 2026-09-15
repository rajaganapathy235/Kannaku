import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function pwaBuildVersionPlugin(): Plugin {
  const now = new Date();
  const buildVersion = `v${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, '0')}.${String(now.getUTCDate()).padStart(2, '0')}.${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}`;

  return {
    name: 'pwa-build-version',
    config() {
      return {
        define: {
          'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(buildVersion),
        },
      };
    },
    transformIndexHtml(html) {
      const consoleScript = `<script>console.log("[JustGST] Build Version: ${buildVersion}");</script>`;
      return html
        .replace(/__BUILD_VERSION__/g, buildVersion)
        .replace('</head>', `  ${consoleScript}\n</head>`);
    },
    closeBundle() {
      // Process dist/sw.js
      const swDistPath = path.resolve(__dirname, 'dist/sw.js');
      if (fs.existsSync(swDistPath)) {
        let content = fs.readFileSync(swDistPath, 'utf-8');
        content = content.replace(/__BUILD_VERSION__/g, buildVersion);
        content = content.replace(
          /const CACHE_NAME = ['"].*?['"];/,
          `const CACHE_NAME = 'justgst-pwa-cache-${buildVersion}';`
        );
        fs.writeFileSync(swDistPath, content, 'utf-8');
      }

      // Process dist/index.html
      const indexDistPath = path.resolve(__dirname, 'dist/index.html');
      if (fs.existsSync(indexDistPath)) {
        let content = fs.readFileSync(indexDistPath, 'utf-8');
        if (content.includes('__BUILD_VERSION__')) {
          content = content.replace(/__BUILD_VERSION__/g, buildVersion);
          fs.writeFileSync(indexDistPath, content, 'utf-8');
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), pwaBuildVersionPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
