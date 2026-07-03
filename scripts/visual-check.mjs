/**
 * Golden-screenshot check: boots the dev server page in headless Chromium and
 * captures the scene at the spec's event thresholds. Fails on any page error.
 *
 * Usage: node scripts/visual-check.mjs [baseUrl]
 *   default baseUrl: http://localhost:5173 (start `npm run dev` first, or pass
 *   a `vite preview` URL). Screenshots land in screenshots/.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE_URL = process.argv[2] ?? 'http://localhost:5173';
const GOLDEN_PROGRESS = [0, 15, 30, 45, 50, 60, 75, 85, 100];
const OUT_DIR = new URL('../screenshots/', import.meta.url).pathname;

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

await page.goto(BASE_URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500); // renderer init

for (const p of GOLDEN_PROGRESS) {
  await page.evaluate((value) => {
    const slider = document.querySelector('input[type=range]');
    slider.value = String(value);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }, p);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT_DIR}p${String(p).padStart(3, '0')}.png` });
  console.log(`captured p=${p}`);
}

await browser.close();

if (errors.length > 0) {
  console.error('page errors detected:');
  for (const error of errors.slice(0, 20)) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`ok — ${GOLDEN_PROGRESS.length} screenshots in screenshots/`);
