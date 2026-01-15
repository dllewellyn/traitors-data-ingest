import { CheerioHtmlParser, IHtmlParser } from './HtmlParser';

describe('CheerioHtmlParser', () => {
  let parser: IHtmlParser;

  beforeEach(() => {
    parser = new CheerioHtmlParser();
  });

  it('should throw an error if extractTable is called before load', () => {
    expect(() => parser.extractTable('table')).toThrow('HTML content not loaded. Call load() first.');
  });

  it('should throw an error if extractLinks is called before load', () => {
    expect(() => parser.extractLinks()).toThrow('HTML content not loaded. Call load() first.');
  });

  describe('with loaded HTML', () => {
    const mockHtml = `
      <html>
        <body>
          <table class="test-table">
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
            </tr>
            <tr>
              <td>Data 1</td>
              <td>Data 2</td>
            </tr>
          </table>
          <a href="/link1">Link 1</a>
          <a href="/link2">  Link 2  </a>
          <a>No href</a>
        </body>
      </html>
    `;

    beforeEach(() => {
      parser.load(mockHtml);
    });

    it('should extract table data correctly', () => {
      const expectedData = [
        ['Header 1', 'Header 2'],
        ['Data 1', 'Data 2'],
      ];
      const tableData = parser.extractTable('.test-table');
      expect(tableData).toEqual(expectedData);
    });

    it('should return an empty array if the table selector does not match', () => {
      const tableData = parser.extractTable('.non-existent-table');
      expect(tableData).toEqual([]);
    });

    it('should extract links correctly', () => {
      const expectedLinks = [
        { href: '/link1', text: 'Link 1' },
        { href: '/link2', text: 'Link 2' },
      ];
      const links = parser.extractLinks();
      expect(links).toEqual(expectedLinks);
    });
  });
});
