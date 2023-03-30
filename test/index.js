/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 * @typedef {import('../dev/index.js').HtmlOptions} HtmlOptions
 * @typedef {import('../dev/index.js').Handle} Handle
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {micromark} from 'micromark'
import {htmlVoidElements} from 'html-void-elements'
import {directive as syntax, directiveHtml as html} from '../dev/index.js'

const own = {}.hasOwnProperty

test('micromark-extension-directive (syntax, text)', () => {
  assert.equal(
    micromark('\\:a', options()),
    '<p>:a</p>',
    'should support an escaped colon which would otherwise be a directive'
  )

  assert.equal(
    micromark('\\::a', options()),
    '<p>:</p>',
    'should support a directive after an escaped colon'
  )

  assert.equal(
    micromark('a ::b', options()),
    '<p>a ::b</p>',
    'should not support a directive after a colon'
  )

  assert.equal(
    micromark(':', options()),
    '<p>:</p>',
    'should not support a colon not followed by an alpha'
  )

  assert.equal(
    micromark(':a', options()),
    '<p></p>',
    'should support a colon followed by an alpha'
  )

  assert.equal(
    micromark(':9', options()),
    '<p>:9</p>',
    'should not support a colon followed by a digit'
  )

  assert.equal(
    micromark(':-', options()),
    '<p>:-</p>',
    'should not support a colon followed by a dash'
  )

  assert.equal(
    micromark(':_', options()),
    '<p>:_</p>',
    'should not support a colon followed by an underscore'
  )

  assert.equal(
    micromark(':a9', options()),
    '<p></p>',
    'should support a digit in a name'
  )

  assert.equal(
    micromark(':a-b', options()),
    '<p></p>',
    'should support a dash in a name'
  )

  assert.equal(
    micromark(':a-', options()),
    '<p>:a-</p>',
    'should *not* support a dash at the end of a name'
  )

  assert.equal(
    micromark(':a_b', options()),
    '<p></p>',
    'should support an underscore in a name'
  )

  assert.equal(
    micromark(':a_', options()),
    '<p>:a_</p>',
    'should *not* support an underscore at the end of a name'
  )

  assert.equal(
    micromark(':a:', options()),
    '<p>:a:</p>',
    'should *not* support a colon right after a name'
  )

  assert.equal(
    micromark(':+1:', options()),
    '<p>:+1:</p>',
    'should not interfere w/ gemoji (1)'
  )

  assert.equal(
    micromark(':heart:', options()),
    '<p>:heart:</p>',
    'should not interfere w/ gemoji (2)'
  )

  assert.equal(
    micromark(':call_me_hand:', options()),
    '<p>:call_me_hand:</p>',
    'should not interfere w/ gemoji (3)'
  )

  assert.equal(
    micromark('_:directive_', options()),
    '<p><em>:directive</em></p>',
    'should not interfere w/ emphasis (`_`)'
  )

  assert.equal(
    micromark(':a[', options()),
    '<p>[</p>',
    'should support a name followed by an unclosed `[`'
  )

  assert.equal(
    micromark(':a{', options()),
    '<p>{</p>',
    'should support a name followed by an unclosed `{`'
  )

  assert.equal(
    micromark(':a[b', options()),
    '<p>[b</p>',
    'should support a name followed by an unclosed `[` w/ content'
  )

  assert.equal(
    micromark(':a{b', options()),
    '<p>{b</p>',
    'should support a name followed by an unclosed `{` w/ content'
  )

  assert.equal(
    micromark(':a[]', options()),
    '<p></p>',
    'should support an empty label'
  )

  assert.equal(
    micromark(':a[ \t]', options()),
    '<p></p>',
    'should support a whitespace only label'
  )

  assert.equal(
    micromark(':a[\n]', options()),
    '<p></p>',
    'should support an eol in an label'
  )

  assert.equal(
    micromark(':a[a b c]asd', options()),
    '<p>asd</p>',
    'should support content in an label'
  )

  assert.equal(
    micromark(':a[a *b* c]asd', options()),
    '<p>asd</p>',
    'should support markdown in an label'
  )

  assert.equal(
    micromark('a :b[c :d[e] f] g', options()),
    '<p>a  g</p>',
    'should support a directive in an label'
  )

  assert.equal(
    micromark(':a[]asd', options()),
    '<p>asd</p>',
    'should support content after a label'
  )

  assert.equal(
    micromark(':a{}', options()),
    '<p></p>',
    'should support empty attributes'
  )

  assert.equal(
    micromark(':a{ \t}', options()),
    '<p></p>',
    'should support whitespace only attributes'
  )

  assert.equal(
    micromark(':a{\n}', options()),
    '<p></p>',
    'should support an eol in attributes'
  )

  assert.equal(
    micromark(':a{a b c}', options()),
    '<p></p>',
    'should support attributes w/o values'
  )

  assert.equal(
    micromark(':a{a=b c=d}', options()),
    '<p></p>',
    'should support attributes w/ unquoted values'
  )

  assert.equal(
    micromark(':a{.a .b}', options()),
    '<p></p>',
    'should support attributes w/ class shortcut'
  )

  assert.equal(
    micromark(':a{.a.b}', options()),
    '<p></p>',
    'should support attributes w/ class shortcut w/o whitespace between'
  )

  assert.equal(
    micromark(':a{#a #b}', options()),
    '<p></p>',
    'should support attributes w/ id shortcut'
  )

  assert.equal(
    micromark(':a{#a#b}', options()),
    '<p></p>',
    'should support attributes w/ id shortcut w/o whitespace between'
  )

  assert.equal(
    micromark(':a{#a.b.c#d e f=g #h.i.j}', options()),
    '<p></p>',
    'should support attributes w/ shortcuts combined w/ other attributes'
  )

  assert.equal(
    micromark(':a{..b}', options()),
    '<p>{..b}</p>',
    'should not support an empty shortcut (`.`)'
  )

  assert.equal(
    micromark(':a{.#b}', options()),
    '<p>{.#b}</p>',
    'should not support an empty shortcut (`#`)'
  )

  assert.equal(
    micromark(':a{.}', options()),
    '<p>{.}</p>',
    'should not support an empty shortcut (`}`)'
  )

  assert.equal(
    micromark(':a{.a=b}', options()),
    '<p>{.a=b}</p>',
    'should not support certain characters in shortcuts (`=`)'
  )

  assert.equal(
    micromark(':a{.a"b}', options()),
    '<p>{.a&quot;b}</p>',
    'should not support certain characters in shortcuts (`"`)'
  )

  assert.equal(
    micromark(':a{.a<b}', options()),
    '<p>{.a&lt;b}</p>',
    'should not support certain characters in shortcuts (`<`)'
  )

  assert.equal(
    micromark(':a{.a💚b}', options()),
    '<p></p>',
    'should support most characters in shortcuts'
  )

  assert.equal(
    micromark(':a{_}', options()),
    '<p></p>',
    'should support an underscore in attribute names'
  )

  assert.equal(
    micromark(':a{xml:lang}', options()),
    '<p></p>',
    'should support a colon in attribute names'
  )

  assert.equal(
    micromark(':a{a="b" c="d e f"}', options()),
    '<p></p>',
    'should support double quoted attributes'
  )

  assert.equal(
    micromark(":a{a='b' c='d e f'}", options()),
    '<p></p>',
    'should support single quoted attributes'
  )

  assert.equal(
    micromark(':a{a = b c\t=\t\'d\' f  =\r"g"}', options()),
    '<p></p>',
    'should support whitespace around initializers'
  )

  assert.equal(
    micromark(':a{b==}', options()),
    '<p>{b==}</p>',
    'should not support `=` to start an unquoted attribute value'
  )

  assert.equal(
    micromark(':a{b=}', options()),
    '<p>{b=}</p>',
    'should not support a missing attribute value after `=`'
  )

  assert.equal(
    micromark(":a{b=c'}", options()),
    "<p>{b=c'}</p>",
    'should not support an apostrophe in an unquoted attribute value'
  )

  assert.equal(
    micromark(':a{b=c`}', options()),
    '<p>{b=c`}</p>',
    'should not support a grave accent in an unquoted attribute value'
  )

  assert.equal(
    micromark(':a{b=a💚b}', options()),
    '<p></p>',
    'should support most other characters in unquoted attribute values'
  )

  assert.equal(
    micromark(':a{b="c', options()),
    '<p>{b=&quot;c</p>',
    'should not support an EOF in a quoted attribute value'
  )

  assert.equal(
    micromark(':a{b="a💚b"}', options()),
    '<p></p>',
    'should support most other characters in quoted attribute values'
  )

  assert.equal(
    micromark(':a{b="\nc\r  d"}', options()),
    '<p></p>',
    'should support EOLs in quoted attribute values'
  )

  assert.equal(
    micromark(':a{b="c"', options()),
    '<p>{b=&quot;c&quot;</p>',
    'should not support an EOF after a quoted attribute value'
  )
})

