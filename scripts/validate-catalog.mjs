#!/usr/bin/env node
/**
 * Structural validation for data/catalog.json.
 * Exit code 1 for structural errors; warnings do not fail the build.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FILE = path.join(ROOT, 'data', 'catalog.json');

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ''));
}

function pct(part, total) {
  if (!total) return '0.0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

let catalog;
try {
  catalog = JSON.parse(await fs.readFile(FILE, 'utf8'));
} catch (error) {
  console.error(`[fatal] cannot read ${FILE}: ${error.message}`);
  process.exit(1);
}

if (!catalog || !Array.isArray(catalog.years) || !catalog.meta) {
  console.error('[fatal] catalog must contain meta and years[]');
  process.exit(1);
}

const all = [];
const ids = new Set();
const duplicateIds = new Set();
let banned = 0;
let zhTitles = 0;
let zhSummaries = 0;
let enSummaries = 0;
let jaSummaries = 0;
let anilistRatings = 0;
let doubanRatings = 0;
let bilibiliRatings = 0;

for (const group of catalog.years) {
  if (!Number.isInteger(group.year)) fail(`invalid year group: ${group.year}`);
  if (!Array.isArray(group.items)) {
    fail(`year ${group.year} has no items[]`);
    continue;
  }
  if (group.items.length < 40) fail(`year ${group.year} has only ${group.items.length} titles`);
  else if (group.items.length !== 50) warn(`year ${group.year} has ${group.items.length} titles (expected 50)`);

  let groupZh = 0;
  let groupSummary = 0;

  for (const item of group.items) {
    if (!item || typeof item !== 'object') {
      fail(`year ${group.year} contains a non-object item`);
      continue;
    }
    all.push(item);

    if (!item.id || typeof item.id !== 'string') fail(`year ${group.year}: missing id`);
    else if (ids.has(item.id)) duplicateIds.add(item.id);
    else ids.add(item.id);

    if (item.year !== group.year) fail(`${item.id}: item.year ${item.year} !== group ${group.year}`);
    if (!Number.isFinite(item.anilistId)) fail(`${item.id}: missing anilistId`);
    if (!item.zh || typeof item.zh !== 'string') fail(`${item.id}: missing zh title`);
    if (!item.ja || typeof item.ja !== 'string') fail(`${item.id}: missing ja title`);
    if (!item.cover || typeof item.cover !== 'string') fail(`${item.id}: missing cover`);
    if (!Array.isArray(item.tags) || item.tags.length === 0) fail(`${item.id}: missing tags`);
    if (!Number.isFinite(item.ratings?.anilist) || item.ratings.anilist <= 0) {
      fail(`${item.id}: missing AniList rating`);
    }
    if (!item.summary || typeof item.summary !== 'string') fail(`${item.id}: missing summary`);
    if (!['zh', 'en', 'ja', 'none'].includes(item.summaryLang)) {
      fail(`${item.id}: invalid summaryLang ${item.summaryLang}`);
    }
    if (item.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(item.startDate)) {
      warn(`${item.id}: invalid startDate ${item.startDate}`);
    }
    if (item.summaries) {
      for (const [language, value] of Object.entries(item.summaries)) {
        if (!['zh', 'en', 'ja'].includes(language) || typeof value !== 'string') {
          fail(`${item.id}: invalid summaries.${language}`);
        }
      }
    }
    if (!item.siteUrl || !/^https:\/\//.test(item.siteUrl)) fail(`${item.id}: invalid siteUrl`);

    if (item.cover) {
      try {
        const host = new URL(item.cover).hostname;
        if (host !== 's4.anilist.co') warn(`${item.id}: unexpected cover host ${host}`);
      } catch {
        fail(`${item.id}: invalid cover URL`);
      }
    }

    if (typeof item.isBanned !== 'boolean') fail(`${item.id}: isBanned must be boolean`);
    if (item.isBanned) banned += 1;
    if (hasCjk(item.zh)) {
      zhTitles += 1;
      groupZh += 1;
    }
    if (item.summaries?.zh) {
      zhSummaries += 1;
      groupSummary += 1;
    }
    if (item.summaries?.en) enSummaries += 1;
    if (item.summaries?.ja) jaSummaries += 1;
    if (Number.isFinite(item.ratings?.anilist)) anilistRatings += 1;
    if (Number.isFinite(item.ratings?.douban)) doubanRatings += 1;
    if (Number.isFinite(item.ratings?.bilibili)) bilibiliRatings += 1;
  }

  console.log(
    `  ${group.year}  ${String(group.items.length).padStart(3)} titles  ` +
      `zh ${pct(groupZh, group.items.length).padStart(6)}  ` +
      `summary ${pct(groupSummary, group.items.length).padStart(6)}  ` +
      `status ${group.status}`,
  );
}

if (duplicateIds.size) fail(`duplicate ids: ${[...duplicateIds].slice(0, 10).join(', ')}`);

if (catalog.meta.total !== all.length) {
  fail(`meta.total ${catalog.meta.total} !== actual ${all.length}`);
}
if (catalog.meta.banned !== banned) {
  fail(`meta.banned ${catalog.meta.banned} !== actual ${banned}`);
}
if (catalog.meta.playable !== all.length - banned) {
  fail(`meta.playable should be ${all.length - banned}, got ${catalog.meta.playable}`);
}
if (catalog.years.length !== 21) {
  warn(`catalog has ${catalog.years.length} year groups (expected 21)`);
}

if (zhTitles === 0) warn('no Chinese titles detected');
if (zhTitles / Math.max(all.length, 1) < 0.9) {
  warn(`Chinese title coverage is ${pct(zhTitles, all.length)} (< 90%)`);
}
if (zhSummaries / Math.max(all.length, 1) < 0.75) {
  warn(`Chinese summary coverage is ${pct(zhSummaries, all.length)} (< 75%)`);
}

console.log('');
console.log(`years      ${catalog.years.length}`);
console.log(`titles     ${all.length}  (unique ${ids.size})`);
console.log(`sealed     ${banned}`);
console.log(`zh title   ${pct(zhTitles, all.length)}`);
console.log(`zh summary ${pct(zhSummaries, all.length)}`);
console.log(`en summary ${pct(enSummaries, all.length)}`);
console.log(`ja summary ${pct(jaSummaries, all.length)}`);
console.log(`anilist    ${pct(anilistRatings, all.length)}`);
console.log(`douban     ${pct(doubanRatings, all.length)}`);
console.log(`bilibili   ${pct(bilibiliRatings, all.length)}`);
console.log(`generated  ${catalog.meta.generatedAt}`);
console.log('');

if (warnings.length) {
  console.log(`warnings (${warnings.length})`);
  for (const item of warnings.slice(0, 20)) console.log(`  ! ${item}`);
  if (warnings.length > 20) console.log(`  … ${warnings.length - 20} more`);
  console.log('');
}

if (errors.length) {
  console.error(`FAILED (${errors.length} errors)`);
  for (const item of errors.slice(0, 30)) console.error(`  x ${item}`);
  if (errors.length > 30) console.error(`  … ${errors.length - 30} more`);
  process.exitCode = 1;
} else {
  console.log('OK');
}
