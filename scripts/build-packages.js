const { readdirSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

const packagesDir = 'packages';
const packages = readdirSync(packagesDir);

packages.forEach(pkg => {
  const pkgPath = join(packagesDir, pkg);
  console.log(`Building ${pkg}...`);
  execSync('npm run build', { cwd: pkgPath, stdio: 'inherit' });
});
