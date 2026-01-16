import * as cheerio from 'cheerio';
import { Element } from 'domhandler';

export type IHtmlElement = cheerio.Cheerio<Element>;
export type IHtmlDocument = cheerio.CheerioAPI;

export interface IHtmlParser {
  parse(html: string): IHtmlDocument;
}

export class HtmlParser implements IHtmlParser {
  public parse(html: string): IHtmlDocument {
    return cheerio.load(html);
  }
}