test('micromark-extension-directive (syntax, leaf)', () => {
  assert.equal(micromark('::b', options()), '', 'should support a directive')

  assert.equal(
    micromark(':', options()),
    '<p>:</p>',
    'should not support one colon'
  )

  assert.equal(
    micromark('::', options()),
    '<p>::</p>',
    'should not support two colons not followed by an alpha'
  )

  assert.equal(
    micromark('::a', options()),
    '',
    'should support two colons followed by an alpha'
  )

  assert.equal(
    micromark('::9', options()),
    '<p>::9</p>',
    'should not support two colons followed by a digit'
  )

  assert.equal(
    micromark('::-', options()),
    '<p>::-</p>',
    'should not support two colons followed by a dash'
  )

  assert.equal(
    micromark('::a9', options()),
    '',
    'should support a digit in a name'
  )

  assert.equal(
    micromark('::a-b', options()),
    '',
    'should support a dash in a name'
  )

  assert.equal(
    micromark('::a[', options()),
    '<p>::a[</p>',
    'should not support a name followed by an unclosed `[`'
  )

  assert.equal(
    micromark('::a{', options()),
    '<p>::a{</p>',
    'should not support a name followed by an unclosed `{`'
  )

  assert.equal(
    micromark('::a[b', options()),
    '<p>::a[b</p>',
    'should not support a name followed by an unclosed `[` w/ content'
  )

  assert.equal(
    micromark('::a{b', options()),
    '<p>::a{b</p>',
    'should not support a name followed by an unclosed `{` w/ content'
  )

  assert.equal(
    micromark('::a[]', options()),
    '',
    'should support an empty label'
  )

  assert.equal(
    micromark('::a[ \t]', options()),
    '',
    'should support a whitespace only label'
  )

  assert.equal(
    micromark('::a[\n]', options()),
    '<p>::a[\n]</p>',
    'should not support an eol in an label'
  )

  assert.equal(
    micromark('::a[a b c]', options()),
    '',
    'should support content in an label'
  )

  assert.equal(
    micromark('::a[a *b* c]', options()),
    '',
    'should support markdown in an label'
  )

  assert.equal(
    micromark('::a[]asd', options()),
    '<p>::a[]asd</p>',
    'should not support content after a label'
  )

  assert.equal(
    micromark('::a{}', options()),
    '',
    'should support empty attributes'
  )

  assert.equal(
    micromark('::a{ \t}', options()),
    '',
    'should support whitespace only attributes'
  )

  assert.equal(
    micromark('::a{\n}', options()),
    '<p>::a{\n}</p>',
    'should not support an eol in attributes'
  )

  assert.equal(
    micromark('::a{a b c}', options()),
    '',
    'should support attributes w/o values'
  )

  assert.equal(
    micromark('::a{a=b c=d}', options()),
    '',
    'should support attributes w/ unquoted values'
  )

  assert.equal(
    micromark('::a{.a .b}', options()),
    '',
    'should support attributes w/ class shortcut'
  )

  assert.equal(
    micromark('::a{#a #b}', options()),
    '',
    'should support attributes w/ id shortcut'
  )

  assert.equal(
    micromark('::a{.a💚b}', options()),
    '',
    'should support most characters in shortcuts'
  )

  assert.equal(
    micromark('::a{a="b" c="d e f"}', options()),
    '',
    'should support double quoted attributes'
  )

  assert.equal(
    micromark("::a{a='b' c='d e f'}", options()),
    '',
    'should support single quoted attributes'
  )

  assert.equal(
    micromark("::a{a = b c\t=\t'd'}", options()),
    '',
    'should support whitespace around initializers'
  )

  assert.equal(
    micromark('::a{f  =\rg}', options()),
    '<p>::a{f  =\rg}</p>',
    'should not support EOLs around initializers'
  )

  assert.equal(
    micromark('::a{b==}', options()),
    '<p>::a{b==}</p>',
    'should not support `=` to start an unquoted attribute value'
  )

  assert.equal(
    micromark('::a{b=a💚b}', options()),
    '',
    'should support most other characters in unquoted attribute values'
  )

  assert.equal(
    micromark('::a{b="c', options()),
    '<p>::a{b=&quot;c</p>',
    'should not support an EOF in a quoted attribute value'
  )

  assert.equal(
    micromark('::a{b="a💚b"}', options()),
    '',
    'should support most other characters in quoted attribute values'
  )

  assert.equal(
    micromark('::a{b="\nc\r  d"}', options()),
    '<p>::a{b=&quot;\nc\rd&quot;}</p>',
    'should not support EOLs in quoted attribute values'
  )

  assert.equal(
    micromark('::a{b="c"', options()),
    '<p>::a{b=&quot;c&quot;</p>',
    'should not support an EOF after a quoted attribute value'
  )

  assert.equal(
    micromark('::a{b=c} \t ', options()),
    '',
    'should support whitespace after directives'
  )

  assert.equal(
    micromark('::a{b=c}\n>a', options()),
    '<blockquote>\n<p>a</p>\n</blockquote>',
    'should support a block quote after a leaf'
  )

  assert.equal(
    micromark('::a{b=c}\n```js\na', options()),
    '<pre><code class="language-js">a\n</code></pre>\n',
    'should support code (fenced) after a leaf'
  )

  assert.equal(
    micromark('::a{b=c}\n    a', options()),
    '<pre><code>a\n</code></pre>',
    'should support code (indented) after a leaf'
  )

  assert.equal(
    micromark('::a{b=c}\n[a]: b', options()),
    '',
    'should support a definition after a leaf'
  )

  assert.equal(
    micromark('::a{b=c}\n# a', options()),
    '<h1>a</h1>',
    'should support a heading (atx) after a leaf'
  )

  assert.equal(
    micromark('::a{b=c}\na\n=', options()),
    '<h1>a</h1>',
    'should support a heading (setext) after a leaf'
  )

  assert.equal(
    micromark('::a{b=c}\n<!-->', options()),
    '<!-->',
    'should support html after a leaf'
  )

  assert.equal(
    micromark('::a{b=c}\n* a', options()),
    '<ul>\n<li>a</li>\n</ul>',
    'should support a list after a leaf'
  )

  assert.equal(
    micromark('::a{b=c}\na', options()),
    '<p>a</p>',
    'should support a paragraph after a leaf'
  )

  assert.equal(
    micromark('::a{b=c}\n***', options()),
    '<hr />',
    'should support a thematic break after a leaf'
  )

  assert.equal(
    micromark('>a\n::a{b=c}', options()),
    '<blockquote>\n<p>a</p>\n</blockquote>\n',
    'should support a block quote before a leaf'
  )

  assert.equal(
    micromark('```js\na\n```\n::a{b=c}', options()),
    '<pre><code class="language-js">a\n</code></pre>\n',
    'should support code (fenced) before a leaf'
  )

  assert.equal(
    micromark('    a\n::a{b=c}', options()),
    '<pre><code>a\n</code></pre>\n',
    'should support code (indented) before a leaf'
  )

  assert.equal(
    micromark('[a]: b\n::a{b=c}', options()),
    '',
    'should support a definition before a leaf'
  )

  assert.equal(
    micromark('# a\n::a{b=c}', options()),
    '<h1>a</h1>\n',
    'should support a heading (atx) before a leaf'
  )

  assert.equal(
    micromark('a\n=\n::a{b=c}', options()),
    '<h1>a</h1>\n',
    'should support a heading (setext) before a leaf'
  )

  assert.equal(
    micromark('<!-->\n::a{b=c}', options()),
    '<!-->\n',
    'should support html before a leaf'
  )

  assert.equal(
    micromark('* a\n::a{b=c}', options()),
    '<ul>\n<li>a</li>\n</ul>\n',
    'should support a list before a leaf'
  )

  assert.equal(
    micromark('a\n::a{b=c}', options()),
    '<p>a</p>\n',
    'should support a paragraph before a leaf'
  )

  assert.equal(
    micromark('***\n::a{b=c}', options()),
    '<hr />\n',
    'should support a thematic break before a leaf'
  )

  assert.equal(
    micromark('> ::a\nb', options({'*': h})),
    '<blockquote><a></a>\n</blockquote>\n<p>b</p>',
    'should not support lazyness (1)'
  )

  assert.equal(
    micromark('> a\n::b', options({'*': h})),
    '<blockquote>\n<p>a</p>\n</blockquote>\n<b></b>',
    'should not support lazyness (2)'
  )
})

