'use strict'

module.exports = createName

// To do: use `dist/`
var asciiAlpha = require('micromark/dist/character/ascii-alpha')
var asciiAlphanumeric = require('micromark/dist/character/ascii-alphanumeric')

function createName(effects, ok, nok, nameType) {
  return start

  function start(code) {
    if (asciiAlpha(code)) {
      effects.enter(nameType)
      effects.consume(code)
      return name
    }

    return nok(code)
  }

  function name(code) {
    if (code === 45 /* `-` */ || asciiAlphanumeric(code)) {
      effects.consume(code)
      return name
    }

    effects.exit(nameType)
    return ok(code)
  }
}
