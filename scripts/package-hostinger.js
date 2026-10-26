import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Building production bundle for Hostinger...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Creating hostinger-deploy.zip package...');
try {
  // Zip the contents of dist into hostinger-deploy.zip
  execSync(`python3 -c "import zipfile, os; z = zipfile.ZipFile('hostinger-deploy.zip', 'w', zipfile.ZIP_DEFLATED); [z.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), 'dist')) for root, dirs, files in os.walk('dist') for file in files]; z.close(); print('Ready: hostinger-deploy.zip generated successfully!')"`, { stdio: 'inherit' });
  
  // Also copy to public/ and dist/ so in-app download buttons work instantly
  if (fs.existsSync('hostinger-deploy.zip')) {
    fs.copyFileSync('hostinger-deploy.zip', 'public/hostinger-deploy.zip');
    fs.copyFileSync('hostinger-deploy.zip', 'dist/hostinger-deploy.zip');
    console.log('hostinger-deploy.zip synced to public/ and dist/ for instant browser download.');
  }
} catch (e) {
  console.error('Packaging warning:', e);
  console.log('Finished build. Upload the contents of the dist/ directory directly to Hostinger public_html.');
}

