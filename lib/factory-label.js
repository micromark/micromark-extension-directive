module.exports = createLabel

// To do: use `dist/`
var markdownLineEnding = require('micromark/dist/character/markdown-line-ending')
var markdownSpace = require('micromark/dist/character/markdown-space')

// This is a fork of:
// <https://github.com/micromark/micromark/blob/bf53bf9/lib/tokenize/factory-label.js>
// to allow empty, support text instead of strings, and optionally w/o EOLs,
// labels.

// eslint-disable-next-line max-params
function createLabel(
  effects,
  ok,
  nok,
  type,
  markerType,
  stringType,
  allowEmpty,
  disallowEol
) {
  var size = 0
  var data

  return start

  function start(code) {
    /* istanbul ignore if - always `[` */
    if (code !== 91 /* `[` */) throw new Error('expected `[`')
    effects.enter(type)
    effects.enter(markerType)
    effects.consume(code)
    effects.exit(markerType)
    return afterStart
  }

  function afterStart(code) {
    if (code === 93 /* `]` */ && allowEmpty) {
      effects.enter(markerType)
      effects.consume(code)
      effects.exit(markerType)
      effects.exit(type)
      return ok
    }

    effects.enter(stringType)
    return atBreak(code)
  }

  function atBreak(code) {
    if (
      code === null /* EOF */ ||
      code === 91 /* `[` */ ||
      (code === 93 /* `]` */ && !data && !allowEmpty) ||
      /* <https://github.com/micromark/micromark/blob/bf53bf9/lib/constant/constants.js#L34> */
      size > 999
    ) {
      return nok(code)
    }

    if (code === 93 /* `]` */) {
      effects.exit(stringType)
      effects.enter(markerType)
      effects.consume(code)
      effects.exit(markerType)
      effects.exit(type)
      return ok
    }

    if (markdownLineEnding(code)) {
      if (disallowEol) {
        return nok(code)
      }

      effects.enter('lineEnding')
      effects.consume(code)
      effects.exit('lineEnding')
      return atBreak
    }

    effects.enter('chunkText', {contentType: 'text'})
    return label(code)
  }

  function label(code) {
    if (
      code === null /* EOF */ ||
      code === 91 /* `[` */ ||
      code === 93 /* `]` */ ||
      markdownLineEnding(code) ||
      /* <https://github.com/micromark/micromark/blob/bf53bf9/lib/constant/constants.js#L34> */
      size > 999
    ) {
      effects.exit('chunkText')
      return atBreak(code)
    }

    effects.consume(code)
    data = data || !markdownSpace(code)
    return code === 92 /* `\` */ ? labelEscape : label
  }

  function labelEscape(code) {
    if (
      code === 91 /* `[` */ ||
      code === 92 /* `\` */ ||
      code === 93 /* `]` */
    ) {
      effects.consume(code)
      size++
      return label
    }

    return label(code)
  }
}
