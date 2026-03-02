const RE2 = require('re2');

/**
 * 正規表現のメタ文字をエスケープする
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

/**
 * 文字クラス内でメタ文字をエスケープする
 * @param {string} value
 * @returns {string}
 */
function escapeForCharClass(value) {
  return value.replace(/[\\\]\-\^]/g, '\\$&');
}

/**
 * 同一長の禁止語集合に対して、先読み/後読みに依存しない展開済み source を生成する
 * @param {string[]} words
 * @param {string} alphabetClass
 * @returns {string}
 */
function buildExpandedGroupSource(words, alphabetClass) {
  const length = words[0].length;

  /** @type {(prefix: string, subset: string[], position: number) => string[]} */
  function expand(prefix, subset, position) {
    const charSet = [...new Set(subset.map((word) => word[position]))];
    const excluded = charSet.map(escapeForCharClass).join('');
    const branches = [];

    if (position === length - 1) {
      branches.push(`${prefix}[^${excluded}]`);
      return branches;
    }

    const rest = length - position - 1;
    branches.push(
      `${prefix}[^${excluded}]${rest === 1 ? alphabetClass : `${alphabetClass}{${rest}}`}`,
    );

    for (const ch of charSet) {
      const escaped = escapeRegExp(ch);
      const nextSubset = subset.filter((word) => word[position] === ch);
      branches.push(...expand(`${prefix}${escaped}`, nextSubset, position + 1));
    }

    return branches;
  }

  return expand('', words, 0).join('|');
}

/**
 * 先読み/後読みなしで「禁止語に一致しない」ための展開済み正規表現 source を生成する
 *
 * 例: ['news', 'spec']
 * -> ^(?:[a-z0-9_-]{1,2}|[a-z0-9_-]{4,}|[^ns][a-z0-9_-]{3}|n[^e][a-z0-9_-]{2}|ne[^w][a-z0-9_-]|new[^s]|s[^p][a-z0-9_-]{2}|sp[^e][a-z0-9_-]|spe[^c])$
 *
 * @param {string[]} ngWords
 * @param {string} [alphabetClass='[a-z0-9_-]']
 * @returns {string}
 */
function buildExpandedSafeRegexSource(ngWords, alphabetClass = '[a-z0-9_-]') {
  if (!Array.isArray(ngWords)) {
    throw new TypeError('ngWords must be an array of strings');
  }

  const words = [
    ...new Set(
      ngWords.filter((word) => typeof word === 'string').filter((word) => word.length > 0),
    ),
  ];

  if (words.length === 0) {
    return `${alphabetClass}+`;
  }

  /** @type {Map<number, string[]>} */
  const groups = new Map();
  for (const word of words) {
    const list = groups.get(word.length);
    if (list) {
      list.push(word);
    } else {
      groups.set(word.length, [word]);
    }
  }

  const groupSources = [...groups.entries()]
    .sort(([lenA], [lenB]) => lenA - lenB)
    .map(([, groupWords]) => buildExpandedGroupSource(groupWords, alphabetClass));

  let regexSource = groupSources.join('|');

  // 禁止文字列の最小文字数や最大文字数の場合は無条件でOKにするため、先頭にパターンを追加する
  const minLength = Math.min(...groups.keys());
  const maxLength = Math.max(...groups.keys());
  if (maxLength < Infinity) {
    regexSource = `${alphabetClass}{${maxLength + 1},}|${regexSource}`;
  }
  if (minLength > 1) {
    regexSource = `${alphabetClass}{1,${minLength - 1}}|${regexSource}`;
  }

  return `^(${regexSource})$`;
}

/**
 * 先読み/後読みを使わない展開済み safe regex を RE2 インスタンスとして返す
 * @param {string[]} ngWords
 * @param {string} [alphabetClass='[a-z0-9_-]']
 * @returns {RE2}
 */
function buildExpandedSafeRegex(ngWords, alphabetClass = '[a-z0-9_-]') {
  const source = buildExpandedSafeRegexSource(ngWords, alphabetClass);
  return new RE2(source);
}

/**
 * CLI: node src/re2/ngWords.js NG1 NG2 [--alphabetClass "[a-z0-9_-]"] [--text "チェック対象"]
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
      '使い方: node src/re2/ngWords.js <禁止語...> [--alphabetClass <文字クラス>] [--text <判定文字列>]',
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
  buildExpandedSafeRegexSource,
  buildExpandedSafeRegex,
  escapeRegExp,
  escapeForCharClass,
};
