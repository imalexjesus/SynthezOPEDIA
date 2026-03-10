import fs from 'node:fs/promises';

const filePath = 'src/lib/data/synths.ts';
const source = await fs.readFile(filePath, 'utf8');
const blocks = source.match(/  \{[\s\S]*?\n  \},/g) || [];

let updated = source;
let fixed = 0;

for (const block of blocks) {
  if (!block.includes("'undefined'")) continue;

  const modelMatch = block.match(/modelName:\s*'([^']+)'/);
  const model = (modelMatch?.[1] ?? 'model')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const next = block.replace(/'undefined'/g, `'https://example.com/${model}-1.jpg'`);
  if (next !== block) {
    updated = updated.replace(block, next);
    fixed += 1;
  }
}

if (updated !== source) {
  await fs.writeFile(filePath, updated, 'utf8');
}

console.log(`fixed_blocks ${fixed}`);
