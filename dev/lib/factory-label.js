/**
 * @typedef {import('micromark-util-types').Effects} Effects
 * @typedef {import('micromark-util-types').State} State
 */

import assert from 'assert'
import {markdownLineEnding} from 'micromark-util-character'
import {codes} from 'micromark-util-symbol/codes.js'
import {constants} from 'micromark-util-symbol/constants.js'
import {types} from 'micromark-util-symbol/types.js'

// This is a fork of:
// <https://github.com/micromark/micromark/tree/main/packages/micromark-factory-label>
// to allow empty labels, balanced brackets (such as for nested directives),
// text instead of strings, and optionally disallows EOLs.

/**
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @param {string} type
 * @param {string} markerType
 * @param {string} stringType
 * @param {boolean} [disallowEol=false]
 */
// eslint-disable-next-line max-params
export function factoryLabel(
  effects,
  ok,
  nok,
  type,
  markerType,
  stringType,
  disallowEol
) {
  let size = 0
  let balance = 0

  return start

  /** @type {State} */
  function start(code) {
    assert(code === codes.leftSquareBracket, 'expected `[`')
    effects.enter(type)
    effects.enter(markerType)
    effects.consume(code)
    effects.exit(markerType)
    return afterStart
  }

  /** @type {State} */
  function afterStart(code) {
    if (code === codes.rightSquareBracket) {
      effects.enter(markerType)
      effects.consume(code)
      effects.exit(markerType)
      effects.exit(type)
      return ok
    }

    effects.enter(stringType)
    return atBreak(code)
  }

  /** @type {State} */
  function atBreak(code) {
    if (code === codes.eof || size > constants.linkReferenceSizeMax) {
      return nok(code)
    }

    if (code === codes.rightSquareBracket && !balance--) {
      return atClosingBrace(code)
    }

    if (markdownLineEnding(code)) {
      if (disallowEol) {
        return nok(code)
      }

      effects.enter(types.lineEnding)
      effects.consume(code)
      effects.exit(types.lineEnding)
      return atBreak
    }

    effects.enter(types.chunkText, {contentType: constants.contentTypeText})
    return label(code)
  }

  /** @type {State} */
  function label(code) {
    if (
      code === codes.eof ||
      markdownLineEnding(code) ||
      size > constants.linkReferenceSizeMax
    ) {
      effects.exit(types.chunkText)
      return atBreak(code)
    }

    if (
      code === codes.leftSquareBracket &&
      ++balance > constants.linkResourceDestinationBalanceMax
    ) {
      return nok(code)
    }

    if (code === codes.rightSquareBracket && !balance--) {
      effects.exit(types.chunkText)
      return atClosingBrace(code)
    }

    effects.consume(code)
    return code === codes.backslash ? labelEscape : label
  }

  /** @type {State} */
  function atClosingBrace(code) {
    effects.exit(stringType)
    effects.enter(markerType)
    effects.consume(code)
    effects.exit(markerType)
    effects.exit(type)
    return ok
  }

  /** @type {State} */
  function labelEscape(code) {
    if (
      code === codes.leftSquareBracket ||
      code === codes.backslash ||
      code === codes.rightSquareBracket
    ) {
      effects.consume(code)
      size++
      return label
    }

    return label(code)
  }
}
