import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROOT = path.join(__dirname, '../../../../../');

console.log(__dirname);

console.log(`ROOT_DIR ${ROOT}`);

export const APP_DIRS = {
  ROOT,
  TMP_DIR: path.join(ROOT, 'tmp'),
  MODULES_DIR: path.join(ROOT, 'modules'),
  INFRASTRUCTURE_DIR: path.join(ROOT, 'infrastructure'),
  PACKAGES_DIR: path.join(ROOT, 'packages'),
  PACKAGES_CLIENT_DIR: path.join(ROOT, 'packages', 'clients'),
  PACKAGES_INTERNAL_DIR: path.join(ROOT, 'packages', 'internal'),
  WORKER_DIR: path.join(ROOT, 'services', 'worker'),
  SCRIPTS_DIR: path.join(ROOT, 'scripts'),
} as const;
