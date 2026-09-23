import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';

function getTestFiles(dir) {
  let results = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTestFiles(fullPath));
    } else if (file.endsWith('.test.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const servicesDir = join(process.cwd(), 'src', 'services');
const testFiles = getTestFiles(servicesDir);

console.log(`Found ${testFiles.length} frontend test files in src/services.\n`);

let passed = 0;
let failed = 0;
const failures = [];

for (let i = 0; i < testFiles.length; i++) {
  const file = testFiles[i];
  const relPath = file.replace(process.cwd(), '').replace(/^[\\\/]/, '');
  process.stdout.write(`[${i + 1}/${testFiles.length}] Running ${relPath} ... `);

  const res = spawnSync('npx.cmd', ['tsx', file], {
    stdio: 'pipe',
    shell: true,
    encoding: 'utf-8',
    timeout: 30000,
  });

  if (res.status === 0) {
    console.log('✅ PASS');
    passed++;
  } else {
    console.log('❌ FAIL');
    console.error(res.stderr || res.stdout);
    failures.push(relPath);
    failed++;
  }
}

console.log('\n========================================');
console.log(`FRONTEND TEST SUMMARY:`);
console.log(`Total Suites: ${testFiles.length}`);
console.log(`Passed:       ${passed}`);
console.log(`Failed:       ${failed}`);
console.log(`Pass Rate:    ${((passed / testFiles.length) * 100).toFixed(1)}%`);
console.log('========================================\n');

if (failed > 0) {
  console.error('Failed test suites:', failures);
  process.exit(1);
} else {
  console.log('ALL FRONTEND TESTS PASSED WITH 100% ACCURACY!');
  process.exit(0);
}
