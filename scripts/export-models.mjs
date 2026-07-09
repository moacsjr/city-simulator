/**
 * Salva todos os templates .glb da página dev /export-models.html em
 * public/assets/model-templates/ (NÃO models/ — templates não devem
 * auto-ativar como modelos da cena).
 *
 * Puxa os bytes via page.evaluate em vez de downloads do navegador —
 * o Chrome bloqueia mais de ~10 downloads automáticos seguidos.
 *
 * Uso: node scripts/export-models.mjs [baseUrl]
 *   baseUrl padrão: http://localhost:5173 (rode `npm run dev` antes).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE_URL = process.argv[2] ?? 'http://localhost:5173';
const OUT_DIR = fileURLToPath(new URL('../public/assets/model-templates/', import.meta.url));

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`${BASE_URL}/export-models.html`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => Array.isArray(window.exportableIds));

const ids = await page.evaluate(() => window.exportableIds);
console.log(`exporting ${ids.length} templates…`);

for (const id of ids) {
  const base64 = await page.evaluate((modelId) => window.exportTemplate(modelId), id);
  writeFileSync(join(OUT_DIR, `${id}.glb`), Buffer.from(base64, 'base64'));
  console.log(`  ${id}.glb`);
}

await browser.close();
console.log(`ok — ${ids.length} templates em public/assets/model-templates/`);
