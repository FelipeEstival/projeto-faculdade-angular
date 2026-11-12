import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const raw = process.env.API_URL?.trim();
let api;
try {
  api = new URL(raw);
  if (!['http:', 'https:'].includes(api.protocol) || api.username || api.password || api.search || api.hash) {
    throw new Error();
  }
} catch {
  console.error('Defina API_URL com o endereço HTTP(S) da API antes de rodar npm run build.');
  process.exit(1);
}

const require = createRequire(import.meta.url);
const result = spawnSync(process.execPath, [
  require.resolve('@angular/cli/bin/ng.js'), 'build', '--configuration', 'production',
  '--define', `__API_URL__=${JSON.stringify(api.href.replace(/\/+$/, ''))}`,
], { stdio: 'inherit' });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
