/**
 * Copies .template data files to their runtime names if they don't already exist.
 * Safe to run multiple times — never overwrites existing data files.
 *
 * Run manually: npm run init
 * Also runs automatically as part of: npm run build
 */

import { existsSync, copyFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '..', 'src', 'data');
const templates = readdirSync(dataDir).filter(f => f.endsWith('.template'));

let copied = 0;
let skipped = 0;

for (const template of templates) {
  const target = template.replace('.template', '');
  const targetPath = join(dataDir, target);
  const templatePath = join(dataDir, template);

  if (existsSync(targetPath)) {
    skipped++;
  } else {
    copyFileSync(templatePath, targetPath);
    console.log(`  Created ${target} from template`);
    copied++;
  }
}

if (copied > 0) {
  console.log(`Data init: created ${copied} file(s), ${skipped} already existed.`);
} else if (templates.length > 0) {
  console.log(`Data init: all ${skipped} data file(s) already exist.`);
}
