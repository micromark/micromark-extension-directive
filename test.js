var test = require('tape')
var micromark = require('micromark/lib')
var voids = require('html-void-elements')
var syntax = require('.')
var html = require('./html')

test('micromark-extension-directive (syntax)', function (t) {
  t.test('text', function (t) {
    t.equal(
      micromark('\\:a', options()),
      '<p>:a</p>',
      'should support an escaped colon which would otherwise be a directive'
    )

    t.equal(
      micromark('\\::a', options()),
      '<p>:</p>',
      'should support a directive after an escaped colon'
    )

    t.equal(
      micromark('a ::b', options()),
      '<p>a ::b</p>',
      'should not support a directive after a colon'
    )

    t.equal(
      micromark(':', options()),
      '<p>:</p>',
      'should not support a colon not followed by an alpha'
    )

    t.equal(
      micromark(':a', options()),
      '<p></p>',
      'should support a colon followed by an alpha'
    )

    t.equal(
      micromark(':9', options()),
      '<p>:9</p>',
      'should not support a colon followed by a digit'
    )

    t.equal(
      micromark(':-', options()),
      '<p>:-</p>',
      'should not support a colon followed by a dash'
    )

    t.equal(
      micromark(':a9', options()),
      '<p></p>',
      'should support a digit in a name'
    )

    t.equal(
      micromark(':a-', options()),
      '<p></p>',
      'should support a dash in a name'
    )

    t.equal(
      micromark(':a[', options()),
      '<p>[</p>',
      'should support a name followed by an unclosed `[`'
    )

    t.equal(
      micromark(':a{', options()),
      '<p>{</p>',
      'should support a name followed by an unclosed `{`'
    )

    t.equal(
      micromark(':a[b', options()),
      '<p>[b</p>',
      'should support a name followed by an unclosed `[` w/ content'
    )

    t.equal(
      micromark(':a{b', options()),
      '<p>{b</p>',
      'should support a name followed by an unclosed `{` w/ content'
    )

    t.equal(
      micromark(':a[]', options()),
      '<p></p>',
      'should support an empty label'
    )

    t.equal(
      micromark(':a[ \t]', options()),
      '<p></p>',
      'should support a whitespace only label'
    )

    t.equal(
      micromark(':a[\n]', options()),
      '<p></p>',
      'should support an eol in an label'
    )

    t.equal(
      micromark(':a[a b c]asd', options()),
      '<p>asd</p>',
      'should support content in an label'
    )

    t.equal(
      micromark(':a[a *b* c]asd', options()),
      '<p>asd</p>',
      'should support markdown in an label'
    )

    t.equal(
      micromark(':a[]asd', options()),
      '<p>asd</p>',
      'should support content after a label'
    )

    t.equal(
      micromark(':a{}', options()),
      '<p></p>',
      'should support empty attributes'
    )

    t.equal(
      micromark(':a{ \t}', options()),
      '<p></p>',
      'should support whitespace only attributes'
    )

    t.equal(
      micromark(':a{\n}', options()),
      '<p></p>',
      'should support an eol in attributes'
    )

    t.equal(
      micromark(':a{a b c}', options()),
      '<p></p>',
      'should support attributes w/o values'
    )

    t.equal(
      micromark(':a{a=b c=d}', options()),
      '<p></p>',
      'should support attributes w/ unquoted values'
    )

    t.equal(
      micromark(':a{.a .b}', options()),
      '<p></p>',
      'should support attributes w/ class shortcut'
    )

    t.equal(
      micromark(':a{.a.b}', options()),
      '<p></p>',
      'should support attributes w/ class shortcut w/o whitespace between'
    )

    t.equal(
      micromark(':a{#a #b}', options()),
      '<p></p>',
      'should support attributes w/ id shortcut'
    )

    t.equal(
      micromark(':a{#a#b}', options()),
      '<p></p>',
      'should support attributes w/ id shortcut w/o whitespace between'
    )

    t.equal(
      micromark(':a{#a.b.c#d e f=g #h.i.j}', options()),
      '<p></p>',
      'should support attributes w/ shortcuts combined w/ other attributes'
    )

    t.equal(
      micromark(':a{..b}', options()),
      '<p>{..b}</p>',
      'should not support an empty shortcut (`.`)'
    )

    t.equal(
      micromark(':a{.#b}', options()),
      '<p>{.#b}</p>',
      'should not support an empty shortcut (`#`)'
    )

    t.equal(
      micromark(':a{.}', options()),
      '<p>{.}</p>',
      'should not support an empty shortcut (`}`)'
    )

    t.equal(
      micromark(':a{.a=b}', options()),
      '<p>{.a=b}</p>',
      'should not support certain characters in shortcuts (`=`)'
    )

    t.equal(
      micromark(':a{.a"b}', options()),
      '<p>{.a&quot;b}</p>',
      'should not support certain characters in shortcuts (`"`)'
    )

    t.equal(
      micromark(':a{.a<b}', options()),
      '<p>{.a&lt;b}</p>',
      'should not support certain characters in shortcuts (`<`)'
    )

    t.equal(
      micromark(':a{.a💚b}', options()),
      '<p></p>',
      'should support most characters in shortcuts'
    )

    t.equal(
      micromark(':a{_}', options()),
      '<p></p>',
      'should support an underscore in attribute names'
    )

    t.equal(
      micromark(':a{xml:lang}', options()),
      '<p></p>',
      'should support a colon in attribute names'
    )

    t.equal(
      micromark(':a{a="b" c="d e f"}', options()),
      '<p></p>',
      'should support double quoted attributes'
    )

    t.equal(
      micromark(":a{a='b' c='d e f'}", options()),
      '<p></p>',
      'should support single quoted attributes'
    )

    t.equal(
      micromark(':a{a = b c\t=\t\'d\' f  =\r"g"}', options()),
      '<p></p>',
      'should support whitespace around initializers'
    )

    t.equal(
      micromark(':a{b==}', options()),
      '<p>{b==}</p>',
      'should not support `=` to start an unquoted attribute value'
    )

    t.equal(
      micromark(':a{b=}', options()),
      '<p>{b=}</p>',
      'should not support a missing attribute value after `=`'
    )

    t.equal(
      micromark(":a{b=c'}", options()),
      "<p>{b=c'}</p>",
      'should not support an apostrophe in an unquoted attribute value'
    )

    t.equal(
      micromark(':a{b=c`}', options()),
      '<p>{b=c`}</p>',
      'should not support a grave accent in an unquoted attribute value'
    )

    t.equal(
      micromark(':a{b=a💚b}', options()),
      '<p></p>',
      'should support most other characters in unquoted attribute values'
    )

    t.equal(
      micromark(':a{b="c', options()),
      '<p>{b=&quot;c</p>',
      'should not support an EOF in a quoted attribute value'
    )

    t.equal(
      micromark(':a{b="a💚b"}', options()),
      '<p></p>',
      'should support most other characters in quoted attribute values'
    )

    t.equal(
      micromark(':a{b="\nc\r  d"}', options()),
      '<p></p>',
      'should support EOLs in quoted attribute values'
    )

    t.equal(
      micromark(':a{b="c"', options()),
      '<p>{b=&quot;c&quot;</p>',
      'should not support an EOF after a quoted attribute value'
    )

    t.end()
  })

  t.test('leaf', function (t) {
    t.equal(micromark('::b', options()), '', 'should support a directive')

    t.equal(
      micromark(':', options()),
      '<p>:</p>',
      'should not support one colon'
    )

    t.equal(
      micromark('::', options()),
      '<p>::</p>',
      'should not support two colons not followed by an alpha'
    )

    t.equal(
      micromark('::a', options()),
      '',
      'should support two colons followed by an alpha'
    )

    t.equal(
      micromark('::9', options()),
      '<p>::9</p>',
      'should not support two colons followed by a digit'
    )

    t.equal(
      micromark('::-', options()),
      '<p>::-</p>',
      'should not support two colons followed by a dash'
    )

    t.equal(
      micromark('::a9', options()),
      '',
      'should support a digit in a name'
    )

    t.equal(micromark('::a-', options()), '', 'should support a dash in a name')

    t.equal(
      micromark('::a[', options()),
      '<p>::a[</p>',
      'should not support a name followed by an unclosed `[`'
    )

    t.equal(
      micromark('::a{', options()),
      '<p>::a{</p>',
      'should not support a name followed by an unclosed `{`'
    )

    t.equal(
      micromark('::a[b', options()),
      '<p>::a[b</p>',
      'should not support a name followed by an unclosed `[` w/ content'
    )

    t.equal(
      micromark('::a{b', options()),
      '<p>::a{b</p>',
      'should not support a name followed by an unclosed `{` w/ content'
    )

    t.equal(micromark('::a[]', options()), '', 'should support an empty label')

    t.equal(
      micromark('::a[ \t]', options()),
      '',
      'should support a whitespace only label'
    )

    t.equal(
      micromark('::a[\n]', options()),
      '<p>::a[\n]</p>',
      'should not support an eol in an label'
    )

    t.equal(
      micromark('::a[a b c]', options()),
      '',
      'should support content in an label'
    )

    t.equal(
      micromark('::a[a *b* c]', options()),
      '',
      'should support markdown in an label'
    )

    t.equal(
      micromark('::a[]asd', options()),
      '<p>::a[]asd</p>',
      'should not support content after a label'
    )

    t.equal(
      micromark('::a{}', options()),
      '',
      'should support empty attributes'
    )

    t.equal(
      micromark('::a{ \t}', options()),
      '',
      'should support whitespace only attributes'
    )

    t.equal(
      micromark('::a{\n}', options()),
      '<p>::a{\n}</p>',
      'should not support an eol in attributes'
    )

    t.equal(
      micromark('::a{a b c}', options()),
      '',
      'should support attributes w/o values'
    )

    t.equal(
      micromark('::a{a=b c=d}', options()),
      '',
      'should support attributes w/ unquoted values'
    )

    t.equal(
      micromark('::a{.a .b}', options()),
      '',
      'should support attributes w/ class shortcut'
    )

    t.equal(
      micromark('::a{#a #b}', options()),
      '',
      'should support attributes w/ id shortcut'
    )

    t.equal(
      micromark('::a{.a💚b}', options()),
      '',
      'should support most characters in shortcuts'
    )

    t.equal(
      micromark('::a{a="b" c="d e f"}', options()),
      '',
      'should support double quoted attributes'
    )

    t.equal(
      micromark("::a{a='b' c='d e f'}", options()),
      '',
      'should support single quoted attributes'
    )

    t.equal(
      micromark("::a{a = b c\t=\t'd'}", options()),
      '',
      'should support whitespace around initializers'
    )

    t.equal(
      micromark('::a{f  =\rg}', options()),
      '<p>::a{f  =\rg}</p>',
      'should not support EOLs around initializers'
    )

    t.equal(
      micromark('::a{b==}', options()),
      '<p>::a{b==}</p>',
      'should not support `=` to start an unquoted attribute value'
    )

    t.equal(
      micromark('::a{b=a💚b}', options()),
      '',
      'should support most other characters in unquoted attribute values'
    )

    t.equal(
      micromark('::a{b="c', options()),
      '<p>::a{b=&quot;c</p>',
      'should not support an EOF in a quoted attribute value'
    )

    t.equal(
      micromark('::a{b="a💚b"}', options()),
      '',
      'should support most other characters in quoted attribute values'
    )

    t.equal(
      micromark('::a{b="\nc\r  d"}', options()),
      '<p>::a{b=&quot;\nc\rd&quot;}</p>',
      'should not support EOLs in quoted attribute values'
    )

    t.equal(
      micromark('::a{b="c"', options()),
      '<p>::a{b=&quot;c&quot;</p>',
      'should not support an EOF after a quoted attribute value'
    )

    t.equal(
      micromark('::a{b=c} \t ', options()),
      '',
      'should support whitespace after directives'
    )

    t.equal(
      micromark('::a{b=c}\n>a', options()),
      '<blockquote>\n<p>a</p>\n</blockquote>',
      'should support a block quote after a leaf'
    )

    t.equal(
      micromark('::a{b=c}\n```js\na', options()),
      '<pre><code class="language-js">a\n</code></pre>\n',
      'should support code (fenced) after a leaf'
    )

    t.equal(
      micromark('::a{b=c}\n    a', options()),
      '<pre><code>a\n</code></pre>',
      'should support code (indented) after a leaf'
    )

    t.equal(
      micromark('::a{b=c}\n[a]: b', options()),
      '',
      'should support a definition after a leaf'
    )

    t.equal(
      micromark('::a{b=c}\n# a', options()),
      '<h1>a</h1>',
      'should support a heading (atx) after a leaf'
    )

    t.equal(
      micromark('::a{b=c}\na\n=', options()),
      '<h1>a</h1>',
      'should support a heading (setext) after a leaf'
    )

    t.equal(
      micromark('::a{b=c}\n<!-->', options()),
      '<!-->',
      'should support html after a leaf'
    )

    t.equal(
      micromark('::a{b=c}\n* a', options()),
      '<ul>\n<li>a</li>\n</ul>',
      'should support a list after a leaf'
    )

    t.equal(
      micromark('::a{b=c}\na', options()),
      '<p>a</p>',
      'should support a paragraph after a leaf'
    )

    t.equal(
      micromark('::a{b=c}\n***', options()),
      '<hr />',
      'should support a thematic break after a leaf'
    )

    t.equal(
      micromark('>a\n::a{b=c}', options()),
      '<blockquote>\n<p>a</p>\n</blockquote>\n',
      'should support a block quote before a leaf'
    )

    t.equal(
      micromark('```js\na\n```\n::a{b=c}', options()),
      '<pre><code class="language-js">a\n</code></pre>\n',
      'should support code (fenced) before a leaf'
    )

    t.equal(
      micromark('    a\n::a{b=c}', options()),
      '<pre><code>a\n</code></pre>\n',
      'should support code (indented) before a leaf'
    )

    t.equal(
      micromark('[a]: b\n::a{b=c}', options()),
      '',
      'should support a definition before a leaf'
    )

    t.equal(
      micromark('# a\n::a{b=c}', options()),
      '<h1>a</h1>\n',
      'should support a heading (atx) before a leaf'
    )

    t.equal(
      micromark('a\n=\n::a{b=c}', options()),
      '<h1>a</h1>\n',
      'should support a heading (setext) before a leaf'
    )

    t.equal(
      micromark('<!-->\n::a{b=c}', options()),
      '<!-->\n',
      'should support html before a leaf'
    )

    t.equal(
      micromark('* a\n::a{b=c}', options()),
      '<ul>\n<li>a</li>\n</ul>\n',
      'should support a list before a leaf'
    )

    t.equal(
      micromark('a\n::a{b=c}', options()),
      '<p>a</p>\n',
      'should support a paragraph before a leaf'
    )

    t.equal(
      micromark('***\n::a{b=c}', options()),
      '<hr />\n',
      'should support a thematic break before a leaf'
    )

    t.end()
  })

  t.test('container', function (t) {
    t.equal(micromark(':::b', options()), '', 'should support a directive')

    t.equal(
      micromark(':', options()),
      '<p>:</p>',
      'should not support one colon'
    )

    t.equal(
      micromark('::', options()),
      '<p>::</p>',
      'should not support two colons not followed by an alpha'
    )

    t.equal(
      micromark(':::', options()),
      '<p>:::</p>',
      'should not support three colons not followed by an alpha'
    )

    t.equal(
      micromark(':::a', options()),
      '',
      'should support three colons followed by an alpha'
    )

    t.equal(
      micromark(':::9', options()),
      '<p>:::9</p>',
      'should not support three colons followed by a digit'
    )

    t.equal(
      micromark(':::-', options()),
      '<p>:::-</p>',
      'should not support three colons followed by a dash'
    )

    t.equal(
      micromark(':::a9', options()),
      '',
      'should support a digit in a name'
    )

    t.equal(
      micromark(':::a-', options()),
      '',
      'should support a dash in a name'
    )

    t.equal(
      micromark(':::a[', options()),
      '<p>:::a[</p>',
      'should not support a name followed by an unclosed `[`'
    )

    t.equal(
      micromark(':::a{', options()),
      '<p>:::a{</p>',
      'should not support a name followed by an unclosed `{`'
    )

    t.equal(
      micromark(':::a[b', options()),
      '<p>:::a[b</p>',
      'should not support a name followed by an unclosed `[` w/ content'
    )

    t.equal(
      micromark(':::a{b', options()),
      '<p>:::a{b</p>',
      'should not support a name followed by an unclosed `{` w/ content'
    )

    t.equal(micromark(':::a[]', options()), '', 'should support an empty label')

    t.equal(
      micromark(':::a[ \t]', options()),
      '',
      'should support a whitespace only label'
    )

    t.equal(
      micromark(':::a[\n]', options()),
      '<p>:::a[\n]</p>',
      'should not support an eol in an label'
    )

    t.equal(
      micromark(':::a[a b c]', options()),
      '',
      'should support content in an label'
    )

    t.equal(
      micromark(':::a[a *b* c]', options()),
      '',
      'should support markdown in an label'
    )

    t.equal(
      micromark(':::a[]asd', options()),
      '<p>:::a[]asd</p>',
      'should not support content after a label'
    )

    t.equal(
      micromark(':::a{}', options()),
      '',
      'should support empty attributes'
    )

    t.equal(
      micromark(':::a{ \t}', options()),
      '',
      'should support whitespace only attributes'
    )

    t.equal(
      micromark(':::a{\n}', options()),
      '<p>:::a{\n}</p>',
      'should not support an eol in attributes'
    )

    t.equal(
      micromark(':::a{a b c}', options()),
      '',
      'should support attributes'
    )

    t.equal(
      micromark(':::a{f  =\rg}', options()),
      '<p>:::a{f  =\rg}</p>',
      'should not support EOLs around initializers'
    )

    t.equal(
      micromark(':::a{b="c', options()),
      '<p>:::a{b=&quot;c</p>',
      'should not support an EOF in a quoted attribute value'
    )

    t.equal(
      micromark(':::a{b="\nc\r  d"}', options()),
      '<p>:::a{b=&quot;\nc\rd&quot;}</p>',
      'should not support EOLs in quoted attribute values'
    )

    t.equal(
      micromark(':::a{b="c"', options()),
      '<p>:::a{b=&quot;c&quot;</p>',
      'should not support an EOF after a quoted attribute value'
    )

    t.equal(
      micromark(':::a{b=c} \t ', options()),
      '',
      'should support whitespace after directives'
    )

    t.equal(
      micromark(':::a\n', options()),
      '',
      'should support no closing fence'
    )

    t.equal(
      micromark(':::a\n:::', options()),
      '',
      'should support an immediate closing fence'
    )

    t.equal(
      micromark(':::a\n:::\nb', options()),
      '<p>b</p>',
      'should support content after a closing fence'
    )

    t.equal(
      micromark(':::a\n::\nb', options()),
      '',
      'should not close w/ a “closing” fence of two colons'
    )

    t.equal(
      micromark(':::a\n::::\nb', options()),
      '<p>b</p>',
      'should close w/ a closing fence of more colons'
    )

    t.equal(
      micromark('::::a\n::::\nb', options()),
      '<p>b</p>',
      'should support more opening colons'
    )

    t.equal(
      micromark(':::::a\n::::\nb', options()),
      '',
      'should not close w/ a “closing” fence of less colons than the opening'
    )

    t.equal(
      micromark(':::a\n::: \t\nc', options()),
      '<p>c</p>',
      'should close w/ a closing fence followed by white space'
    )

    t.equal(
      micromark(':::a\n::: b\nc', options()),
      '',
      'should not close w/ a “closing” fence followed by other characters'
    )

    t.equal(
      micromark(':::a\n  :::\nc', options()),
      '<p>c</p>',
      'should close w/ an indented closing fence'
    )

    t.equal(
      micromark(':::a\n\t:::\nc', options()),
      '',
      'should not close w/ when the “closing” fence is indented at a tab size'
    )

    t.equal(
      micromark(':::a\n     :::\nc', options()),
      '',
      'should not close w/ when the “closing” fence is indented more than a tab size'
    )

    t.equal(
      micromark(':::a\n\n  \n\ta', options()),
      '',
      'should support blank lines in content'
    )

    t.equal(
      micromark(':::a\n\ta\n', options()),
      '',
      'should support an EOL EOF'
    )

    t.equal(
      micromark('  :::a\n  b\n  :::\nc', options()),
      '<p>c</p>',
      'should support an indented directive'
    )

    t.equal(
      micromark('  :::a\n\t:::\nc', options()),
      '',
      'should still not close an indented directive when the “closing” fence is indented a tab size'
    )

    t.equal(
      micromark(':::a\n:::\n>a', options()),
      '<blockquote>\n<p>a</p>\n</blockquote>',
      'should support a block quote after a container'
    )

    t.equal(
      micromark(':::a\n:::\n```js\na', options()),
      '<pre><code class="language-js">a\n</code></pre>\n',
      'should support code (fenced) after a container'
    )

    t.equal(
      micromark(':::a\n:::\n    a', options()),
      '<pre><code>a\n</code></pre>',
      'should support code (indented) after a container'
    )

    t.equal(
      micromark(':::a\n:::\n[a]: b', options()),
      '',
      'should support a definition after a container'
    )

    t.equal(
      micromark(':::a\n:::\n# a', options()),
      '<h1>a</h1>',
      'should support a heading (atx) after a container'
    )

    t.equal(
      micromark(':::a\n:::\na\n=', options()),
      '<h1>a</h1>',
      'should support a heading (setext) after a container'
    )

    t.equal(
      micromark(':::a\n:::\n<!-->', options()),
      '<!-->',
      'should support html after a container'
    )

    t.equal(
      micromark(':::a\n:::\n* a', options()),
      '<ul>\n<li>a</li>\n</ul>',
      'should support a list after a container'
    )

    t.equal(
      micromark(':::a\n:::\na', options()),
      '<p>a</p>',
      'should support a paragraph after a container'
    )

    t.equal(
      micromark(':::a\n:::\n***', options()),
      '<hr />',
      'should support a thematic break after a container'
    )

    t.equal(
      micromark('>a\n:::a\nb', options()),
      '<blockquote>\n<p>a</p>\n</blockquote>\n',
      'should support a block quote before a container'
    )

    t.equal(
      micromark('```js\na\n```\n:::a\nb', options()),
      '<pre><code class="language-js">a\n</code></pre>\n',
      'should support code (fenced) before a container'
    )

    t.equal(
      micromark('    a\n:::a\nb', options()),
      '<pre><code>a\n</code></pre>\n',
      'should support code (indented) before a container'
    )

    t.equal(
      micromark('[a]: b\n:::a\nb', options()),
      '',
      'should support a definition before a container'
    )

    t.equal(
      micromark('# a\n:::a\nb', options()),
      '<h1>a</h1>\n',
      'should support a heading (atx) before a container'
    )

    t.equal(
      micromark('a\n=\n:::a\nb', options()),
      '<h1>a</h1>\n',
      'should support a heading (setext) before a container'
    )

    t.equal(
      micromark('<!-->\n:::a\nb', options()),
      '<!-->\n',
      'should support html before a container'
    )

    t.equal(
      micromark('* a\n:::a\nb', options()),
      '<ul>\n<li>a</li>\n</ul>\n',
      'should support a list before a container'
    )

    t.equal(
      micromark('a\n:::a\nb', options()),
      '<p>a</p>\n',
      'should support a paragraph before a container'
    )

    t.equal(
      micromark('***\n:::a\nb', options()),
      '<hr />\n',
      'should support a thematic break before a container'
    )

    t.end()
  })

  t.end()
})

