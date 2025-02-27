/**
 * @import {Handle, HtmlOptions} from 'micromark-extension-directive'
 * @import {CompileContext} from 'micromark-util-types'
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {micromark} from 'micromark'
import {htmlVoidElements} from 'html-void-elements'
import {directive, directiveHtml} from 'micromark-extension-directive'

const own = {}.hasOwnProperty

test('micromark-extension-directive (core)', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('micromark-extension-directive')).sort(),
      ['directive', 'directiveHtml']
    )
  })
})

test('micromark-extension-directive (syntax, text)', async function (t) {
  await t.test(
    'should support an escaped colon which would otherwise be a directive',
    async function () {
      assert.equal(micromark('\\:a', options()), '<p>:a</p>')
    }
  )

  await t.test(
    'should support a directive after an escaped colon',
    async function () {
      assert.equal(micromark('\\::a', options()), '<p>:</p>')
    }
  )

  await t.test(
    'should not support a directive after a colon',
    async function () {
      assert.equal(micromark('a ::b', options()), '<p>a ::b</p>')
    }
  )

  await t.test(
    'should not support a colon not followed by a letter',
    async function () {
      assert.equal(micromark(':', options()), '<p>:</p>')
    }
  )

  await t.test(
    'should support a colon followed by a letter',
    async function () {
      assert.equal(micromark(':a', options()), '<p></p>')
    }
  )

  await t.test('should support a colon followed by a digit', async function () {
    assert.equal(micromark(':9', options()), '<p></p>')
  })

  await t.test(
    'should support a colon followed by non-ascii letters',
    async function () {
      assert.equal(micromark('a :פּלוטאָ b', options()), '<p>a  b</p>')
    }
  )

  await t.test(
    'should not support a colon followed by a dash',
    async function () {
      assert.equal(micromark(':-', options()), '<p>:-</p>')
    }
  )

  await t.test(
    'should not support a colon followed by an underscore',
    async function () {
      assert.equal(micromark(':_', options()), '<p>:_</p>')
    }
  )

  await t.test(
    'should not support a colon followed by non-ascii punctuation',
    async function () {
      assert.equal(micromark(':꙳', options()), '<p>:꙳</p>')
    }
  )

  await t.test('should support a digit in a name', async function () {
    assert.equal(micromark(':a9', options()), '<p></p>')
  })

  await t.test('should support a dash in a name', async function () {
    assert.equal(micromark(':a-b', options()), '<p></p>')
  })

  await t.test(
    'should *not* support a dash at the end of a name',
    async function () {
      assert.equal(micromark(':a-', options()), '<p>:a-</p>')
    }
  )

  await t.test('should support an underscore in a name', async function () {
    assert.equal(micromark(':a_b', options()), '<p></p>')
  })

  await t.test(
    'should *not* support an underscore at the end of a name',
    async function () {
      assert.equal(micromark(':a_', options()), '<p>:a_</p>')
    }
  )

  await t.test(
    'should *not* support a colon right after a name',
    async function () {
      assert.equal(micromark(':a:', options()), '<p>:a:</p>')
    }
  )

  await t.test('should not interfere w/ gemoji (1)', async function () {
    assert.equal(micromark(':+1:', options()), '<p>:+1:</p>')
  })

  await t.test('should not interfere w/ gemoji (2)', async function () {
    assert.equal(micromark(':heart:', options()), '<p>:heart:</p>')
  })

  await t.test('should not interfere w/ gemoji (3)', async function () {
    assert.equal(
      micromark(':call_me_hand:', options()),
      '<p>:call_me_hand:</p>'
    )
  })

  await t.test('should not interfere w/ emphasis (`_`)', async function () {
    assert.equal(
      micromark('_:directive_', options()),
      '<p><em>:directive</em></p>'
    )
  })

  await t.test(
    'should support a name followed by an unclosed `[`',
    async function () {
      assert.equal(micromark(':a[', options()), '<p>[</p>')
    }
  )

  await t.test(
    'should support a name followed by an unclosed `{`',
    async function () {
      assert.equal(micromark(':a{', options()), '<p>{</p>')
    }
  )

  await t.test(
    'should support a name followed by an unclosed `[` w/ content',
    async function () {
      assert.equal(micromark(':a[b', options()), '<p>[b</p>')
    }
  )

  await t.test(
    'should support a name followed by an unclosed `{` w/ content',
    async function () {
      assert.equal(micromark(':a{b', options()), '<p>{b</p>')
    }
  )

  await t.test('should support an empty label', async function () {
    assert.equal(micromark(':a[]', options()), '<p></p>')
  })

  await t.test('should support a whitespace only label', async function () {
    assert.equal(micromark(':a[ \t]', options()), '<p></p>')
  })

  await t.test('should support an eol in a label', async function () {
    assert.equal(micromark(':a[\n]', options()), '<p></p>')
  })

  await t.test('should support content in a label', async function () {
    assert.equal(micromark(':a[a b c]asd', options()), '<p>asd</p>')
  })

  await t.test('should support markdown in a label', async function () {
    assert.equal(micromark(':a[a *b* c]asd', options()), '<p>asd</p>')
  })

  await t.test(
    'should support initial and final whitespace in and around a label',
    async function () {
      /** @type {string | undefined} */
      let label

      assert.equal(
        micromark(
          'a :x[ b ] c',
          options({
            x(d) {
              label = d.label
              return true
            }
          })
        ),
        '<p>a  c</p>'
      )

      assert.equal(label, ' b ')
    }
  )

  await t.test(
    'should support markdown in a label (hard break)',
    async function () {
      assert.equal(
        micromark(':x[a  \nb]c', options({'*': h})),
        '<p><x>a<br />\nb</x>c</p>'
      )
    }
  )

  await t.test('should support a directive in a label', async function () {
    assert.equal(micromark('a :b[c :d[e] f] g', options()), '<p>a  g</p>')
  })

  await t.test('should support content after a label', async function () {
    assert.equal(micromark(':a[]asd', options()), '<p>asd</p>')
  })

  await t.test('should support empty attributes', async function () {
    assert.equal(micromark(':a{}', options()), '<p></p>')
  })

  await t.test('should support whitespace only attributes', async function () {
    assert.equal(micromark(':a{ \t}', options()), '<p></p>')
  })

  await t.test('should support an eol in attributes', async function () {
    assert.equal(micromark(':a{\n}', options()), '<p></p>')
  })

  await t.test('should support attributes w/o values', async function () {
    assert.equal(micromark(':a{a b c}', options()), '<p></p>')
  })

  await t.test(
    'should support attributes w/ non-ascii letters',
    async function () {
      assert.equal(
        micromark(':planet{плутон}', options({'*': h})),
        '<p><planet плутон=""></planet></p>'
      )
    }
  )

  await t.test(
    'should support attributes w/ unquoted values',
    async function () {
      assert.equal(micromark(':a{a=b c=d}', options()), '<p></p>')
    }
  )

  await t.test(
    'should support attributes w/ class shortcut',
    async function () {
      assert.equal(micromark(':a{.a .b}', options()), '<p></p>')
    }
  )

  await t.test(
    'should support attributes w/ class shortcut w/o whitespace between',
    async function () {
      assert.equal(micromark(':a{.a.b}', options()), '<p></p>')
    }
  )

  await t.test('should support attributes w/ id shortcut', async function () {
    assert.equal(micromark(':a{#a #b}', options()), '<p></p>')
  })

  await t.test(
    'should support attributes w/ id shortcut w/o whitespace between',
    async function () {
      assert.equal(micromark(':a{#a#b}', options()), '<p></p>')
    }
  )

  await t.test(
    'should support attributes w/ shortcuts combined w/ other attributes',
    async function () {
      assert.equal(micromark(':a{#a.b.c#d e f=g #h.i.j}', options()), '<p></p>')
    }
  )

  await t.test('should not support an empty shortcut (`.`)', async function () {
    assert.equal(micromark(':a{..b}', options()), '<p>{..b}</p>')
  })

  await t.test('should not support an empty shortcut (`#`)', async function () {
    assert.equal(micromark(':a{.#b}', options()), '<p>{.#b}</p>')
  })

  await t.test('should not support an empty shortcut (`}`)', async function () {
    assert.equal(micromark(':a{.}', options()), '<p>{.}</p>')
  })

  await t.test(
    'should not support certain characters in shortcuts (`=`)',
    async function () {
      assert.equal(micromark(':a{.a=b}', options()), '<p>{.a=b}</p>')
    }
  )

  await t.test(
    'should not support certain characters in shortcuts (`"`)',
    async function () {
      assert.equal(micromark(':a{.a"b}', options()), '<p>{.a&quot;b}</p>')
    }
  )

  await t.test(
    'should not support certain characters in shortcuts (`<`)',
    async function () {
      assert.equal(micromark(':a{.a<b}', options()), '<p>{.a&lt;b}</p>')
    }
  )

  await t.test(
    'should support non-ascii characters in shortcuts',
    async function () {
      assert.equal(micromark(':a{#بلوتو}', options()), '<p></p>')
    }
  )

  await t.test(
    'should support most characters in shortcuts',
    async function () {
      assert.equal(micromark(':a{.a💚b}', options()), '<p></p>')
    }
  )

  await t.test(
    'should support an underscore in attribute names',
    async function () {
      assert.equal(micromark(':a{_}', options()), '<p></p>')
    }
  )

  await t.test('should support a colon in attribute names', async function () {
    assert.equal(micromark(':a{xml:lang}', options()), '<p></p>')
  })

  await t.test('should support double quoted attributes', async function () {
    assert.equal(micromark(':a{a="b" c="d e f"}', options()), '<p></p>')
  })

  await t.test('should support single quoted attributes', async function () {
    assert.equal(micromark(":a{a='b' c='d e f'}", options()), '<p></p>')
  })

  await t.test(
    'should support whitespace around initializers',
    async function () {
      assert.equal(
        micromark(':a{a = b c\t=\t\'d\' f  =\r"g"}', options()),
        '<p></p>'
      )
    }
  )

  await t.test(
    'should not support `=` to start an unquoted attribute value',
    async function () {
      assert.equal(micromark(':a{b==}', options()), '<p>{b==}</p>')
    }
  )

  await t.test(
    'should not support a missing attribute value after `=`',
    async function () {
      assert.equal(micromark(':a{b=}', options()), '<p>{b=}</p>')
    }
  )

  await t.test(
    'should not support an apostrophe in an unquoted attribute value',
    async function () {
      assert.equal(micromark(":a{b=c'}", options()), "<p>{b=c'}</p>")
    }
  )

  await t.test(
    'should not support a grave accent in an unquoted attribute value',
    async function () {
      assert.equal(micromark(':a{b=c`}', options()), '<p>{b=c`}</p>')
    }
  )

  await t.test(
    'should support most other characters in unquoted attribute values',
    async function () {
      assert.equal(micromark(':a{b=a💚b}', options()), '<p></p>')
    }
  )

  await t.test(
    'should not support an EOF in a quoted attribute value',
    async function () {
      assert.equal(micromark(':a{b="c', options()), '<p>{b=&quot;c</p>')
    }
  )

  await t.test(
    'should support most other characters in quoted attribute values',
    async function () {
      assert.equal(micromark(':a{b="a💚b"}', options()), '<p></p>')
    }
  )

  await t.test(
    'should support EOLs in quoted attribute values',
    async function () {
      assert.equal(micromark(':a{b="\nc\r  d"}', options()), '<p></p>')
    }
  )

  await t.test(
    'should not support an EOF after a quoted attribute value',
    async function () {
      assert.equal(micromark(':a{b="c"', options()), '<p>{b=&quot;c&quot;</p>')
    }
  )
})

