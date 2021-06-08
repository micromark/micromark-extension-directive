'use strict'

module.exports = directive

var directiveText = require('./tokenize-directive-text.js')
var directiveLeaf = require('./tokenize-directive-leaf.js')
var directiveContainer = require('./tokenize-directive-container.js')

function directive() {
  return {
    text: {58: directiveText},
    flow: {58: [directiveContainer, directiveLeaf]}
  }
}
