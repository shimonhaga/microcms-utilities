const RE2 = require('re2');

/**
 * CLIエントリポイント。
 *
 * コマンドライン引数から正規表現とテスト文字列を受け取り、
 * RE2でマッチ判定した結果を `true` / `false` で標準出力する。
 * 引数不足または正規表現の解析失敗時は標準エラー出力へメッセージを出し、終了コード1を設定する。
 *
 * 使い方: `node cli/re2/tester.js <正規表現> <テスト文字列> [フラグ]`
 *
 * @returns {void}
 */
function runCli() {
  const args = process.argv.slice(2);
  const [pattern, text, flags = ''] = args;

  if (typeof pattern !== 'string' || typeof text !== 'string') {
    console.error('使い方: node cli/re2/tester.js <正規表現> <テスト文字列> [フラグ]');
    process.exitCode = 1;
    return;
  }

  try {
    const result = new RE2(pattern, flags).test(text);
    console.log(String(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : '不明なエラー';
    console.error(`正規表現の解析に失敗しました: ${message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  runCli,
};
