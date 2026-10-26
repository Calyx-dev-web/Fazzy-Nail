import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function resolveBasePath(): string {
  // 1. Explicitly configured VITE_BASE_PATH (e.g. from CI or custom command)
  if (process.env.VITE_BASE_PATH) {
    const raw = process.env.VITE_BASE_PATH.trim();
    if (raw === '' || raw === './') return './';
    return raw.endsWith('/') ? raw : `${raw}/`;
  }
  // 2. Automatically detect repository subpath in GitHub Actions CI
  if (process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    if (repo && repo.toLowerCase().endsWith('.github.io')) {
      return '/';
    }
    return repo ? `/${repo}/` : './';
  }
  // 3. Fallback to relative path for local development and Hostinger production builds
  return './';
}

export default defineConfig(() => {
  return {
    base: resolveBasePath(),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