test('micromark-extension-directive (syntax, container)', () => {
  assert.equal(micromark(':::b', options()), '', 'should support a directive')

  assert.equal(
    micromark(':', options()),
    '<p>:</p>',
    'should not support one colon'
  )

  assert.equal(
    micromark('::', options()),
    '<p>::</p>',
    'should not support two colons not followed by an alpha'
  )

  assert.equal(
    micromark(':::', options()),
    '<p>:::</p>',
    'should not support three colons not followed by an alpha'
  )

  assert.equal(
    micromark(':::a', options()),
    '',
    'should support three colons followed by an alpha'
  )

  assert.equal(
    micromark(':::9', options()),
    '<p>:::9</p>',
    'should not support three colons followed by a digit'
  )

  assert.equal(
    micromark(':::-', options()),
    '<p>:::-</p>',
    'should not support three colons followed by a dash'
  )

  assert.equal(
    micromark(':::a9', options()),
    '',
    'should support a digit in a name'
  )

  assert.equal(
    micromark(':::a-b', options()),
    '',
    'should support a dash in a name'
  )

  assert.equal(
    micromark(':::a[', options()),
    '<p>:::a[</p>',
    'should not support a name followed by an unclosed `[`'
  )

  assert.equal(
    micromark(':::a{', options()),
    '<p>:::a{</p>',
    'should not support a name followed by an unclosed `{`'
  )

  assert.equal(
    micromark(':::a[b', options()),
    '<p>:::a[b</p>',
    'should not support a name followed by an unclosed `[` w/ content'
  )

  assert.equal(
    micromark(':::a{b', options()),
    '<p>:::a{b</p>',
    'should not support a name followed by an unclosed `{` w/ content'
  )

  assert.equal(
    micromark(':::a[]', options()),
    '',
    'should support an empty label'
  )

  assert.equal(
    micromark(':::a[ \t]', options()),
    '',
    'should support a whitespace only label'
  )

  assert.equal(
    micromark(':::a[\n]', options()),
    '<p>:::a[\n]</p>',
    'should not support an eol in an label'
  )

  assert.equal(
    micromark(':::a[a b c]', options()),
    '',
    'should support content in an label'
  )

  assert.equal(
    micromark(':::a[a *b* c]', options()),
    '',
    'should support markdown in an label'
  )

  assert.equal(
    micromark(':::a[]asd', options()),
    '<p>:::a[]asd</p>',
    'should not support content after a label'
  )

  assert.equal(
    micromark(':::a{}', options()),
    '',
    'should support empty attributes'
  )

  assert.equal(
    micromark(':::a{ \t}', options()),
    '',
    'should support whitespace only attributes'
  )

  assert.equal(
    micromark(':::a{\n}', options()),
    '<p>:::a{\n}</p>',
    'should not support an eol in attributes'
  )

  assert.equal(
    micromark(':::a{a b c}', options()),
    '',
    'should support attributes'
  )

  assert.equal(
    micromark(':::a{f  =\rg}', options()),
    '<p>:::a{f  =\rg}</p>',
    'should not support EOLs around initializers'
  )

  assert.equal(
    micromark(':::a{b="c', options()),
    '<p>:::a{b=&quot;c</p>',
    'should not support an EOF in a quoted attribute value'
  )

  assert.equal(
    micromark(':::a{b="\nc\r  d"}', options()),
    '<p>:::a{b=&quot;\nc\rd&quot;}</p>',
    'should not support EOLs in quoted attribute values'
  )

  assert.equal(
    micromark(':::a{b="c"', options()),
    '<p>:::a{b=&quot;c&quot;</p>',
    'should not support an EOF after a quoted attribute value'
  )

  assert.equal(
    micromark(':::a{b=c} \t ', options()),
    '',
    'should support whitespace after directives'
  )

  assert.equal(
    micromark(':::a\n', options()),
    '',
    'should support no closing fence'
  )

  assert.equal(
    micromark(':::a\n:::', options()),
    '',
    'should support an immediate closing fence'
  )

  assert.equal(
    micromark(':::a\n:::\nb', options()),
    '<p>b</p>',
    'should support content after a closing fence'
  )

  assert.equal(
    micromark(':::a\n::\nb', options()),
    '',
    'should not close w/ a “closing” fence of two colons'
  )

  assert.equal(
    micromark(':::a\n::::\nb', options()),
    '<p>b</p>',
    'should close w/ a closing fence of more colons'
  )

  assert.equal(
    micromark('::::a\n::::\nb', options()),
    '<p>b</p>',
    'should support more opening colons'
  )

  assert.equal(
    micromark(':::::a\n::::\nb', options()),
    '',
    'should not close w/ a “closing” fence of less colons than the opening'
  )

  assert.equal(
    micromark(':::a\n::: \t\nc', options()),
    '<p>c</p>',
    'should close w/ a closing fence followed by white space'
  )

  assert.equal(
    micromark(':::a\n::: b\nc', options()),
    '',
    'should not close w/ a “closing” fence followed by other characters'
  )

  assert.equal(
    micromark(':::a\n  :::\nc', options()),
    '<p>c</p>',
    'should close w/ an indented closing fence'
  )

  assert.equal(
    micromark(':::a\n\t:::\nc', options()),
    '',
    'should not close w/ when the “closing” fence is indented at a tab size'
  )

  assert.equal(
    micromark(':::a\n     :::\nc', options()),
    '',
    'should not close w/ when the “closing” fence is indented more than a tab size'
  )

  assert.equal(
    micromark(':::a\n\n  \n\ta', options()),
    '',
    'should support blank lines in content'
  )

  assert.equal(
    micromark(':::a\n\ta\n', options()),
    '',
    'should support an EOL EOF'
  )

  assert.equal(
    micromark('  :::a\n  b\n  :::\nc', options()),
    '<p>c</p>',
    'should support an indented directive'
  )

  assert.equal(
    micromark('  :::a\n\t:::\nc', options()),
    '',
    'should still not close an indented directive when the “closing” fence is indented a tab size'
  )

  assert.equal(
    micromark(':::a\n:::\n>a', options()),
    '<blockquote>\n<p>a</p>\n</blockquote>',
    'should support a block quote after a container'
  )

  assert.equal(
    micromark(':::a\n:::\n```js\na', options()),
    '<pre><code class="language-js">a\n</code></pre>\n',
    'should support code (fenced) after a container'
  )

  assert.equal(
    micromark(':::a\n:::\n    a', options()),
    '<pre><code>a\n</code></pre>',
    'should support code (indented) after a container'
  )

  assert.equal(
    micromark(':::a\n:::\n[a]: b', options()),
    '',
    'should support a definition after a container'
  )

  assert.equal(
    micromark(':::a\n:::\n# a', options()),
    '<h1>a</h1>',
    'should support a heading (atx) after a container'
  )

  assert.equal(
    micromark(':::a\n:::\na\n=', options()),
    '<h1>a</h1>',
    'should support a heading (setext) after a container'
  )

  assert.equal(
    micromark(':::a\n:::\n<!-->', options()),
    '<!-->',
    'should support html after a container'
  )

  assert.equal(
    micromark(':::a\n:::\n* a', options()),
    '<ul>\n<li>a</li>\n</ul>',
    'should support a list after a container'
  )

  assert.equal(
    micromark(':::a\n:::\na', options()),
    '<p>a</p>',
    'should support a paragraph after a container'
  )

  assert.equal(
    micromark(':::a\n:::\n***', options()),
    '<hr />',
    'should support a thematic break after a container'
  )

  assert.equal(
    micromark('>a\n:::a\nb', options()),
    '<blockquote>\n<p>a</p>\n</blockquote>\n',
    'should support a block quote before a container'
  )

  assert.equal(
    micromark('```js\na\n```\n:::a\nb', options()),
    '<pre><code class="language-js">a\n</code></pre>\n',
    'should support code (fenced) before a container'
  )

  assert.equal(
    micromark('    a\n:::a\nb', options()),
    '<pre><code>a\n</code></pre>\n',
    'should support code (indented) before a container'
  )

  assert.equal(
    micromark('[a]: b\n:::a\nb', options()),
    '',
    'should support a definition before a container'
  )

  assert.equal(
    micromark('# a\n:::a\nb', options()),
    '<h1>a</h1>\n',
    'should support a heading (atx) before a container'
  )

  assert.equal(
    micromark('a\n=\n:::a\nb', options()),
    '<h1>a</h1>\n',
    'should support a heading (setext) before a container'
  )

  assert.equal(
    micromark('<!-->\n:::a\nb', options()),
    '<!-->\n',
    'should support html before a container'
  )

  assert.equal(
    micromark('* a\n:::a\nb', options()),
    '<ul>\n<li>a</li>\n</ul>\n',
    'should support a list before a container'
  )

  assert.equal(
    micromark('a\n:::a\nb', options()),
    '<p>a</p>\n',
    'should support a paragraph before a container'
  )

  assert.equal(
    micromark('***\n:::a\nb', options()),
    '<hr />\n',
    'should support a thematic break before a container'
  )

  assert.equal(
    micromark(' :::x\n ', options({'*': h})),
    '<x></x>',
    'should support prefixed containers (1)'
  )

  assert.equal(
    micromark(' :::x\n - a', options({'*': h})),
    '<x>\n<ul>\n<li>a</li>\n</ul>\n</x>',
    'should support prefixed containers (2)'
  )

  assert.equal(
    micromark(' :::x\n - a\n > b', options({'*': h})),
    '<x>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</x>',
    'should support prefixed containers (3)'
  )

  assert.equal(
    micromark(' :::x\n - a\n > b\n :::', options({'*': h})),
    '<x>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</x>',
    'should support prefixed containers (4)'
  )

  assert.equal(
    micromark('> :::a\nb', options({'*': h})),
    '<blockquote><a></a>\n</blockquote>\n<p>b</p>',
    'should not support lazyness (1)'
  )

  assert.equal(
    micromark('> :::a\n> b\nc', options({'*': h})),
    '<blockquote><a>\n<p>b</p>\n</a>\n</blockquote>\n<p>c</p>',
    'should not support lazyness (2)'
  )

  assert.equal(
    micromark('> a\n:::b', options({'*': h})),
    '<blockquote>\n<p>a</p>\n</blockquote>\n<b></b>',
    'should not support lazyness (3)'
  )

  assert.equal(
    micromark('> :::a\n:::', options({'*': h})),
    '<blockquote><a></a>\n</blockquote>\n<p>:::</p>',
    'should not support lazyness (4)'
  )
})