test('micromark-extension-directive (syntax, leaf)', async function (t) {
  await t.test('should support a directive', async function () {
    assert.equal(micromark('::b', options()), '')
  })

  await t.test('should not support one colon', async function () {
    assert.equal(micromark(':', options()), '<p>:</p>')
  })

  await t.test(
    'should not support two colons not followed by a letter',
    async function () {
      assert.equal(micromark('::', options()), '<p>::</p>')
    }
  )

  await t.test(
    'should support two colons followed by a letter',
    async function () {
      assert.equal(micromark('::a', options()), '')
    }
  )

  await t.test(
    'should support two colons followed by a digit',
    async function () {
      assert.equal(micromark('::9', options()), '')
    }
  )

  await t.test(
    'should support two colons followed by non-ascii letters',
    async function () {
      assert.equal(micromark('::פּלוטאָ', options()), '')
    }
  )

  await t.test(
    'should not support two colons followed by a dash',
    async function () {
      assert.equal(micromark('::-', options()), '<p>::-</p>')
    }
  )

  await t.test('should support a digit in a name', async function () {
    assert.equal(micromark('::a9', options()), '')
  })

  await t.test('should support a dash in a name', async function () {
    assert.equal(micromark('::a-b', options()), '')
  })

  await t.test(
    'should not support a name followed by an unclosed `[`',
    async function () {
      assert.equal(micromark('::a[', options()), '<p>::a[</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `{`',
    async function () {
      assert.equal(micromark('::a{', options()), '<p>::a{</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `[` w/ content',
    async function () {
      assert.equal(micromark('::a[b', options()), '<p>::a[b</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `{` w/ content',
    async function () {
      assert.equal(micromark('::a{b', options()), '<p>::a{b</p>')
    }
  )

  await t.test('should support an empty label', async function () {
    assert.equal(micromark('::a[]', options()), '')
  })

  await t.test('should support a whitespace only label', async function () {
    assert.equal(micromark('::a[ \t]', options()), '')
  })

  await t.test('should not support an eol in a label', async function () {
    assert.equal(micromark('::a[\n]', options()), '<p>::a[\n]</p>')
  })

  await t.test('should support content in a label', async function () {
    assert.equal(micromark('::a[a b c]', options()), '')
  })

  await t.test('should support markdown in a label', async function () {
    assert.equal(micromark('::a[a *b* c]', options()), '')
  })

  await t.test('should not support content after a label', async function () {
    assert.equal(micromark('::a[]asd', options()), '<p>::a[]asd</p>')
  })

  await t.test('should support empty attributes', async function () {
    assert.equal(micromark('::a{}', options()), '')
  })

  await t.test('should support whitespace only attributes', async function () {
    assert.equal(micromark('::a{ \t}', options()), '')
  })

  await t.test('should not support an eol in attributes', async function () {
    assert.equal(micromark('::a{\n}', options()), '<p>::a{\n}</p>')
  })

  await t.test('should support attributes w/o values', async function () {
    assert.equal(micromark('::a{a b c}', options()), '')
  })

  await t.test(
    'should support attributes w/ non-ascii letters',
    async function () {
      assert.equal(
        micromark('::planet{плутон}', options({'*': h})),
        '<planet плутон=""></planet>'
      )
    }
  )

  await t.test(
    'should support attributes w/ unquoted values',
    async function () {
      assert.equal(micromark('::a{a=b c=d}', options()), '')
    }
  )

  await t.test(
    'should support attributes w/ class shortcut',
    async function () {
      assert.equal(micromark('::a{.a .b}', options()), '')
    }
  )

  await t.test('should support attributes w/ id shortcut', async function () {
    assert.equal(micromark('::a{#a #b}', options()), '')
  })

  await t.test(
    'should support non-ascii characters in shortcuts',
    async function () {
      assert.equal(micromark('::a{#بلوتو}', options()), '')
    }
  )

  await t.test(
    'should support most characters in shortcuts',
    async function () {
      assert.equal(micromark('::a{.a💚b}', options()), '')
    }
  )

  await t.test('should support double quoted attributes', async function () {
    assert.equal(micromark('::a{a="b" c="d e f"}', options()), '')
  })

  await t.test('should support single quoted attributes', async function () {
    assert.equal(micromark("::a{a='b' c='d e f'}", options()), '')
  })

  await t.test(
    'should support whitespace around initializers',
    async function () {
      assert.equal(micromark("::a{a = b c\t=\t'd'}", options()), '')
    }
  )

  await t.test(
    'should not support EOLs around initializers',
    async function () {
      assert.equal(micromark('::a{f  =\rg}', options()), '<p>::a{f  =\rg}</p>')
    }
  )

  await t.test(
    'should not support `=` to start an unquoted attribute value',
    async function () {
      assert.equal(micromark('::a{b==}', options()), '<p>::a{b==}</p>')
    }
  )

  await t.test(
    'should support most other characters in unquoted attribute values',
    async function () {
      assert.equal(micromark('::a{b=a💚b}', options()), '')
    }
  )

  await t.test(
    'should not support an EOF in a quoted attribute value',
    async function () {
      assert.equal(micromark('::a{b="c', options()), '<p>::a{b=&quot;c</p>')
    }
  )

  await t.test(
    'should support most other characters in quoted attribute values',
    async function () {
      assert.equal(micromark('::a{b="a💚b"}', options()), '')
    }
  )

  await t.test(
    'should not support EOLs in quoted attribute values',
    async function () {
      assert.equal(
        micromark('::a{b="\nc\r  d"}', options()),
        '<p>::a{b=&quot;\nc\rd&quot;}</p>'
      )
    }
  )

  await t.test(
    'should not support an EOF after a quoted attribute value',
    async function () {
      assert.equal(
        micromark('::a{b="c"', options()),
        '<p>::a{b=&quot;c&quot;</p>'
      )
    }
  )

  await t.test('should support whitespace after directives', async function () {
    assert.equal(micromark('::a{b=c} \t ', options()), '')
  })

  await t.test('should support a block quote after a leaf', async function () {
    assert.equal(
      micromark('::a{b=c}\n>a', options()),
      '<blockquote>\n<p>a</p>\n</blockquote>'
    )
  })

  await t.test('should support code (fenced) after a leaf', async function () {
    assert.equal(
      micromark('::a{b=c}\n```js\na', options()),
      '<pre><code class="language-js">a\n</code></pre>\n'
    )
  })

  await t.test(
    'should support code (indented) after a leaf',
    async function () {
      assert.equal(
        micromark('::a{b=c}\n    a', options()),
        '<pre><code>a\n</code></pre>'
      )
    }
  )

  await t.test('should support a definition after a leaf', async function () {
    assert.equal(micromark('::a{b=c}\n[a]: b', options()), '')
  })

  await t.test(
    'should support a heading (atx) after a leaf',
    async function () {
      assert.equal(micromark('::a{b=c}\n# a', options()), '<h1>a</h1>')
    }
  )

  await t.test(
    'should support a heading (setext) after a leaf',
    async function () {
      assert.equal(micromark('::a{b=c}\na\n=', options()), '<h1>a</h1>')
    }
  )

  await t.test('should support html after a leaf', async function () {
    assert.equal(micromark('::a{b=c}\n<!-->', options()), '<!-->')
  })

  await t.test('should support a list after a leaf', async function () {
    assert.equal(
      micromark('::a{b=c}\n* a', options()),
      '<ul>\n<li>a</li>\n</ul>'
    )
  })

  await t.test('should support a paragraph after a leaf', async function () {
    assert.equal(micromark('::a{b=c}\na', options()), '<p>a</p>')
  })

  await t.test(
    'should support a thematic break after a leaf',
    async function () {
      assert.equal(micromark('::a{b=c}\n***', options()), '<hr />')
    }
  )

  await t.test('should support a block quote before a leaf', async function () {
    assert.equal(
      micromark('>a\n::a{b=c}', options()),
      '<blockquote>\n<p>a</p>\n</blockquote>\n'
    )
  })

  await t.test('should support code (fenced) before a leaf', async function () {
    assert.equal(
      micromark('```js\na\n```\n::a{b=c}', options()),
      '<pre><code class="language-js">a\n</code></pre>\n'
    )
  })

  await t.test(
    'should support code (indented) before a leaf',
    async function () {
      assert.equal(
        micromark('    a\n::a{b=c}', options()),
        '<pre><code>a\n</code></pre>\n'
      )
    }
  )

  await t.test('should support a definition before a leaf', async function () {
    assert.equal(micromark('[a]: b\n::a{b=c}', options()), '')
  })

  await t.test(
    'should support a heading (atx) before a leaf',
    async function () {
      assert.equal(micromark('# a\n::a{b=c}', options()), '<h1>a</h1>\n')
    }
  )

  await t.test(
    'should support a heading (setext) before a leaf',
    async function () {
      assert.equal(micromark('a\n=\n::a{b=c}', options()), '<h1>a</h1>\n')
    }
  )

  await t.test('should support html before a leaf', async function () {
    assert.equal(micromark('<!-->\n::a{b=c}', options()), '<!-->\n')
  })

  await t.test('should support a list before a leaf', async function () {
    assert.equal(
      micromark('* a\n::a{b=c}', options()),
      '<ul>\n<li>a</li>\n</ul>\n'
    )
  })

  await t.test('should support a paragraph before a leaf', async function () {
    assert.equal(micromark('a\n::a{b=c}', options()), '<p>a</p>\n')
  })

  await t.test(
    'should support a thematic break before a leaf',
    async function () {
      assert.equal(micromark('***\n::a{b=c}', options()), '<hr />\n')
    }
  )

  await t.test('should not support lazyness (1)', async function () {
    assert.equal(
      micromark('> ::a\nb', options({'*': h})),
      '<blockquote><a></a>\n</blockquote>\n<p>b</p>'
    )
  })

  await t.test('should not support lazyness (2)', async function () {
    assert.equal(
      micromark('> a\n::b', options({'*': h})),
      '<blockquote>\n<p>a</p>\n</blockquote>\n<b></b>'
    )
  })
})

test('micromark-extension-directive (syntax, container)', async function (t) {
  await t.test('should support a directive', async function () {
    assert.equal(micromark(':::b', options()), '')
  })

  await t.test('should not support one colon', async function () {
    assert.equal(micromark(':', options()), '<p>:</p>')
  })

  await t.test(
    'should not support two colons not followed by a letter',
    async function () {
      assert.equal(micromark('::', options()), '<p>::</p>')
    }
  )

  await t.test(
    'should not support three colons not followed by a letter',
    async function () {
      assert.equal(micromark(':::', options()), '<p>:::</p>')
    }
  )

  await t.test(
    'should support three colons followed by a letter',
    async function () {
      assert.equal(micromark(':::a', options()), '')
    }
  )

  await t.test(
    'should support three colons followed by a digit',
    async function () {
      assert.equal(micromark(':::9', options()), '')
    }
  )

  await t.test(
    'should support three colons followed by non-ascii letters',
    async function () {
      assert.equal(micromark(':::פּלוטאָ', options()), '')
    }
  )

  await t.test(
    'should not support three colons followed by a dash',
    async function () {
      assert.equal(micromark(':::-', options()), '<p>:::-</p>')
    }
  )

  await t.test('should support a digit in a name', async function () {
    assert.equal(micromark(':::a9', options()), '')
  })

  await t.test('should support a dash in a name', async function () {
    assert.equal(micromark(':::a-b', options()), '')
  })

  await t.test(
    'should not support a name followed by an unclosed `[`',
    async function () {
      assert.equal(micromark(':::a[', options()), '<p>:::a[</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `{`',
    async function () {
      assert.equal(micromark(':::a{', options()), '<p>:::a{</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `[` w/ content',
    async function () {
      assert.equal(micromark(':::a[b', options()), '<p>:::a[b</p>')
    }
  )

  await t.test(
    'should not support a name followed by an unclosed `{` w/ content',
    async function () {
      assert.equal(micromark(':::a{b', options()), '<p>:::a{b</p>')
    }
  )

  await t.test('should support an empty label', async function () {
    assert.equal(micromark(':::a[]', options()), '')
  })

  await t.test('should support a whitespace only label', async function () {
    assert.equal(micromark(':::a[ \t]', options()), '')
  })

  await t.test('should not support an eol in a label', async function () {
    assert.equal(micromark(':::a[\n]', options()), '<p>:::a[\n]</p>')
  })

  await t.test('should support content in a label', async function () {
    assert.equal(micromark(':::a[a b c]', options()), '')
  })

  await t.test('should support markdown in a label', async function () {
    assert.equal(micromark(':::a[a *b* c]', options()), '')
  })

  await t.test('should not support content after a label', async function () {
    assert.equal(micromark(':::a[]asd', options()), '<p>:::a[]asd</p>')
  })

  await t.test('should support empty attributes', async function () {
    assert.equal(micromark(':::a{}', options()), '')
  })

  await t.test('should support whitespace only attributes', async function () {
    assert.equal(micromark(':::a{ \t}', options()), '')
  })

  await t.test('should not support an eol in attributes', async function () {
    assert.equal(micromark(':::a{\n}', options()), '<p>:::a{\n}</p>')
  })

  await t.test('should support attributes w/o values', async function () {
    assert.equal(micromark(':::a{a b c}', options()), '')
  })

  await t.test(
    'should support attributes w/ non-ascii letters',
    async function () {
      assert.equal(
        micromark(':::planet{плутон}', options({'*': h})),
        '<planet плутон=""></planet>'
      )
    }
  )

  await t.test(
    'should not support EOLs around initializers',
    async function () {
      assert.equal(
        micromark(':::a{f  =\rg}', options()),
        '<p>:::a{f  =\rg}</p>'
      )
    }
  )

  await t.test(
    'should not support an EOF in a quoted attribute value',
    async function () {
      assert.equal(micromark(':::a{b="c', options()), '<p>:::a{b=&quot;c</p>')
    }
  )

  await t.test(
    'should not support EOLs in quoted attribute values',
    async function () {
      assert.equal(
        micromark(':::a{b="\nc\r  d"}', options()),
        '<p>:::a{b=&quot;\nc\rd&quot;}</p>'
      )
    }
  )

  await t.test(
    'should not support an EOF after a quoted attribute value',
    async function () {
      assert.equal(
        micromark(':::a{b="c"', options()),
        '<p>:::a{b=&quot;c&quot;</p>'
      )
    }
  )

  await t.test('should support whitespace after directives', async function () {
    assert.equal(micromark(':::a{b=c} \t ', options()), '')
  })

  await t.test('should support no closing fence', async function () {
    assert.equal(micromark(':::a\n', options()), '')
  })

  await t.test(
    'should support no closing fence in a block quote (1)',
    async function () {
      assert.equal(
        micromark('> :::directive', options()),
        '<blockquote>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should support no closing fence in a block quote (2)',
    async function () {
      assert.equal(
        micromark('> :::directive\n>\n', options()),
        '<blockquote>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should support no closing fence in a block quote (3)',
    async function () {
      assert.equal(
        micromark('> :::directive\n> asd\n', options()),
        '<blockquote>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should support no closing fence in a block quote (4)',
    async function () {
      assert.equal(
        micromark('> :::directive\n>\n\nasd', options()),
        '<blockquote>\n</blockquote>\n<p>asd</p>'
      )
    }
  )

  await t.test(
    'should support no closing fence in a list (1)',
    async function () {
      assert.equal(
        micromark('* :::directive', options()),
        '<ul>\n<li></li>\n</ul>'
      )
    }
  )

  await t.test(
    'should support no closing fence in a list (2)',
    async function () {
      assert.equal(
        micromark('* :::directive\n  \n', options()),
        '<ul>\n<li></li>\n</ul>'
      )
    }
  )

  await t.test(
    'should support no closing fence in a list (3)',
    async function () {
      assert.equal(
        micromark('* :::directive\n  asd\n', options()),
        '<ul>\n<li></li>\n</ul>'
      )
    }
  )

  await t.test(
    'should support no closing fence in a list (4)',
    async function () {
      assert.equal(
        micromark('* :::directive\n  \n\nasd', options()),
        '<ul>\n<li></li>\n</ul>\n<p>asd</p>'
      )
    }
  )

  await t.test('should support an immediate closing fence', async function () {
    assert.equal(micromark(':::a\n:::', options()), '')
  })

  await t.test(
    'should support content after a closing fence',
    async function () {
      assert.equal(micromark(':::a\n:::\nb', options()), '<p>b</p>')
    }
  )

  await t.test(
    'should not close w/ a “closing” fence of two colons',
    async function () {
      assert.equal(micromark(':::a\n::\nb', options()), '')
    }
  )

  await t.test(
    'should close w/ a closing fence of more colons',
    async function () {
      assert.equal(micromark(':::a\n::::\nb', options()), '<p>b</p>')
    }
  )

  await t.test('should support more opening colons', async function () {
    assert.equal(micromark('::::a\n::::\nb', options()), '<p>b</p>')
  })

  await t.test(
    'should not close w/ a “closing” fence of less colons than the opening',
    async function () {
      assert.equal(micromark(':::::a\n::::\nb', options()), '')
    }
  )

  await t.test(
    'should close w/ a closing fence followed by white space',
    async function () {
      assert.equal(micromark(':::a\n::: \t\nc', options()), '<p>c</p>')
    }
  )

  await t.test(
    'should not close w/ a “closing” fence followed by other characters',
    async function () {
      assert.equal(micromark(':::a\n::: b\nc', options()), '')
    }
  )

  await t.test('should close w/ an indented closing fence', async function () {
    assert.equal(micromark(':::a\n  :::\nc', options()), '<p>c</p>')
  })

  await t.test(
    'should not close w/ when the “closing” fence is indented at a tab size',
    async function () {
      assert.equal(micromark(':::a\n\t:::\nc', options()), '')
    }
  )

  await t.test(
    'should not close w/ when the “closing” fence is indented more than a tab size',
    async function () {
      assert.equal(micromark(':::a\n     :::\nc', options()), '')
    }
  )

  await t.test('should support blank lines in content', async function () {
    assert.equal(micromark(':::a\n\n  \n\ta', options()), '')
  })

  await t.test('should support an EOL EOF', async function () {
    assert.equal(micromark(':::a\n\ta\n', options()), '')
  })

  await t.test('should support an indented directive', async function () {
    assert.equal(micromark('  :::a\n  b\n  :::\nc', options()), '<p>c</p>')
  })

  await t.test(
    'should still not close an indented directive when the “closing” fence is indented a tab size',
    async function () {
      assert.equal(micromark('  :::a\n\t:::\nc', options()), '')
    }
  )

  await t.test(
    'should strip arbitrary length prefix from closing fence line (codeIndented disabled)',
    async function () {
      assert.equal(
        micromark(':::x\nalpha.\n    :::\n\nbravo.', {
          allowDangerousHtml: true,
          extensions: [directive(), {disable: {null: ['codeIndented']}}],
          htmlExtensions: [directiveHtml()]
        }),
        '<p>bravo.</p>'
      )
    }
  )

  await t.test(
    'should support a block quote after a container',
    async function () {
      assert.equal(
        micromark(':::a\n:::\n>a', options()),
        '<blockquote>\n<p>a</p>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should support code (fenced) after a container',
    async function () {
      assert.equal(
        micromark(':::a\n:::\n```js\na', options()),
        '<pre><code class="language-js">a\n</code></pre>\n'
      )
    }
  )

  await t.test(
    'should support code (indented) after a container',
    async function () {
      assert.equal(
        micromark(':::a\n:::\n    a', options()),
        '<pre><code>a\n</code></pre>'
      )
    }
  )

  await t.test(
    'should support a definition after a container',
    async function () {
      assert.equal(micromark(':::a\n:::\n[a]: b', options()), '')
    }
  )

  await t.test(
    'should support a heading (atx) after a container',
    async function () {
      assert.equal(micromark(':::a\n:::\n# a', options()), '<h1>a</h1>')
    }
  )

  await t.test(
    'should support a heading (setext) after a container',
    async function () {
      assert.equal(micromark(':::a\n:::\na\n=', options()), '<h1>a</h1>')
    }
  )

  await t.test('should support html after a container', async function () {
    assert.equal(micromark(':::a\n:::\n<!-->', options()), '<!-->')
  })

  await t.test('should support a list after a container', async function () {
    assert.equal(
      micromark(':::a\n:::\n* a', options()),
      '<ul>\n<li>a</li>\n</ul>'
    )
  })

  await t.test(
    'should support a paragraph after a container',
    async function () {
      assert.equal(micromark(':::a\n:::\na', options()), '<p>a</p>')
    }
  )

  await t.test(
    'should support a thematic break after a container',
    async function () {
      assert.equal(micromark(':::a\n:::\n***', options()), '<hr />')
    }
  )

  await t.test(
    'should support a block quote before a container',
    async function () {
      assert.equal(
        micromark('>a\n:::a\nb', options()),
        '<blockquote>\n<p>a</p>\n</blockquote>\n'
      )
    }
  )

  await t.test(
    'should support code (fenced) before a container',
    async function () {
      assert.equal(
        micromark('```js\na\n```\n:::a\nb', options()),
        '<pre><code class="language-js">a\n</code></pre>\n'
      )
    }
  )

  await t.test(
    'should support code (indented) before a container',
    async function () {
      assert.equal(
        micromark('    a\n:::a\nb', options()),
        '<pre><code>a\n</code></pre>\n'
      )
    }
  )

  await t.test(
    'should support a definition before a container',
    async function () {
      assert.equal(micromark('[a]: b\n:::a\nb', options()), '')
    }
  )

  await t.test(
    'should support a heading (atx) before a container',
    async function () {
      assert.equal(micromark('# a\n:::a\nb', options()), '<h1>a</h1>\n')
    }
  )

  await t.test(
    'should support a heading (setext) before a container',
    async function () {
      assert.equal(micromark('a\n=\n:::a\nb', options()), '<h1>a</h1>\n')
    }
  )

  await t.test('should support html before a container', async function () {
    assert.equal(micromark('<!-->\n:::a\nb', options()), '<!-->\n')
  })

  await t.test('should support a list before a container', async function () {
    assert.equal(
      micromark('* a\n:::a\nb', options()),
      '<ul>\n<li>a</li>\n</ul>\n'
    )
  })

  await t.test(
    'should support a paragraph before a container',
    async function () {
      assert.equal(micromark('a\n:::a\nb', options()), '<p>a</p>\n')
    }
  )

  await t.test(
    'should support a thematic break before a container',
    async function () {
      assert.equal(micromark('***\n:::a\nb', options()), '<hr />\n')
    }
  )

  await t.test('should support prefixed containers (1)', async function () {
    assert.equal(micromark(' :::x\n ', options({'*': h})), '<x></x>')
  })

  await t.test('should support prefixed containers (2)', async function () {
    assert.equal(
      micromark(' :::x\n - a', options({'*': h})),
      '<x>\n<ul>\n<li>a</li>\n</ul>\n</x>'
    )
  })

  await t.test('should support prefixed containers (3)', async function () {
    assert.equal(
      micromark(' :::x\n - a\n > b', options({'*': h})),
      '<x>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</x>'
    )
  })

  await t.test('should support prefixed containers (4)', async function () {
    assert.equal(
      micromark(' :::x\n - a\n > b\n :::', options({'*': h})),
      '<x>\n<ul>\n<li>a</li>\n</ul>\n<blockquote>\n<p>b</p>\n</blockquote>\n</x>'
    )
  })

  await t.test('should not support lazyness (1)', async function () {
    assert.equal(
      micromark('> :::a\nb', options({'*': h})),
      '<blockquote><a></a>\n</blockquote>\n<p>b</p>'
    )
  })

  await t.test('should not support lazyness (2)', async function () {
    assert.equal(
      micromark('> :::a\n> b\nc', options({'*': h})),
      '<blockquote><a>\n<p>b</p>\n</a>\n</blockquote>\n<p>c</p>'
    )
  })

  await t.test('should not support lazyness (3)', async function () {
    assert.equal(
      micromark('> a\n:::b', options({'*': h})),
      '<blockquote>\n<p>a</p>\n</blockquote>\n<b></b>'
    )
  })

  await t.test('should not support lazyness (4)', async function () {
    assert.equal(
      micromark('> :::a\n:::', options({'*': h})),
      '<blockquote><a></a>\n</blockquote>\n<p>:::</p>'
    )
  })
})

test('micromark-extension-directive (compile)', async function (t) {
  await t.test('should support a directives (abbr)', async function () {
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
      ].join('\n')
    )
  })

  await t.test('should support directives (youtube)', async function () {
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
      ].join('\n')
    )
  })

  await t.test(
    'should support fall through directives (`*`)',
    async function () {
      assert.equal(
        micromark(':youtube[Cat in a box]\n:br', options({youtube, '*': h})),
        '<p><youtube>Cat in a box</youtube>\n<br></p>'
      )
    }
  )

  await t.test(
    'should support fall through directives (`*`)',
    async function () {
      assert.equal(
        micromark(':a[:img{src="x" alt=y}]{href="z"}', options({'*': h})),
        '<p><a href="z"><img src="x" alt="y"></a></p>'
      )
    }
  )
})

test('content', async function (t) {
  await t.test(
    'should support character escapes and character references in label',
    async function () {
      assert.equal(
        micromark(':abbr[x\\&y&amp;z]', options({abbr})),
        '<p><abbr>x&amp;y&amp;z</abbr></p>'
      )
    }
  )

  await t.test('should support escaped brackets in a label', async function () {
    assert.equal(
      micromark(':abbr[x\\[y\\]z]', options({abbr})),
      '<p><abbr>x[y]z</abbr></p>'
    )
  })

  await t.test(
    'should support balanced brackets in a label',
    async function () {
      assert.equal(
        micromark(':abbr[x[y]z]', options({abbr})),
        '<p><abbr>x[y]z</abbr></p>'
      )
    }
  )

  await t.test(
    'should support balanced brackets in a label, 32 levels deep',
    async function () {
      assert.equal(
        micromark(
          ':abbr[1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]',
          options({abbr})
        ),
        '<p><abbr>1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]</abbr></p>'
      )
    }
  )

  await t.test(
    'should *not* support balanced brackets in a label, 33 levels deep',
    async function () {
      assert.equal(
        micromark(
          ':abbr[1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[33[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]',
          options({abbr})
        ),
        '<p><abbr></abbr>[1[2[3[4[5[6[7[8[9[10[11[12[13[14[15[16[17[18[19[20[21[22[23[24[25[26[27[28[29[30[31[32[33[x]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]</p>'
      )
    }
  )

  await t.test('should support EOLs in a label', async function () {
    assert.equal(
      micromark(':abbr[a\nb\rc]', options({abbr})),
      '<p><abbr>a\nb\rc</abbr></p>'
    )
  })

  await t.test(
    'should support EOLs at the edges of a label (1)',
    async function () {
      assert.equal(
        micromark(':abbr[\na\r]', options({abbr})),
        '<p><abbr>\na\r</abbr></p>'
      )
    }
  )

  await t.test(
    'should support EOLs at the edges of a label (2)',
    async function () {
      assert.equal(
        micromark(':abbr[\n]', options({abbr})),
        '<p><abbr>\n</abbr></p>'
      )
    }
  )

  await t.test(
    'should support EOLs around nested directives',
    async function () {
      assert.equal(
        micromark(':abbr[a\n:abbr[b]\nc]', options({abbr})),
        '<p><abbr>a\n<abbr>b</abbr>\nc</abbr></p>'
      )
    }
  )

  await t.test(
    'should support EOLs inside nested directives (1)',
    async function () {
      assert.equal(
        micromark(':abbr[:abbr[\n]]', options({abbr})),
        '<p><abbr><abbr>\n</abbr></abbr></p>'
      )
    }
  )

  await t.test(
    'should support EOLs inside nested directives (2)',
    async function () {
      assert.equal(
        micromark(':abbr[:abbr[a\nb]]', options({abbr})),
        '<p><abbr><abbr>a\nb</abbr></abbr></p>'
      )
    }
  )

  await t.test(
    'should support EOLs inside nested directives (3)',
    async function () {
      assert.equal(
        micromark(':abbr[:abbr[\nb\n]]', options({abbr})),
        '<p><abbr><abbr>\nb\n</abbr></abbr></p>'
      )
    }
  )

  await t.test(
    'should support EOLs inside nested directives (4)',
    async function () {
      assert.equal(
        micromark(':abbr[:abbr[\\\n]]', options({abbr})),
        '<p><abbr><abbr><br />\n</abbr></abbr></p>'
      )
    }
  )

  await t.test('should support markdown in a label', async function () {
    assert.equal(
      micromark(':abbr[a *b* **c** d]', options({abbr})),
      '<p><abbr>a <em>b</em> <strong>c</strong> d</abbr></p>'
    )
  })

  await t.test(
    'should support character references in unquoted attribute values',
    async function () {
      assert.equal(
        micromark(':abbr{title=a&apos;b}', options({abbr})),
        '<p><abbr title="a\'b"></abbr></p>'
      )
    }
  )

  await t.test(
    'should support character references in double attribute values',
    async function () {
      assert.equal(
        micromark(':abbr{title="a&apos;b"}', options({abbr})),
        '<p><abbr title="a\'b"></abbr></p>'
      )
    }
  )

  await t.test(
    'should support character references in single attribute values',
    async function () {
      assert.equal(
        micromark(":abbr{title='a&apos;b'}", options({abbr})),
        '<p><abbr title="a\'b"></abbr></p>'
      )
    }
  )

  await t.test(
    'should support unknown character references in attribute values',
    async function () {
      assert.equal(
        micromark(':abbr{title="a&somethingelse;b"}', options({abbr})),
        '<p><abbr title="a&amp;somethingelse;b"></abbr></p>'
      )
    }
  )

  await t.test(
    'should not support non-terminated character references in unquoted attribute values',
    async function () {
      assert.equal(
        micromark(':a{href=&param}', options({'*': h})),
        '<p><a href="&amp;param"></a></p>'
      )
    }
  )

  await t.test(
    'should not support non-terminated character references in double quoted attribute values',
    async function () {
      assert.equal(
        micromark(':a{href="&param"}', options({'*': h})),
        '<p><a href="&amp;param"></a></p>'
      )
    }
  )

  await t.test(
    'should not support non-terminated character references in single quoted attribute values',
    async function () {
      assert.equal(
        micromark(":a{href='&param'}", options({'*': h})),
        '<p><a href="&amp;param"></a></p>'
      )
    }
  )

  await t.test('should support EOLs between attributes', async function () {
    assert.equal(
      micromark(':span{a\nb}', options({'*': h})),
      '<p><span a="" b=""></span></p>'
    )
  })

  await t.test(
    'should support EOLs at the edges of attributes',
    async function () {
      assert.equal(
        micromark(':span{\na\n}', options({'*': h})),
        '<p><span a=""></span></p>'
      )
    }
  )

  await t.test('should support EOLs before initializer', async function () {
    assert.equal(
      micromark(':span{a\r= b}', options({'*': h})),
      '<p><span a="b"></span></p>'
    )
  })

  await t.test('should support EOLs after initializer', async function () {
    assert.equal(
      micromark(':span{a=\r\nb}', options({'*': h})),
      '<p><span a="b"></span></p>'
    )
  })

  await t.test(
    'should support EOLs between an unquoted attribute value and a next attribute name',
    async function () {
      assert.equal(
        micromark(':span{a=b\nc}', options({'*': h})),
        '<p><span a="b" c=""></span></p>'
      )
    }
  )

  await t.test(
    'should support EOLs in a double quoted attribute value',
    async function () {
      assert.equal(
        micromark(':span{a="b\nc"}', options({'*': h})),
        '<p><span a="b\nc"></span></p>'
      )
    }
  )

  await t.test(
    'should support EOLs in a single quoted attribute value',
    async function () {
      assert.equal(
        micromark(":span{a='b\nc'}", options({'*': h})),
        '<p><span a="b\nc"></span></p>'
      )
    }
  )

  await t.test('should support `id` shortcuts', async function () {
    assert.equal(
      micromark(':span{#a#b}', options({'*': h})),
      '<p><span id="b"></span></p>'
    )
  })

  await t.test(
    'should support `id` shortcuts after `id` attributes',
    async function () {
      assert.equal(
        micromark(':span{id=a id="b" #c#d}', options({'*': h})),
        '<p><span id="d"></span></p>'
      )
    }
  )

  await t.test('should support `class` shortcuts', async function () {
    assert.equal(
      micromark(':span{.a.b}', options({'*': h})),
      '<p><span class="a b"></span></p>'
    )
  })

  await t.test(
    'should support `class` shortcuts after `class` attributes',
    async function () {
      assert.equal(
        micromark(':span{class=a class="b c" .d.e}', options({'*': h})),
        '<p><span class="a b c d e"></span></p>'
      )
    }
  )

  await t.test(
    'should support container directives in container directives',
    async function () {
      assert.equal(
        micromark('::::div{.big}\n:::div{.small}\nText', options({'*': h})),
        '<div class="big">\n<div class="small">\n<p>Text</p>\n</div>\n</div>'
      )
    }
  )

  await t.test(
    'should support leaf directives in container directives',
    async function () {
      assert.equal(
        micromark(':::div{.big}\n::hr{.small}', options({'*': h})),
        '<div class="big">\n<hr class="small">\n</div>'
      )
    }
  )

  await t.test(
    'should support text directives in container directives',
    async function () {
      assert.equal(
        micromark(':::div{.big}\n:b[Text]', options({'*': h})),
        '<div class="big">\n<p><b>Text</b></p>\n</div>'
      )
    }
  )

  await t.test(
    'should support lists in container directives',
    async function () {
      assert.equal(
        micromark(':::section\n* a\n:::', options({'*': h})),
        '<section>\n<ul>\n<li>a</li>\n</ul>\n</section>'
      )
    }
  )

  await t.test(
    'should support lists w/ label brackets in container directives',
    async function () {
      assert.equal(
        micromark(':::section[]\n* a\n:::', options({'*': h})),
        '<section>\n<ul>\n<li>a</li>\n</ul>\n</section>'
      )
    }
  )

  await t.test(
    'should support lists w/ attribute braces in container directives',
    async function () {
      assert.equal(
        micromark(':::section{}\n* a\n:::', options({'*': h})),
        '<section>\n<ul>\n<li>a</li>\n</ul>\n</section>'
      )
    }
  )

  await t.test(
    'should support lazy containers in an unclosed container directive',
    async function () {
      assert.equal(micromark(':::i\n- +\na', options()), '')
    }
  )

  await t.test(
    'should support line endings + spread in containers (syntax-tree/mdast-util-directive#13)',
    async function () {
      assert.equal(
        micromark(' :::div\n* b\n\n c\n:::', options({'*': h})),
        '<div>\n<ul>\n<li>b</li>\n</ul>\n<p>c</p>\n</div>'
      )
    }
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
  const attributes = d.attributes || {}
  const v = attributes.v
  /** @type {string} */
  let key

  if (!v) return false

  const list = [
    'src="https://www.youtube.com/embed/' + this.encode(v) + '"',
    'allowfullscreen'
  ]

  if (d.label) {
    list.push('title="' + this.encode(d.label) + '"')
  }

  for (key in attributes) {
    if (key !== 'v') {
      list.push(this.encode(key) + '="' + this.encode(attributes[key]) + '"')
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
 *   Context.
 * @type {Handle}
 *   Handle.
 * @returns {undefined}
 *   Nothing.
 */
function h(d) {
  const content = d.content || d.label
  const attributes = d.attributes || {}
  /** @type {Array<string>} */
  const list = []
  /** @type {string} */
  let key

  for (key in attributes) {
    if (own.call(attributes, key)) {
      list.push(this.encode(key) + '="' + this.encode(attributes[key]) + '"')
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
 * @param {HtmlOptions | null | undefined} [options={}]
 *   HTML configuration (default: `{}`).
 */
function options(options) {
  return {
    allowDangerousHtml: true,
    extensions: [directive()],
    htmlExtensions: [directiveHtml(options)]
  }
}