test('micromark-extension-directive (compile)', function (t) {
  t.equal(
    micromark(
      [
        ':abbr',
        ':abbr[HTML]',
        ':abbr{title="HyperText Markup Language"}',
        ':abbr[HTML]{title="HyperText Markup Language"}'
      ].join('\n\n'),
      options({abbr: abbr})
    ),
    [
      '<p><abbr></abbr></p>',
      '<p><abbr>HTML</abbr></p>',
      '<p><abbr title="HyperText Markup Language"></abbr></p>',
      '<p><abbr title="HyperText Markup Language">HTML</abbr></p>'
    ].join('\n'),
    'should support a directives (abbr)'
  )

  t.equal(
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
      options({youtube: youtube})
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

  t.equal(
    micromark(
      ':youtube[Cat in a box]\n:br',
      options({youtube: youtube, '*': h})
    ),
    '<p><youtube>Cat in a box</youtube>\n<br></p>',
    'should support fall through directives (`*`)'
  )

  t.end()
})

test('content', function (t) {
  t.equal(
    micromark(':abbr[x\\&y&amp;z]', options({abbr: abbr})),
    '<p><abbr>x&amp;y&amp;z</abbr></p>',
    'should support character escapes and character references in label'
  )

  t.equal(
    micromark(':abbr[x\\[y\\]z]', options({abbr: abbr})),
    '<p><abbr>x[y]z</abbr></p>',
    'should support escaped brackets in a label'
  )

  t.equal(
    micromark(':abbr[a\nb\rc]', options({abbr: abbr})),
    '<p><abbr>a\nb\rc</abbr></p>',
    'should support EOLs in a label'
  )

  t.equal(
    micromark(':abbr[\na\r]', options({abbr: abbr})),
    '<p><abbr>\na\r</abbr></p>',
    'should support EOLs at the edges of a label'
  )

  t.equal(
    micromark(':abbr[a *b* **c** d]', options({abbr: abbr})),
    '<p><abbr>a <em>b</em> <strong>c</strong> d</abbr></p>',
    'should support markdown in a label'
  )

  t.equal(
    micromark(':abbr{title=a&apos;b}', options({abbr: abbr})),
    '<p><abbr title="a\'b"></abbr></p>',
    'should support character references in unquoted attribute values'
  )

  t.equal(
    micromark(':abbr{title="a&apos;b"}', options({abbr: abbr})),
    '<p><abbr title="a\'b"></abbr></p>',
    'should support character references in double attribute values'
  )

  t.equal(
    micromark(":abbr{title='a&apos;b'}", options({abbr: abbr})),
    '<p><abbr title="a\'b"></abbr></p>',
    'should support character references in single attribute values'
  )

  t.equal(
    micromark(':abbr{title="a&somethingelse;b"}', options({abbr: abbr})),
    '<p><abbr title="a&amp;somethingelse;b"></abbr></p>',
    'should support unknown character references in attribute values'
  )

  t.equal(
    micromark(':span{a\nb}', options({'*': h})),
    '<p><span a="" b=""></span></p>',
    'should support EOLs between attributes'
  )

  t.equal(
    micromark(':span{\na\n}', options({'*': h})),
    '<p><span a=""></span></p>',
    'should support EOLs at the edges of attributes'
  )

  t.equal(
    micromark(':span{a\r= b}', options({'*': h})),
    '<p><span a="b"></span></p>',
    'should support EOLs before initializer'
  )

  t.equal(
    micromark(':span{a=\r\nb}', options({'*': h})),
    '<p><span a="b"></span></p>',
    'should support EOLs after initializer'
  )

  t.equal(
    micromark(':span{a=b\nc}', options({'*': h})),
    '<p><span a="b" c=""></span></p>',
    'should support EOLs between an unquoted attribute value and a next attribute name'
  )

  t.equal(
    micromark(':span{a="b\nc"}', options({'*': h})),
    '<p><span a="b\nc"></span></p>',
    'should support EOLs in a double quoted attribute value'
  )

  t.equal(
    micromark(":span{a='b\nc'}", options({'*': h})),
    '<p><span a="b\nc"></span></p>',
    'should support EOLs in a single quoted attribute value'
  )

  t.equal(
    micromark(':span{#a#b}', options({'*': h})),
    '<p><span id="b"></span></p>',
    'should support `id` shortcuts'
  )

  t.equal(
    micromark(':span{id=a id="b" #c#d}', options({'*': h})),
    '<p><span id="d"></span></p>',
    'should support `id` shortcuts after `id` attributes'
  )

  t.equal(
    micromark(':span{.a.b}', options({'*': h})),
    '<p><span class="a b"></span></p>',
    'should support `class` shortcuts'
  )

  t.equal(
    micromark(':span{class=a class="b c" .d.e}', options({'*': h})),
    '<p><span class="a b c d e"></span></p>',
    'should support `class` shortcuts after `class` attributes'
  )

  t.equal(
    micromark('::::div{.big}\n:::div{.small}\nText', options({'*': h})),
    '<div class="big">\n<div class="small">\n<p>Text</p>\n</div>\n</div>',
    'should support container directives in container directives'
  )

  t.equal(
    micromark(':::div{.big}\n::hr{.small}', options({'*': h})),
    '<div class="big">\n<hr class="small">\n</div>',
    'should support leaf directives in container directives'
  )

  t.equal(
    micromark(':::div{.big}\n:b[Text]', options({'*': h})),
    '<div class="big">\n<p><b>Text</b></p>\n</div>',
    'should support text directives in container directives'
  )

  t.end()
})

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

function youtube(d) {
  var attrs = d.attributes || {}
  var v = attrs.v
  var list
  var prop

  if (!v) return false

  list = [
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

function h(d) {
  var content = d.content || d.label
  var attrs = d.attributes || {}
  var list = []
  var prop

  for (prop in attrs) {
    list.push(this.encode(prop) + '="' + this.encode(attrs[prop]) + '"')
  }

  this.tag('<' + d.name)
  if (list.length) this.tag(' ' + list.join(' '))
  this.tag('>')

  if (content) {
    if (d.type === 'containerDirective') this.lineEndingIfNeeded()
    this.raw(content)
    if (d.type === 'containerDirective') this.lineEndingIfNeeded()
  }

  if (!voids.includes(d.name)) this.tag('</' + d.name + '>')
}

function options(options) {
  return {
    allowDangerousHtml: true,
    extensions: [syntax()],
    htmlExtensions: [html(options)]
  }
}
