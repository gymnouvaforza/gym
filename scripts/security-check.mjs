import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${YELLOW}Starting security checks (Native Node.js)...${RESET}\n`);

let hasErrors = false;

// 1. Check for .env files in git-tracked files
try {
  const trackedFiles = execSync('git ls-files', { encoding: 'utf8' }).split(/\r?\n/);
  const envFiles = trackedFiles.filter(file => 
    file && 
    file.includes('.env') && 
    !file.endsWith('.example') && 
    !file.endsWith('.template') &&
    !file.includes('.gemini')
  );

  if (envFiles.length > 0) {
    console.error(`${RED}ERROR: Found .env files tracked by git:${RESET}`);
    envFiles.forEach(file => console.error(`  - ${file}`));
    hasErrors = true;
  } else {
    console.log(`${GREEN}✓ No .env files tracked by git.${RESET}`);
  }
} catch (e) {
  console.warn(`${YELLOW}Warning: Could not run git ls-files. Skipping tracked .env check.${RESET}`);
}

const secretPatterns = [
  { name: 'Private Key', regex: /-----BEGIN (RSA|OPENSSH|EC|PEM) PRIVATE KEY-----/ },
  { name: 'Firebase Service Role', regex: /"service_account".*"private_key_id"/s },
  { name: 'Generic Secret Assignment', regex: /const .*secret.* = ["'][a-zA-Z0-9]{20,}["']/i },
  { name: 'Suspicious NEXT_PUBLIC_ secret', regex: /NEXT_PUBLIC_.*(SECRET|TOKEN|PASSWORD|AUTH|KEY).*=.*["'][a-zA-Z0-9]{5,}["']/i }
];

const excludeDirs = ['node_modules', '.next', '.git', '.medusa', '.vscode', 'dist', 'build', 'coverage'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!excludeDirs.includes(f)) {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

console.log(`${YELLOW}Scanning files for hardcoded secrets and suspicious NEXT_PUBLIC_ variables...${RESET}`);

try {
  walkDir('.', (filePath) => {
    // Only scan relevant text-based files
    if (!/\.(js|ts|tsx|jsx|json|md|yml|yaml|sh|bash)$/.test(filePath)) return;
    if (filePath.includes('package-lock.json')) return;
    if (filePath.includes('security-check.mjs')) return; // Don't scan this script itself

    const content = fs.readFileSync(filePath, 'utf8');
    
    secretPatterns.forEach(pattern => {
      if (pattern.regex.test(content)) {
        console.error(`${RED}ERROR: Potential ${pattern.name} found in ${filePath}${RESET}`);
        // Log the line (carefully)
        const lines = content.split(/\r?\n/);
        lines.forEach((line, index) => {
          if (pattern.regex.test(line)) {
             // Mask potential secret value in output to be safe
             const maskedLine = line.replace(/(= ?["']).*(["'])/, '$1********$2');
             console.error(`  L${index + 1}: ${maskedLine.trim()}`);
          }
        });
        hasErrors = true;
      }
    });
  });
} catch (e) {
  console.error(`${RED}Error during file scan: ${e.message}${RESET}`);
  hasErrors = true;
}

if (hasErrors) {
  console.error(`\n${RED}Security checks failed. Please fix the issues above.${RESET}`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}All security checks passed!${RESET}`);
}
