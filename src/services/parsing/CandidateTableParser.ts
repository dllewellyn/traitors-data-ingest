import { Candidate } from "../../domain/models";
import { TableParser } from "../../types";
import { IHtmlDocument, IHtmlParser } from "../HtmlParser";
import { Role } from "../../domain/enums";

export class CandidateTableParser implements TableParser<Candidate> {
  public constructor(private readonly htmlParser: IHtmlParser) {}

  public parse(html: string): Candidate[] {
    const document = this.htmlParser.parse(html);
    const contestantsTable = this.findContestantsTable(document);
    if (!contestantsTable.length) {
      throw new Error("Could not find the 'Contestants' table.");
    }

    const rows = contestantsTable.find("tbody tr");
    const candidates: Candidate[] = [];

    rows.each((index, rowElement) => {
      const row = document(rowElement);
      const cells = row.find("td");

      // Skip header rows or rows that don't have enough cells
      if (cells.length < 4) {
        // A proper logger isn't yet available. Console is used for now to provide visibility into recoverable parsing errors.
        // eslint-disable-next-line no-console
        console.warn(
          `Skipping row ${index + 1}: Expected at least 4 cells, but found ${
            cells.length
          }.`
        );
        return;
      }

      const name = this.normalizeText(cells.eq(0).text());
      const ageText = this.normalizeText(cells.eq(1).text());
      const location = this.normalizeText(cells.eq(2).text());
      const job = this.normalizeText(cells.eq(3).text());

      // Simple validation to ensure we're parsing a valid row
      const age = parseInt(ageText, 10);
      if (!name || isNaN(age)) {
        // A proper logger isn't yet available. Console is used for now to provide visibility into recoverable parsing errors.
        // eslint-disable-next-line no-console
        console.warn(
          `Skipping row ${
            index + 1
          }: Failed validation. Name: "${name}", Age: "${ageText}".`
        );
        return;
      }

      candidates.push({
        series: 1, // Defaulting to 1 for this generic parser, though it should ideally be injected
        id: -1, // Placeholder ID
        name,
        age,
        location,
        job,
        originalRole: Role.Faithful, // Placeholder Role
        roundStates: [], // To be populated by another parser
      });
    });

    return candidates;
  }

  private findContestantsTable(document: IHtmlDocument) {
    // Find the H2 heading with the text "Contestants"
    const heading = document("h2").filter((_, el) => {
      const text = document(el).text();
      return text.trim().toLowerCase() === "contestants";
    });

    // The table is expected to be the next sibling element
    return heading.next("table");
  }

  /**
   * Removes extra whitespace and citation brackets (e.g., [1], [a])
   */
  private normalizeText(text: string): string {
    return text.replace(/\[\w+\]/g, "").trim();
  }
}
