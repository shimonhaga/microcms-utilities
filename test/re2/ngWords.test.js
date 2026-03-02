const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  buildExpandedSafeRegexSource,
} = require('../../src/re2/ngWords');
const cliPath = path.join(__dirname, '../..', 'cli', 're2', 'ngWords.js');

test('先読み/後読みなし展開 source を生成できる(news/spec 例)', () => {
  const source = buildExpandedSafeRegexSource(['news', 'spec']);

  assert.equal(
    source,
    '^([a-z0-9_-]{1,3}|[a-z0-9_-]{5,}|[abcdefghijklmopqrtuvwxyz0123456789_-][a-z0-9_-]{3}|n[abcdfghijklmnopqrstuvwxyz0123456789_-][a-z0-9_-]{2}|ne[abcdefghijklmnopqrstuvxyz0123456789_-][a-z0-9_-]|new[abcdefghijklmnopqrtuvwxyz0123456789_-]|s[abcdefghijklmnoqrstuvwxyz0123456789_-][a-z0-9_-]{2}|sp[abcdfghijklmnopqrstuvwxyz0123456789_-][a-z0-9_-]|spe[abdefghijklmnopqrstuvwxyz0123456789_-])$',
  );
});
