/**
 * @typedef {import('micromark-util-types').Code} Code
 * @typedef {import('micromark-util-types').Effects} Effects
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').TokenType} TokenType
 */

import {asciiAlphanumeric} from 'micromark-util-character'
import {classifyCharacter} from 'micromark-util-classify-character'
import {codes, constants} from 'micromark-util-symbol'

/**
 * @this {TokenizeContext}
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @param {TokenType} type
 */
export function factoryName(effects, ok, nok, type) {
  return start

  /** @type {State} */
  function start(code) {
    if (allowedEdgeCharacter(code)) {
      effects.enter(type)
      effects.consume(code)
      return name
    }

    return nok(code)
  }

  /** @type {State} */
  function name(code) {
    if (allowedCharacter(code)) {
      effects.consume(code)
      return name
    }

    effects.exit(type)
    return ok(code)
  }
}

/**
 * Checks if the character code is valid for a directive name
 *
 * @param {Code} code
 **/
function allowedCharacter(code) {
  return code !== null && code <= codes.del
    ? code === codes.dash ||
        code === codes.dot ||
        code === codes.underscore ||
        asciiAlphanumeric(code)
    : classifyCharacter(code) !== constants.characterGroupWhitespace
}

/**
 * Checks if the character code is valid as a directive name start (or end)
 *
 * @param {Code} code
 **/
function allowedEdgeCharacter(code) {
  return (
    allowedCharacter(code) &&
    classifyCharacter(code) !== constants.characterGroupPunctuation &&
    code !== codes.underscore
  )
}
