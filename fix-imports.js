import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      findTsFiles(filePath, fileList);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function addJsExtensionsToImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Regex to match relative imports without extensions
  // This matches import statements with './' or '../' paths that don't already have a file extension
  const importRegex = /(from\s+['"])(\.\.?\/[^'"]*?)(['"])/g;
  
  content = content.replace(importRegex, (match, prefix, importPath, quote) => {
    // Skip if the import already has an extension
    if (/\.(js|ts|json|jsx|tsx)$/.test(importPath)) {
      return match;
    }
    modified = true;
    return `${prefix}${importPath}.js${quote}`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  }
}

const srcDir = path.join(__dirname, 'src');
const tsFiles = findTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to process`);

tsFiles.forEach(file => {
  addJsExtensionsToImports(file);
});

console.log('Done updating imports!');
