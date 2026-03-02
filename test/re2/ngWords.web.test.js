const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildExpandedSafeRegexSource,
} = require('../../src/re2/ngWords');

test('web版でも source 生成ができる', () => {
  const source = buildExpandedSafeRegexSource(['news', 'spec']);

  assert.equal(
    source,
    '^([a-z0-9_-]{1,3}|[a-z0-9_-]{5,}|[abcdefghijklmopqrtuvwxyz0123456789_-][a-z0-9_-]{3}|n[abcdfghijklmnopqrstuvwxyz0123456789_-][a-z0-9_-]{2}|ne[abcdefghijklmnopqrstuvxyz0123456789_-][a-z0-9_-]|new[abcdefghijklmnopqrtuvwxyz0123456789_-]|s[abcdefghijklmnoqrstuvwxyz0123456789_-][a-z0-9_-]{2}|sp[abcdfghijklmnopqrstuvwxyz0123456789_-][a-z0-9_-]|spe[abdefghijklmnopqrstuvwxyz0123456789_-])$',
  );
});
