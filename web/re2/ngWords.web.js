(function initNgWordsBrowserModule(root, factory) {
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
    parseNgWords,
  } = ngWords;

  /**
   * @param {string[]} ngWords
   * @param {string} [alphabetClass='[a-z0-9_-]']
   * @returns {RegExp}
   */
  function buildExpandedSafeRegex(ngWords, alphabetClass = '[a-z0-9_-]') {
    return new RegExp(buildExpandedSafeRegexSource(ngWords, alphabetClass));
  }

  /**
   * @param {string} text
   * @param {string[]} ngWords
   * @param {string} [alphabetClass='[a-z0-9_-]']
   * @returns {boolean}
   */
  function isAllowed(text, ngWords, alphabetClass = '[a-z0-9_-]') {
    return buildExpandedSafeRegex(ngWords, alphabetClass).test(text);
  }

  return {
    escapeRegExp,
    escapeForCharClass,
    buildExpandedSafeRegexSource,
    buildExpandedSafeRegex,
    parseNgWords,
    isAllowed,
  };
});
