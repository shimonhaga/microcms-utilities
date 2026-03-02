const { execSync } = require('node:child_process');
const { chmodSync, existsSync } = require('node:fs');
const { join } = require('node:path');

function isGitRepository() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (!isGitRepository()) {
  console.log('[prepare] Git repository not found. Skipping hook setup.');
  process.exit(0);
}

execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });

const hookPath = join(process.cwd(), '.githooks', 'pre-commit');
if (existsSync(hookPath)) {
  chmodSync(hookPath, 0o755);
}

console.log('[prepare] Git hooks configured: .githooks/pre-commit');
