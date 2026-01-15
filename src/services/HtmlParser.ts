import * as cheerio from 'cheerio';

/**
 * @interface IHtmlParser
 * @description Defines the contract for an HTML parsing service.
 */
export interface IHtmlParser {
  /**
   * Loads an HTML string into the parser.
   * @param {string} html The HTML content to parse.
   */
  load(html: string): void;

  /**
   * Extracts the entire text content from a table specified by a selector.
   * The result is a 2D array of strings representing the table rows and cells.
   *
   * @param {string} selector The CSS selector for the table.
   * @returns {string[][]} A 2D array of the table's text content.
   */
  extractTable(selector: string): string[][];

  /**
   * Extracts all links (href and text) from the document.
   *
   * @returns {{ href: string; text: string }[]} An array of link objects.
   */
  extractLinks(): { href: string; text: string }[];
}

/**
 * @class CheerioHtmlParser
 * @description An implementation of IHtmlParser using the Cheerio library.
 */
export class CheerioHtmlParser implements IHtmlParser {
  private $: cheerio.CheerioAPI | null = null;

  public load(html: string): void {
    this.$ = cheerio.load(html);
  }

  public extractTable(selector: string): string[][] {
    if (!this.$) {
      throw new Error('HTML content not loaded. Call load() first.');
    }
    const $ = this.$;

    const tableData: string[][] = [];
    const table = $(selector);

    table.find('tr').each((rowIndex, row) => {
      const rowData: string[] = [];
      $(row)
        .find('th, td')
        .each((colIndex, cell) => {
          rowData.push($(cell).text().trim());
        });
      tableData.push(rowData);
    });

    return tableData;
  }

  public extractLinks(): { href: string; text: string }[] {
    if (!this.$) {
      throw new Error('HTML content not loaded. Call load() first.');
    }
    const $ = this.$;

    const links: { href: string; text: string }[] = [];
    $('a').each((index, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      if (href) {
        links.push({ href, text });
      }
    });

    return links;
  }
}
