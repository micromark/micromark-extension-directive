/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 * @typedef {import('micromark-util-types').Handle} _Handle
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 */

/**
 * @typedef {[string, string]} Attribute
 * @typedef {'containerDirective' | 'leafDirective' | 'textDirective'} DirectiveType
 *
 * @typedef Directive
 * @property {DirectiveType} type
 * @property {string} name
 * @property {string | undefined} [label]
 * @property {Record<string, string> | undefined} [attributes]
 * @property {string | undefined} [content]
 * @property {number | undefined} [_fenceCount]
 *
 * @callback Handle
 * @param {CompileContext} this
 * @param {Directive} directive
 * @returns {boolean | void}
 *
 * @typedef {Record<string, Handle>} HtmlOptions
 */

import {ok as assert} from 'uvu/assert'
import {parseEntities} from 'parse-entities'

const own = {}.hasOwnProperty

/**
 * @param {HtmlOptions | null | undefined} [options]
 * @returns {HtmlExtension}
 */
export function directiveHtml(options) {
  const options_ = options || {}
  return {
    enter: {
      directiveContainer() {
        return enter.call(this, 'containerDirective')
      },
      directiveContainerAttributes: enterAttributes,
      directiveContainerLabel: enterLabel,
      directiveContainerContent() {
        this.buffer()
      },

      directiveLeaf() {
        return enter.call(this, 'leafDirective')
      },
      directiveLeafAttributes: enterAttributes,
      directiveLeafLabel: enterLabel,

      directiveText() {
        return enter.call(this, 'textDirective')
      },
      directiveTextAttributes: enterAttributes,
      directiveTextLabel: enterLabel
    },
    exit: {
      directiveContainer: exit,
      directiveContainerAttributeClassValue: exitAttributeClassValue,
      directiveContainerAttributeIdValue: exitAttributeIdValue,
      directiveContainerAttributeName: exitAttributeName,
      directiveContainerAttributeValue: exitAttributeValue,
      directiveContainerAttributes: exitAttributes,
      directiveContainerContent: exitContainerContent,
      directiveContainerFence: exitContainerFence,
      directiveContainerLabel: exitLabel,
      directiveContainerName: exitName,

      directiveLeaf: exit,
      directiveLeafAttributeClassValue: exitAttributeClassValue,
      directiveLeafAttributeIdValue: exitAttributeIdValue,
      directiveLeafAttributeName: exitAttributeName,
      directiveLeafAttributeValue: exitAttributeValue,
      directiveLeafAttributes: exitAttributes,
      directiveLeafLabel: exitLabel,
      directiveLeafName: exitName,

      directiveText: exit,
      directiveTextAttributeClassValue: exitAttributeClassValue,
      directiveTextAttributeIdValue: exitAttributeIdValue,
      directiveTextAttributeName: exitAttributeName,
      directiveTextAttributeValue: exitAttributeValue,
      directiveTextAttributes: exitAttributes,
      directiveTextLabel: exitLabel,
      directiveTextName: exitName
    }
  }

  /**
   * @this {CompileContext}
   * @param {DirectiveType} type
   */
  function enter(type) {
    /** @type {Directive[]} */
    // @ts-expect-error
    let stack = this.getData('directiveStack')
    if (!stack) this.setData('directiveStack', (stack = []))
    stack.push({type, name: ''})
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitName(token) {
    /** @type {Directive[]} */
    // @ts-expect-error
    const stack = this.getData('directiveStack')
    stack[stack.length - 1].name = this.sliceSerialize(token)
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function enterLabel() {
    this.buffer()
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitLabel() {
    const data = this.resume()
    /** @type {Directive[]} */
    // @ts-expect-error
    const stack = this.getData('directiveStack')
    stack[stack.length - 1].label = data
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function enterAttributes() {
    this.buffer()
    this.setData('directiveAttributes', [])
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitAttributeIdValue(token) {
    /** @type {Array<Attribute>} */
    // @ts-expect-error
    const attributes = this.getData('directiveAttributes')
    attributes.push([
      'id',
      parseEntities(this.sliceSerialize(token), {
        attribute: true
      })
    ])
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitAttributeClassValue(token) {
    /** @type {Array<Attribute>} */
    // @ts-expect-error
    const attributes = this.getData('directiveAttributes')

    attributes.push([
      'class',
      parseEntities(this.sliceSerialize(token), {
        attribute: true
      })
    ])
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitAttributeName(token) {
    // Attribute names in CommonMark are significantly limited, so character
    // references can’t exist.
    /** @type {Array<Attribute>} */
    // @ts-expect-error
    const attributes = this.getData('directiveAttributes')

    attributes.push([this.sliceSerialize(token), ''])
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitAttributeValue(token) {
    /** @type {Array<Attribute>} */
    // @ts-expect-error
    const attributes = this.getData('directiveAttributes')
    attributes[attributes.length - 1][1] = parseEntities(
      this.sliceSerialize(token),
      {attribute: true}
    )
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitAttributes() {
    /** @type {Directive[]} */
    // @ts-expect-error
    const stack = this.getData('directiveStack')
    /** @type {Array<Attribute>} */
    // @ts-expect-error
    const attributes = this.getData('directiveAttributes')
    /** @type {Directive['attributes']} */
    const cleaned = {}
    /** @type {Attribute} */
    let attribute
    let index = -1

    while (++index < attributes.length) {
      attribute = attributes[index]

      if (attribute[0] === 'class' && cleaned.class) {
        cleaned.class += ' ' + attribute[1]
      } else {
        cleaned[attribute[0]] = attribute[1]
      }
    }

    this.resume()
    this.setData('directiveAttributes')
    stack[stack.length - 1].attributes = cleaned
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitContainerContent() {
    const data = this.resume()
    /** @type {Directive[]} */
    // @ts-expect-error
    const stack = this.getData('directiveStack')
    stack[stack.length - 1].content = data
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exitContainerFence() {
    /** @type {Directive[]} */
    // @ts-expect-error
    const stack = this.getData('directiveStack')
    const directive = stack[stack.length - 1]
    if (!directive._fenceCount) directive._fenceCount = 0
    directive._fenceCount++
    if (directive._fenceCount === 1) this.setData('slurpOneLineEnding', true)
  }

  /**
   * @this {CompileContext}
   * @type {_Handle}
   */
  function exit() {
    /** @type {Directive} */
    // @ts-expect-error
    const directive = this.getData('directiveStack').pop()
    /** @type {boolean|undefined} */
    let found
    /** @type {boolean|void} */
    let result

    assert(directive.name, 'expected `name`')

    if (own.call(options_, directive.name)) {
      result = options_[directive.name].call(this, directive)
      found = result !== false
    }

    if (!found && own.call(options_, '*')) {
      result = options_['*'].call(this, directive)
      found = result !== false
    }

    if (!found && directive.type !== 'textDirective') {
      this.setData('slurpOneLineEnding', true)
    }
  }
}
