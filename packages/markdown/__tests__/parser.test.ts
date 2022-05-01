import { describe, expect, it } from 'vitest'
import { render } from '../libs/parser'

describe('Markdown Parser', () => {
  it('can render plain text', () => {
    const result = render('Hello World!')

    expect(result).toBe('<p>Hello World!</p>\n')
  })
  it('can render markdown', () => {
    const result = render('# Hello World!')

    expect(result).toBe('<h1>Hello World!</h1>\n')
  })
  it('can render allowed dom', () => {
    const result = render(`
plain text
<h1>h1</h1>
<br />
<a href="https://example.com">a</a>
<img src="https://example.com/example.png" />`)

    expect(result).toMatchSnapshot()
  })
  it('can filter xss dom', () => {
    const result = render(`
<script>alert(1)</script>
<style>body{color:red}</style>
<img src=x onerror=alert(1)>`)

    expect(result).toMatchSnapshot()
  })
  it('can add hint to link', () => {
    const result = render('[Example](https://example.com/foo)')

    expect(result).toMatchSnapshot()
  })
  it('can render pure link', () => {
    const result = render(`
https://example.com
av926598384
BV11T4y1j7ni
ac17966946
sm38945360
youtube-zOmbs-UMwx0
mylist/65545020`)

    expect(result).toMatchSnapshot()
  })
  it('should not filter <link>', () => {
    const result = render('<https://example.com>')

    expect(result).toMatchSnapshot()
  })
})
