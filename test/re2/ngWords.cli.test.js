const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const {
  buildExpandedSafeRegexSource,
} = require('../../src/re2/ngWords');
const cliPath = path.join(__dirname, '../..', 'cli', 're2', 'ngWords.js');

test('CLI は --text 指定時に allowed を返す', () => {
  const denied = spawnSync(process.execPath, [cliPath, 'xxx', 'yyy', '--text', 'xxx'], {
    encoding: 'utf8',
  });
  const allowed = spawnSync(process.execPath, [cliPath, 'xxx', 'yyy', '--text', 'xxz'], {
    encoding: 'utf8',
  });

  assert.equal(denied.status, 0);
  assert.equal(allowed.status, 0);

  const deniedOutput = JSON.parse(denied.stdout);
  const allowedOutput = JSON.parse(allowed.stdout);

  assert.equal(deniedOutput.allowed, false);
  assert.equal(allowedOutput.allowed, true);
  assert.equal(deniedOutput.alphabetClass, '[a-z0-9_-]');
  assert.equal(allowedOutput.alphabetClass, '[a-z0-9_-]');
  assert.equal(deniedOutput.pattern, buildExpandedSafeRegexSource(['xxx', 'yyy']));
  assert.doesNotMatch(deniedOutput.pattern, /\[\^[^\]]+\]/);
  assert.match(deniedOutput.pattern, /xx\[[^\]]+\]/);
  assert.match(deniedOutput.pattern, /yy\[[^\]]+\]/);
});

test('CLI は --alphabetClass 指定時に文字クラスを反映した source を返す', () => {
  const result = spawnSync(process.execPath, [cliPath, 'xxx', '--alphabetClass', '[A-Z]'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  const output = JSON.parse(result.stdout);
  assert.equal(output.pattern, buildExpandedSafeRegexSource(['xxx'], '[A-Z]'));
  assert.equal(output.alphabetClass, '[A-Z]');
});

test('CLI は --text の値がなくてもエラーにしない', () => {
  const result = spawnSync(process.execPath, [cliPath, 'xxx', '--text'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  const output = JSON.parse(result.stdout);
  assert.equal(output.pattern, buildExpandedSafeRegexSource(['xxx']));
  assert.equal(output.alphabetClass, '[a-z0-9_-]');
});

test('CLI は --alphabetClass の値がなくてもエラーにしない', () => {
  const result = spawnSync(process.execPath, [cliPath, 'xxx', '--alphabetClass'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  const output = JSON.parse(result.stdout);
  assert.equal(output.pattern, buildExpandedSafeRegexSource(['xxx']));
  assert.equal(output.alphabetClass, '[a-z0-9_-]');
});
