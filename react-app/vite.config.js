/**
 * vite.config.js —— Vite 配置
 * base:'./' 使构建产物可任意路径部署；__APP_VERSION__/__APP_BUILD__ 以构建时注入版本号
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const versionFile = path.resolve(__dirname, 'version.json');
const version = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
  define: {
    __APP_VERSION__: JSON.stringify(version.version),
    __APP_BUILD__: JSON.stringify(version.build),
  },
});