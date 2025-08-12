import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROOT = path.join(__dirname, '../../../../../');

export const APP_DIRS = {
  ROOT,
  MODULES_DIR: path.join(ROOT, 'modules'),
  INFRASTRUCTURE_DIR: path.join(ROOT, 'infrastructure'),
  PACKAGES_DIR: path.join(ROOT, 'packages'),
  PACKAGES_CLIENT_DIR: path.join(ROOT, 'packages', 'internal'),
  PACKAGES_INTERNAL_DIR: path.join(ROOT, 'packages', 'clients'),
  WORKER_DIR: path.join(ROOT, 'servcies', 'worker'),
  SCRIPTS_DIR: path.join(ROOT, 'scripts'),
} as const;
