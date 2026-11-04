/**
 * Reinstalación limpia de node_modules (Windows: cerrar ng serve / IDE que bloquee archivos).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const nm = path.join(root, 'node_modules');

console.log('Eliminando node_modules...');
fs.rmSync(nm, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });

console.log('npm ci...');
execSync('npm ci', { cwd: root, stdio: 'inherit', env: process.env });

console.log('Listo. Ejecute: npm start');
