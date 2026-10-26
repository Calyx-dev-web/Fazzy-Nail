import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Building production bundle for Hostinger...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Creating hostinger-deploy.zip package...');
// Use python zipfile or archiver
try {
  execSync(`python3 -c "import zipfile, os; z = zipfile.ZipFile('hostinger-deploy.zip', 'w', zipfile.ZIP_DEFLATED); [z.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), 'dist')) for root, dirs, files in os.walk('dist') for file in files]; z.close(); print('Ready: hostinger-deploy.zip generated successfully!')"`, { stdio: 'inherit' });
} catch (e) {
  console.log('Finished build. Upload the contents of the dist/ directory directly to Hostinger public_html.');
}
