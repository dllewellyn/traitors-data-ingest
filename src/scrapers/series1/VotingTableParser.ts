import { Banishment, Episode, Murder, Vote } from "../../domain/models";
import { TableParser } from "../../types";
import { IHtmlDocument, IHtmlElement } from "../../services/HtmlParser";
import { HtmlParser } from "../../services/HtmlParser";

interface EliminationHistory {
  episodes: Episode[];
  votes: Vote[];
  banishments: Banishment[];
  murders: Murder[];
}

export class VotingTableParser
  implements TableParser<EliminationHistory>
{
  private htmlParser: HtmlParser = new HtmlParser();

  public parse(html: string): EliminationHistory[] {
    const doc: IHtmlDocument = this.htmlParser.parse(html);
    const eliminationHistory: EliminationHistory = {
      episodes: [],
      votes: [],
      banishments: [],
      murders: [],
    };

    const heading = doc("#Elimination_history");
    if (heading.length === 0) {
      throw new Error("Elimination history heading not found");
    }

    const table = heading.parent().nextAll("table.wikitable").first();
    if (table.length === 0) {
      throw new Error("Elimination history table not found");
    }

    const rows = table.find("tbody tr");
    const headerCells = table.find("thead tr th");

    // This is a placeholder implementation.
    // The actual implementation will need to be much more complex to handle
    // the merged cells and dynamic columns.
    console.warn(
      "The VotingTableParser is not yet fully implemented. This is a placeholder.",
    );

    return [eliminationHistory];
  }
}
