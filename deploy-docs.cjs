// Script to copy build folder to root docs folder for GitHub Pages
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'ai-kids', 'build');
const docsDir = path.join(__dirname, 'docs');

// Remove existing docs folder
if (fs.existsSync(docsDir)) {
  fs.rmSync(docsDir, { recursive: true, force: true });
}

// Copy build to docs
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(buildDir)) {
  copyRecursiveSync(buildDir, docsDir);
  
  // Create .nojekyll file to disable Jekyll processing
  fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');
  
  console.log('✅ Successfully copied build to docs folder');
  console.log('✅ Created .nojekyll file');
} else {
  console.error('❌ Build folder not found. Run "npm run build" first in ai-kids directory.');
  process.exit(1);
}

