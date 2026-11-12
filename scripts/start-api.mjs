import { copyFileSync, constants, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const db = resolve(process.env.DB_PATH || '.data/db.json');
mkdirSync(dirname(db), { recursive: true });
try {
  copyFileSync(new URL('../db.seed.json', import.meta.url), db, constants.COPYFILE_EXCL);
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
const cli = resolve(dirname(require.resolve('json-server/package.json')), 'lib/bin.js');
const port = process.env.PORT || '3000';
const host = process.env.HOST || '0.0.0.0';
const child = spawn(process.execPath, [cli, '--host', host, '--port', port, db], {
  cwd: fileURLToPath(new URL('../', import.meta.url)), stdio: 'inherit',
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => { process.exitCode = code ?? 0; });
