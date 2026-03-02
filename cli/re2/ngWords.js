const RE2 = require('re2');
const { buildExpandedSafeRegexSource } = require('../../src/re2/ngWords');

/**
 * CLI: node cli/re2/ngWords.js NG1 NG2 [--alphabetClass "[a-z0-9_-]"] [--text "チェック対象"]
 */
function runCli() {
  const args = process.argv.slice(2);
  const ngWords = [];
  let text;
  let alphabetClass = '[a-z0-9_-]';

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--text') {
      const nextArg = args[i + 1];
      if (typeof nextArg === 'string' && !nextArg.startsWith('--')) {
        text = nextArg;
        i += 1;
      }
      continue;
    }

    if (arg === '--alphabetClass' || arg === '--alphabet-class') {
      const nextArg = args[i + 1];
      if (typeof nextArg === 'string' && !nextArg.startsWith('--')) {
        alphabetClass = nextArg;
        i += 1;
      }
      continue;
    }

    ngWords.push(arg);
  }

  if (ngWords.length === 0) {
    console.error(
      '使い方: node cli/re2/ngWords.js <禁止語...> [--alphabetClass <文字クラス>] [--text <判定文字列>]',
    );
    process.exitCode = 1;
    return;
  }

  const source = buildExpandedSafeRegexSource(ngWords, alphabetClass);

  if (typeof text === 'string') {
    const regex = new RE2(source);
    const allowed = regex.test(text);
    console.log(
      JSON.stringify(
        {
          pattern: source,
          alphabetClass,
          text,
          allowed,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(
    JSON.stringify(
      {
        pattern: source,
        alphabetClass,
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  runCli();
}

module.exports = {
  runCli,
};