test('micromark-extension-directive (compile)', () => {
  assert.equal(
    micromark(
      [
        ':abbr',
        ':abbr[HTML]',
        ':abbr{title="HyperText Markup Language"}',
        ':abbr[HTML]{title="HyperText Markup Language"}'
      ].join('\n\n'),
      options({abbr})
    ),
    [
      '<p><abbr></abbr></p>',
      '<p><abbr>HTML</abbr></p>',
      '<p><abbr title="HyperText Markup Language"></abbr></p>',
      '<p><abbr title="HyperText Markup Language">HTML</abbr></p>'
    ].join('\n'),
    'should support a directives (abbr)'
  )

  assert.equal(
    micromark(
      [
        'Text:',
        ':youtube',
        ':youtube[Cat in a box a]',
        ':youtube{v=1}',
        ':youtube[Cat in a box b]{v=2}',
        'Leaf:',
        '::youtube',
        '::youtube[Cat in a box c]',
        '::youtube{v=3}',
        '::youtube[Cat in a box d]{v=4}',
        'Container:',
        ':::youtube\nw\n:::',
        ':::youtube[Cat in a box e]\nx\n:::',
        ':::youtube{v=5}\ny\n:::',
        ':::youtube[Cat in a box f]{v=6}\nz\n:::'
      ].join('\n\n'),
      options({youtube})
    ),
    [
      '<p>Text:</p>',
      '<p></p>',
      '<p></p>',
      '<p><iframe src="https://www.youtube.com/embed/1" allowfullscreen></iframe></p>',
      '<p><iframe src="https://www.youtube.com/embed/2" allowfullscreen title="Cat in a box b"></iframe></p>',
      '<p>Leaf:</p>',
      '<iframe src="https://www.youtube.com/embed/3" allowfullscreen></iframe>',
      '<iframe src="https://www.youtube.com/embed/4" allowfullscreen title="Cat in a box d"></iframe>',
      '<p>Container:</p>',
      '<iframe src="https://www.youtube.com/embed/5" allowfullscreen>',
      '<p>y</p>',
      '</iframe>',
      '<iframe src="https://www.youtube.com/embed/6" allowfullscreen title="Cat in a box f">',
      '<p>z</p>',
      '</iframe>'
    ].join('\n'),
    'should support directives (youtube)'
  )

  assert.equal(
    micromark(':youtube[Cat in a box]\n:br', options({youtube, '*': h})),
    '<p><youtube>Cat in a box</youtube>\n<br></p>',
    'should support fall through directives (`*`)'
  )

  assert.equal(
    micromark(':a[:img{src="x" alt=y}]{href="z"}', options({'*': h})),
    '<p><a href="z"><img src="x" alt="y"></a></p>',
    'should support fall through directives (`*`)'
  )
})

