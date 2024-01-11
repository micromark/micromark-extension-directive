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

/** @param {Code} code **/
const allowedCharacter = (code) =>
  code !== null && code <= codes.del
    ? code === codes.dash ||
      code === codes.dot ||
      code === codes.underscore ||
      asciiAlphanumeric(code)
    : classifyCharacter(code) !== constants.characterGroupWhitespace

/** @param {Code} code **/
const allowedEdgeCharacter = (code) =>
  allowedCharacter(code) &&
  classifyCharacter(code) !== constants.characterGroupPunctuation &&
  code !== codes.underscore

/**
 * @this {TokenizeContext}
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @param {TokenType} type
 */
export function factoryName(effects, ok, nok, type) {
  const self = this

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
    return allowedEdgeCharacter(self.previous) ? ok(code) : nok(code)
  }
}
