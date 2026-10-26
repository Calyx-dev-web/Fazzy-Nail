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

  // 3. Ensure images are present in dist/assets/images
  const publicImagesDir = path.resolve('public/assets/images');
  const distImagesDir = path.join(distDir, 'assets/images');
  if (fs.existsSync(publicImagesDir)) {
    if (!fs.existsSync(distImagesDir)) {
      fs.mkdirSync(distImagesDir, { recursive: true });
    }
    const files = fs.readdirSync(publicImagesDir);
    for (const file of files) {
      fs.copyFileSync(path.join(publicImagesDir, file), path.join(distImagesDir, file));
    }
    console.log(`✓ Verified ${files.length} static images in dist/assets/images/`);
  }
}
