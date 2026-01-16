import { HtmlParser } from './HtmlParser';

describe('HtmlParser', () => {
  const html = `
    <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <div id="main">
          <p class="content">First paragraph</p>
          <p class="content">Second paragraph</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
        <div id="footer">Footer</div>
      </body>
    </html>
  `;

  it('should parse HTML and find elements by ID', () => {
    const parser = new HtmlParser();
    const doc = parser.parse(html);
    const mainDiv = doc('#main');

    expect(mainDiv).toHaveLength(1);
    expect(mainDiv.text()).toContain('First paragraph');
  });

  it('should parse HTML and find elements by class', () => {
    const parser = new HtmlParser();
    const doc = parser.parse(html);
    const paragraphs = doc('.content');

    expect(paragraphs).toHaveLength(2);
    expect(paragraphs.first().text()).toBe('First paragraph');
    expect(paragraphs.last().text()).toBe('Second paragraph');
  });

  it('should parse HTML and find elements by tag', () => {
    const parser = new HtmlParser();
    const doc = parser.parse(html);
    const listItems = doc('li');

    expect(listItems).toHaveLength(2);
    expect(listItems.first().text()).toBe('Item 1');
  });

  it('should handle malformed HTML without crashing', () => {
    const parser = new HtmlParser();
    const malformedHtml = '<div><p>Unclosed paragraph';

    expect(() => parser.parse(malformedHtml)).not.toThrow();

    const doc = parser.parse(malformedHtml);
    const p = doc('p');
    expect(p).toHaveLength(1);
    expect(p.text()).toBe('Unclosed paragraph');
  });

  it('should return an attribute of an element', () => {
    const parser = new HtmlParser();
    const doc = parser.parse(html);
    const mainDiv = doc('#main');

    expect(mainDiv.attr('id')).toBe('main');
  });
});
