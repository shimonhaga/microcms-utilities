const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildExpandedSafeRegexSource,
  parseNgWords,
} = require('../../web/re2/ngWords');

test('web版でも source 生成ができる', () => {
  const source = buildExpandedSafeRegexSource(['news', 'spec']);

  assert.equal(
    source,
    '^([a-z0-9_-]{1,3}|[a-z0-9_-]{5,}|[^ns][a-z0-9_-]{3}|n[^e][a-z0-9_-]{2}|ne[^w][a-z0-9_-]|new[^s]|s[^p][a-z0-9_-]{2}|sp[^e][a-z0-9_-]|spe[^c])$',
  );
});

test('parseNgWords は改行/カンマ区切りを正規化する', () => {
  const words = parseNgWords(' news, spec\nalpha\n, beta ,,');

  assert.deepEqual(words, ['news', 'spec', 'alpha', 'beta']);
});
