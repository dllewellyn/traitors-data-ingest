import * as cheerio from "cheerio";
import { TableParser, ILogger } from "../../types";
import { Candidate, RoundState } from "../../domain/models";
import { Role } from "../../domain/enums";
import { normalizeName } from "../../utils/dataNormalizers";
import { parseFinishText } from "../../utils/statusParser";
import { ConsoleLogger } from "../../utils/ConsoleLogger";

/**
 * Parses the "Contestants" table from the US Series 2 Wikipedia page.
 */
export class SeriesUS2CandidateParser implements TableParser<Candidate> {
  constructor(private logger: ILogger = new ConsoleLogger()) {}

  /**
   * Parses the HTML content to extract candidate information.
   * @param html The HTML string to parse.
   * @returns An array of Candidate objects.
   */
  parse(html: string): Candidate[] {
    const $ = cheerio.load(html);
    const candidates: Candidate[] = [];

    // Look for the "Contestants" section
    const contestantsHeading = $("#Contestants").parent();
    const table = contestantsHeading.nextAll("table").first();

    if (table.length === 0) {
      this.logger.warn("Could not find the contestants table.");
      return [];
    }

    table
      .find("tbody tr")
      .slice(1) // Skip header row
      .each((i, row) => {
        const columns = $(row).find("th, td");
        // Expecting at least 6 columns: Name, Age, From, Notability, Affiliation, Finish
        if (columns.length < 6) {
          return;
        }

        const name = normalizeName($(columns[0]).text().trim());
        if (!name) return;

        const age = parseInt($(columns[1]).text().trim(), 10);
        const location = $(columns[2]).text().trim();
        const job = $(columns[3]).text().trim(); // Notability/Debut series
        const affiliationText = normalizeName($(columns[4]).text().trim());
        const finishText = $(columns[5]).text().trim();

        let originalRole: Role;
        if (affiliationText === "Traitor") {
          originalRole = Role.Traitor;
        } else if (affiliationText === "Faithful") {
          originalRole = Role.Faithful;
        } else {
          this.logger.warn("Unknown role. Defaulting to Faithful.", {
            rowIndex: i,
            affiliationText,
            name,
          });
          originalRole = Role.Faithful;
        }

        const parsedFinish = parseFinishText(finishText);

        const roundStates: RoundState[] = [];
        if (parsedFinish) {
          roundStates.push({
            ...parsedFinish,
            role: originalRole,
          });
        }

        candidates.push({
          series: 2, // US Series 2
          id: i,
          name,
          age,
          job,
          location,
          originalRole,
          roundStates,
        });
      });

    return candidates;
  }
}
