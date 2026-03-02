(function initNgWords(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.ngWords = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function createNgWords() {
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
   * 文字クラスの定義を展開する
   * @param {string} alphabetClass
   * @returns {string[]}
   */
  function expandAlphabetClass(alphabetClass) {
    if (alphabetClass.startsWith('[') && alphabetClass.endsWith(']')) {
      const classContent = alphabetClass.slice(1, -1).split('');
      let expanded = [];
      for (let i = 0; i < classContent.length; i++) {
        if (i + 2 < classContent.length && classContent[i + 1] === '-') {
          const start = classContent[i].charCodeAt(0);
          const end = classContent[i + 2].charCodeAt(0);
          if (start <= end) {
            for (let code = start; code <= end; code++) {
              expanded.push(String.fromCharCode(code));
            }
            i += 2;
            continue;
          }
        }
        expanded.push(classContent[i]);
      }
      return expanded;
    }
    throw new Error(`Invalid alphabet class: ${alphabetClass}`);
  }

  function compressToRanges(chars) {
    const sorted = [...new Set(chars)].sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
    const ranges = [];

    let start = sorted[0];
    let prev = start;

    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i];
      if (curr.charCodeAt(0) === prev.charCodeAt(0) + 1) {
        prev = curr;
        continue;
      }
      ranges.push([start, prev]);
      start = prev = curr;
    }
    ranges.push([start, prev]);

    // ranges を アルファベット、数字、その他の順にソートする
    ranges.sort(([aStart], [bStart]) => {
      const aCode = aStart.charCodeAt(0);
      const bCode = bStart.charCodeAt(0);
      const aType =
        aCode >= 48 && aCode <= 57
          ? 1
          : aCode >= 65 && aCode <= 90
            ? 2
            : aCode >= 97 && aCode <= 122
              ? 3
              : 4;
      const bType =
        bCode >= 48 && bCode <= 57
          ? 1
          : bCode >= 65 && bCode <= 90
            ? 2
            : bCode >= 97 && bCode <= 122
              ? 3
              : 4;
      if (aType !== bType) {
        return aType - bType;
      }
      return aCode - bCode;
    });

    return ranges;
  }

  function rangesToClass(ranges) {
    return (
      '[' +
      ranges
        .map(([s, e]) => {
          const escapedStart = escapeForCharClass(s);
          const escapedEnd = escapeForCharClass(e);
          return s === e ? escapedStart : `${escapedStart}-${escapedEnd}`;
        })
        .join('') +
      ']'
    );
  }

  /**
   * 同一長の禁止語集合に対して、先読み/後読みに依存しない展開済み source を生成する
   * @param {string[]} words
   * @param {string} alphabetClass
   * @param {string[]} expandedAlphabet
   * @returns {string}
   */
  function buildExpandedGroupSource(words, alphabetClass, expandedAlphabet) {
    const length = words[0].length;

    /** @type {(prefix: string, subset: string[], position: number) => string[]} */
    function expand(prefix, subset, position) {
      const charSet = [...new Set(subset.map((word) => word[position]))];
      // 例えば excluded = 'x' のとき
      const excluded = charSet.map(escapeForCharClass).join('');
      // 単純に [^x] とするのではなく、例えば [a-wy-z0-9_-] のようする
      const excludedClass = rangesToClass(
        compressToRanges(expandedAlphabet.filter((ch) => !excluded.includes(ch))),
      );

      const branches = [];

      if (position === length - 1) {
        branches.push(`${prefix}${excludedClass}`);
        return branches;
      }

      const rest = length - position - 1;
      branches.push(
        `${prefix}${excludedClass}${rest === 1 ? alphabetClass : `${alphabetClass}{${rest}}`}`,
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
   * 先読み/後読みを使わない展開済み safe regex の source を生成する
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

    const expandedAlphabet = expandAlphabetClass(alphabetClass);

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
      .map(([, groupWords]) =>
        buildExpandedGroupSource(groupWords, alphabetClass, expandedAlphabet),
      );

    let regexSource = groupSources.join('|');

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

  return {
    escapeRegExp,
    escapeForCharClass,
    buildExpandedSafeRegexSource,
  };
});
