import {asciiAlpha, asciiAlphanumeric} from 'micromark-util-character'

export function factoryName(effects, ok, nok, nameType) {
  var self = this

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
    if (
      code === 45 /* `-` */ ||
      code === 95 /* `_` */ ||
      asciiAlphanumeric(code)
    ) {
      effects.consume(code)
      return name
    }

    effects.exit(nameType)
    // To do next major: disallow `-` at end of name too, for consistency.
    return self.previous === 95 /* `_` */ ? nok(code) : ok(code)
  }
}
