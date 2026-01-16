import { IHtmlDocument, IHtmlElement } from "../../services/HtmlParser";
import { Candidate } from "../../domain/models";
import { TableParser } from "../../types";
import { normalizeName } from "../../utils/dataNormalizers";
import { Role } from "../../domain/enums";
import { HtmlParser } from "../../services/HtmlParser";

export class CandidateTableParser implements TableParser<Candidate> {
  private htmlParser: HtmlParser = new HtmlParser();

  public parse(html: string): Candidate[] {
    const doc: IHtmlDocument = this.htmlParser.parse(html);
    const candidates: Candidate[] = [];

    const heading = doc("#Contestants");
    if (heading.length === 0) {
      throw new Error("Contestants heading not found");
    }

    const table = heading.parent().nextAll("table.wikitable").first();
    if (table.length === 0) {
      throw new Error("Contestants table not found");
    }

    const rows = table.find("tbody tr");

    // Skip the header row
    for (let i = 1; i < rows.length; i++) {
      const row: IHtmlElement = doc(rows[i]);
      const cells = row.find("th, td");

      if (cells.length < 5) {
        // Malformed row, log a warning and skip
        console.warn(`Skipping malformed row at index ${i}`);
        continue;
      }

      const name = normalizeName(doc(cells[0]).text());
      const age = parseInt(doc(cells[1]).text() || "0", 10);
      const location = doc(cells[2]).text().trim();
      const job = doc(cells[3]).text().trim();
      const status = doc(cells[4]).text().trim();

      const role = status === "Traitor" ? Role.Traitor : Role.Faithful;

      candidates.push({
        id: i, // Temporary ID
        name,
        age,
        job,
        location,
        originalRole: role,
        roundStates: [],
      });
    }

    return candidates;
  }
}
