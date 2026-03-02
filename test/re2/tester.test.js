const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const cliPath = path.join(__dirname, '../..', 'cli', 're2', 'tester.js');

test('tester CLI はマッチする場合 true を返す', () => {
  const result = spawnSync(process.execPath, [cliPath, '^news$', 'news'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'true');
});

test('tester CLI はマッチしない場合 false を返す', () => {
  const result = spawnSync(process.execPath, [cliPath, '^news$', 'spec'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'false');
});

test('tester CLI は引数不足時に終了コード1を返す', () => {
  const result = spawnSync(process.execPath, [cliPath, '^news$'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /使い方/);
});

test('tester CLI は不正な正規表現時に終了コード1を返す', () => {
  const result = spawnSync(process.execPath, [cliPath, '[', 'news'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /正規表現の解析に失敗しました/);
});

test('tester CLI はフラグ付き判定ができる', () => {
  const result = spawnSync(process.execPath, [cliPath, '^news$', 'NEWS', 'i'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'true');
});
