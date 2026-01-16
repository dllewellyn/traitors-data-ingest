import * as cheerio from "cheerio";
import { Element } from "domhandler";

// By using type aliases for cheerio's own types, we create a clear abstraction
// layer without reinventing the wheel. This decouples our application from the
// cheerio library at the interface level. If we were to switch to another parser,
// we would only need to update the HtmlParser implementation.
export type IHtmlElement = cheerio.Cheerio<Element>;
export type IHtmlDocument = cheerio.CheerioAPI;

/**
 * Defines the contract for a service that parses HTML strings into a traversable document object.
 */
export interface IHtmlParser {
  /**
   * Parses an HTML string into a traversable document object.
   * @param html The HTML string to parse.
   * @returns An IHtmlDocument instance, which is a CheerioAPI object.
   */
  parse(html: string): IHtmlDocument;
}

export class HtmlParser implements IHtmlParser {
  public parse(html: string): IHtmlDocument {
    return cheerio.load(html);
  }
}
