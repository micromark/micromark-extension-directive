import {directiveContainer} from './directive-container.js'
import {directiveLeaf} from './directive-leaf.js'
import {directiveText} from './directive-text.js'

export function directive() {
  return {
    text: {58: directiveText},
    flow: {58: [directiveContainer, directiveLeaf]}
  }
}
