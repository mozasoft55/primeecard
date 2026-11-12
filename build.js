const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 1. Copy main entrypoint index.html
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));

// 2. Copy Invite suite (templates, studio, onboard, assets)
fs.cpSync(path.join(__dirname, 'Invite'), path.join(distDir, 'Invite'), { recursive: true });

// 3. Copy mcard if present
if (fs.existsSync(path.join(__dirname, 'mcard'))) {
  fs.cpSync(path.join(__dirname, 'mcard'), path.join(distDir, 'mcard'), { recursive: true });
}

// 4. Ensure .nojekyll for static hosting
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

console.log('✅ Prime eCard static build completed successfully into ./dist');
