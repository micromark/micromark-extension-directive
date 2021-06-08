import {asciiAlpha, asciiAlphanumeric} from 'micromark-util-character'
import {codes} from 'micromark-util-symbol/codes.js'

export function factoryName(effects, ok, nok, nameType) {
  const self = this

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
      code === codes.dash ||
      code === codes.underscore ||
      asciiAlphanumeric(code)
    ) {
      effects.consume(code)
      return name
    }

    effects.exit(nameType)
    // To do next major: disallow `-` at end of name too, for consistency.
    return self.previous === codes.underscore ? nok(code) : ok(code)
  }
}
