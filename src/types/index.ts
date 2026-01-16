/**
 * Defines the contract for a generic table parser.
 * @template T The type of object the parser will return.
 */
export interface TableParser<T> {
  /**
   * Parses an HTML string and returns an array of objects of type T.
   * @param html The HTML string to parse.
   * @returns An array of objects of type T.
   */
  parse(html: string): T[];
}
