import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

if (fs.existsSync(distDir)) {
  // 1. Create 404.html from index.html for GitHub Pages SPA routing fallback
  const indexPath = path.join(distDir, 'index.html');
  const notFoundPath = path.join(distDir, '404.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✓ Created dist/404.html from dist/index.html for GitHub Pages SPA routing');
  }

  // 2. Ensure .nojekyll exists in dist
  const nojekyllPath = path.join(distDir, '.nojekyll');
  if (!fs.existsSync(nojekyllPath)) {
    fs.writeFileSync(nojekyllPath, '');
    console.log('✓ Created dist/.nojekyll to disable Jekyll on GitHub Pages');
  }

  // 3. Ensure images are present in dist/assets/images and dist/assets/aistudio
  const copyDirRecursive = (src, dest) => {
    if (fs.existsSync(src)) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          copyDirRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
  };

  copyDirRecursive(path.resolve('public/assets/images'), path.join(distDir, 'assets/images'));
  copyDirRecursive(path.resolve('public/assets/aistudio'), path.join(distDir, 'assets/aistudio'));
  console.log('✓ Verified public static assets in dist/');
}
