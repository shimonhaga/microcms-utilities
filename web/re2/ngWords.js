(function initNgWordsWebModule(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../../src/re2/ngWords'));
    return;
  }

  root.ngWordsUtils = factory(root.ngWords);
})(typeof globalThis !== 'undefined' ? globalThis : this, function createNgWordsUtils(ngWords) {
  if (!ngWords) {
    throw new Error('ngWords is required');
  }

  const {
    escapeRegExp,
    escapeForCharClass,
    buildExpandedSafeRegexSource,
  } = ngWords;

  /**
   * @param {string} input
   * @returns {string[]}
   */
  function parseNgWords(input) {
    if (typeof input !== 'string') {
      return [];
    }

    return [...new Set(input.split(/[\n,]/).map((word) => word.trim()).filter(Boolean))];
  }

  function runWeb(rawNgWords, alphabetClass, text) {
    const ngWords = parseNgWords(rawNgWords);
    const pattern = buildExpandedSafeRegexSource(ngWords, alphabetClass);
    const regex = new RegExp(pattern);
    const allowed = regex.test(text);

    return {
      ngWords,
      pattern,
      alphabetClass,
      text,
      allowed,
    };
  }

  return {
    escapeRegExp,
    escapeForCharClass,
    buildExpandedSafeRegexSource,
    parseNgWords,
    runWeb,
  };
});