test('content', () => {
  assert.equal(
    micromark(':abbr[x\\&y&amp;z]', options({abbr})),
    '<p><abbr>x&amp;y&amp;z</abbr></p>',
    'should support character escapes and character references in label'
  )

  assert.equal(
    micromark(':abbr[x\\[y\\]z]', options({abbr})),
    '<p><abbr>x[y]z</abbr></p>',
    'should support escaped brackets in a label'
  )

  assert.equal(
    micromark(':abbr[x[y]z]', options({abbr})),
    '<p><abbr>x[y]z</abbr></p>',
    'should support balanced brackets in a label'
  )

  assert.equal(
    micromark(
      ':abbr[1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]',
      options({abbr})
    ),
    '<p><abbr>1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]</abbr></p>',
    'should support balanced brackets in a label, 32 levels deep'
  )

  assert.equal(
    micromark(
      ':abbr[1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[33[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]',
      options({abbr})
    ),
    '<p><abbr></abbr>[1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[33[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]</p>',
    'should *not* support balanced brackets in a label, 33 levels deep'
  )

  assert.equal(
    micromark(':abbr[a\nb\rc]', options({abbr})),
    '<p><abbr>a\nb\rc</abbr></p>',
    'should support EOLs in a label'
  )

  assert.equal(
    micromark(':abbr[\na\r]', options({abbr})),
    '<p><abbr>\na\r</abbr></p>',
    'should support EOLs at the edges of a label (1)'
  )

  assert.equal(
    micromark(':abbr[\n]', options({abbr})),
    '<p><abbr>\n</abbr></p>',
    'should support EOLs at the edges of a label (2)'
  )

  assert.equal(
    micromark(':abbr[a\n:abbr[b]\nc]', options({abbr})),
    '<p><abbr>a\n<abbr>b</abbr>\nc</abbr></p>',
    'should support EOLs around nested directives'
  )

  assert.equal(
    micromark(':abbr[:abbr[\n]]', options({abbr})),
    '<p><abbr><abbr>\n</abbr></abbr></p>',
    'should support EOLs inside nested directives (1)'
  )

  assert.equal(
    micromark(':abbr[:abbr[a\nb]]', options({abbr})),
    '<p><abbr><abbr>a\nb</abbr></abbr></p>',
    'should support EOLs inside nested directives (2)'
  )

  assert.equal(
    micromark(':abbr[:abbr[\nb\n]]', options({abbr})),
    '<p><abbr><abbr>\nb\n</abbr></abbr></p>',
    'should support EOLs inside nested directives (3)'
  )

  assert.equal(
    micromark(':abbr[:abbr[\\\n]]', options({abbr})),
    '<p><abbr><abbr><br />\n</abbr></abbr></p>',
    'should support EOLs inside nested directives (4)'
  )

  assert.equal(
    micromark(':abbr[a *b* **c** d]', options({abbr})),
    '<p><abbr>a <em>b</em> <strong>c</strong> d</abbr></p>',
    'should support markdown in a label'
  )

  assert.equal(
    micromark(':abbr{title=a&apos;b}', options({abbr})),
    '<p><abbr title="a\'b"></abbr></p>',
    'should support character references in unquoted attribute values'
  )

  assert.equal(
    micromark(':abbr{title="a&apos;b"}', options({abbr})),
    '<p><abbr title="a\'b"></abbr></p>',
    'should support character references in double attribute values'
  )

  assert.equal(
    micromark(":abbr{title='a&apos;b'}", options({abbr})),
    '<p><abbr title="a\'b"></abbr></p>',
    'should support character references in single attribute values'
  )

  assert.equal(
    micromark(':abbr{title="a&somethingelse;b"}', options({abbr})),
    '<p><abbr title="a&amp;somethingelse;b"></abbr></p>',
    'should support unknown character references in attribute values'
  )

  assert.equal(
    micromark(':a{href=&param}', options({'*': h})),
    '<p><a href="&amp;param"></a></p>',
    'should not support non-terminated character references in unquoted attribute values'
  )

  assert.equal(
    micromark(':a{href="&param"}', options({'*': h})),
    '<p><a href="&amp;param"></a></p>',
    'should not support non-terminated character references in double quoted attribute values'
  )

  assert.equal(
    micromark(":a{href='&param'}", options({'*': h})),
    '<p><a href="&amp;param"></a></p>',
    'should not support non-terminated character references in single quoted attribute values'
  )

  assert.equal(
    micromark(':span{a\nb}', options({'*': h})),
    '<p><span a="" b=""></span></p>',
    'should support EOLs between attributes'
  )

  assert.equal(
    micromark(':span{\na\n}', options({'*': h})),
    '<p><span a=""></span></p>',
    'should support EOLs at the edges of attributes'
  )

  assert.equal(
    micromark(':span{a\r= b}', options({'*': h})),
    '<p><span a="b"></span></p>',
    'should support EOLs before initializer'
  )

  assert.equal(
    micromark(':span{a=\r\nb}', options({'*': h})),
    '<p><span a="b"></span></p>',
    'should support EOLs after initializer'
  )

  assert.equal(
    micromark(':span{a=b\nc}', options({'*': h})),
    '<p><span a="b" c=""></span></p>',
    'should support EOLs between an unquoted attribute value and a next attribute name'
  )

  assert.equal(
    micromark(':span{a="b\nc"}', options({'*': h})),
    '<p><span a="b\nc"></span></p>',
    'should support EOLs in a double quoted attribute value'
  )

  assert.equal(
    micromark(":span{a='b\nc'}", options({'*': h})),
    '<p><span a="b\nc"></span></p>',
    'should support EOLs in a single quoted attribute value'
  )

  assert.equal(
    micromark(':span{#a#b}', options({'*': h})),
    '<p><span id="b"></span></p>',
    'should support `id` shortcuts'
  )

  assert.equal(
    micromark(':span{id=a id="b" #c#d}', options({'*': h})),
    '<p><span id="d"></span></p>',
    'should support `id` shortcuts after `id` attributes'
  )

  assert.equal(
    micromark(':span{.a.b}', options({'*': h})),
    '<p><span class="a b"></span></p>',
    'should support `class` shortcuts'
  )

  assert.equal(
    micromark(':span{class=a class="b c" .d.e}', options({'*': h})),
    '<p><span class="a b c d e"></span></p>',
    'should support `class` shortcuts after `class` attributes'
  )

  assert.equal(
    micromark('::::div{.big}\n:::div{.small}\nText', options({'*': h})),
    '<div class="big">\n<div class="small">\n<p>Text</p>\n</div>\n</div>',
    'should support container directives in container directives'
  )

  assert.equal(
    micromark(':::div{.big}\n::hr{.small}', options({'*': h})),
    '<div class="big">\n<hr class="small">\n</div>',
    'should support leaf directives in container directives'
  )

  assert.equal(
    micromark(':::div{.big}\n:b[Text]', options({'*': h})),
    '<div class="big">\n<p><b>Text</b></p>\n</div>',
    'should support text directives in container directives'
  )

  assert.equal(
    micromark(':::section\n* a\n:::', options({'*': h})),
    '<section>\n<ul>\n<li>a</li>\n</ul>\n</section>',
    'should support lists in container directives'
  )

  assert.equal(
    micromark(':::section[]\n* a\n:::', options({'*': h})),
    '<section>\n<ul>\n<li>a</li>\n</ul>\n</section>',
    'should support lists w/ label brackets in container directives'
  )

  assert.equal(
    micromark(':::section{}\n* a\n:::', options({'*': h})),
    '<section>\n<ul>\n<li>a</li>\n</ul>\n</section>',
    'should support lists w/ attribute braces in container directives'
  )

  assert.equal(
    micromark(':::i\n- +\na', options()),
    '',
    'should support lazy containers in an unclosed container directive'
  )
})

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function abbr(d) {
  if (d.type !== 'textDirective') return false

  this.tag('<abbr')

  if (d.attributes && 'title' in d.attributes) {
    this.tag(' title="' + this.encode(d.attributes.title) + '"')
  }

  this.tag('>')
  this.raw(d.label || '')
  this.tag('</abbr>')
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function youtube(d) {
  const attrs = d.attributes || {}
  const v = attrs.v
  /** @type {string} */
  let prop

  if (!v) return false

  const list = [
    'src="https://www.youtube.com/embed/' + this.encode(v) + '"',
    'allowfullscreen'
  ]

  if (d.label) {
    list.push('title="' + this.encode(d.label) + '"')
  }

  for (prop in attrs) {
    if (prop !== 'v') {
      list.push(this.encode(prop) + '="' + this.encode(attrs[prop]) + '"')
    }
  }

  this.tag('<iframe ' + list.join(' ') + '>')

  if (d.content) {
    this.lineEndingIfNeeded()
    this.raw(d.content)
    this.lineEndingIfNeeded()
  }

  this.tag('</iframe>')
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function h(d) {
  const content = d.content || d.label
  const attrs = d.attributes || {}
  /** @type {Array.<string>} */
  const list = []
  /** @type {string} */
  let prop

  for (prop in attrs) {
    if (own.call(attrs, prop)) {
      list.push(this.encode(prop) + '="' + this.encode(attrs[prop]) + '"')
    }
  }

  this.tag('<' + d.name)
  if (list.length > 0) this.tag(' ' + list.join(' '))
  this.tag('>')

  if (content) {
    if (d.type === 'containerDirective') this.lineEndingIfNeeded()
    this.raw(content)
    if (d.type === 'containerDirective') this.lineEndingIfNeeded()
  }

  if (!htmlVoidElements.includes(d.name)) this.tag('</' + d.name + '>')
}

/**
 * @param {HtmlOptions} [options]
 */
function options(options) {
  return {
    allowDangerousHtml: true,
    extensions: [syntax()],
    htmlExtensions: [html(options)]
  }
}
