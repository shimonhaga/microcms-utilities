const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildExpandedSafeRegexSource,
  buildExpandedSafeRegex,
  isAllowed,
  parseNgWords,
} = require('../../web/re2/ngWords.web');

test('web版でも source 生成ができる', () => {
  const source = buildExpandedSafeRegexSource(['news', 'spec']);

  assert.equal(
    source,
    '^([a-z0-9_-]{1,3}|[a-z0-9_-]{5,}|[^ns][a-z0-9_-]{3}|n[^e][a-z0-9_-]{2}|ne[^w][a-z0-9_-]|new[^s]|s[^p][a-z0-9_-]{2}|sp[^e][a-z0-9_-]|spe[^c])$',
  );
});

test('web版の RegExp で禁止語を除外できる', () => {
  const safeRegex = buildExpandedSafeRegex(['news', 'spec']);

  assert.equal(safeRegex.test('news'), false);
  assert.equal(safeRegex.test('spec'), false);
  assert.equal(safeRegex.test('newz'), true);
  assert.equal(safeRegex.test('spac'), true);
});

test('parseNgWords は改行/カンマ区切りを正規化する', () => {
  const words = parseNgWords(' news, spec\nalpha\n, beta ,,');

  assert.deepEqual(words, ['news', 'spec', 'alpha', 'beta']);
});

test('isAllowed は判定結果を返す', () => {
  assert.equal(isAllowed('news', ['news']), false);
  assert.equal(isAllowed('newz', ['news']), true);
});
