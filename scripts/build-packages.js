const { readdirSync, statSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

const packagesDir = 'packages';
const packages = readdirSync(packagesDir);

packages.forEach(pkg => {
  const pkgPath = join(packagesDir, pkg);
  if (statSync(pkgPath).isDirectory()) {
    console.log(`Building ${pkg}...`);
    execSync('npm run build', { cwd: pkgPath, stdio: 'inherit' });
  }
});
