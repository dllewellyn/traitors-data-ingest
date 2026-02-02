import * as cheerio from "cheerio";
import { TableParser, ILogger } from "../../types";
import { Candidate, RoundState } from "../../domain/models";
import { Role } from "../../domain/enums";
import { normalizeName } from "../../utils/dataNormalizers";
import { parseFinishText } from "../../utils/statusParser";
import { ConsoleLogger } from "../../utils/ConsoleLogger";

/**
 * Parses the HTML from the Series 1 Wikipedia page to extract candidate data.
 */
export class Series1CandidateParser implements TableParser<Candidate> {
  constructor(private logger: ILogger = new ConsoleLogger()) {}

  /**
   * Parses the HTML content and returns an array of candidates.
   * @param html The HTML string to parse.
   * @returns An array of `Candidate` objects.
   */
  parse(html: string): Candidate[] {
    const $ = cheerio.load(html);
    const candidates: Candidate[] = [];

    const contestantsHeading = $("#Contestants").parent();
    const table = contestantsHeading.nextAll("table").first();

    if (table.length === 0) {
      this.logger.warn("Could not find the contestants table.");
      return [];
    }

    table
      .find("tbody tr")
      .slice(1)
      .each((i, row) => {
        const columns = $(row).find("th, td");
        if (columns.length < 6) {
          this.logger.warn("Skipping malformed row", { rowText: $(row).text() });
          return;
        }

        const name = normalizeName($(columns[0]).text().trim());
        const age = parseInt($(columns[1]).text().trim(), 10);
        const hometown = $(columns[2]).text().trim();
        const occupation = $(columns[3]).text().trim();
        // Normalize affiliation text to handle annotations like "Traitor[a]"
        const affiliationText = normalizeName($(columns[4]).text().trim());
        const finishText = $(columns[5]).text().trim();

        let originalRole: Role;
        if (affiliationText === "Traitor") {
          originalRole = Role.Traitor;
        } else if (affiliationText === "Faithful") {
          originalRole = Role.Faithful;
        } else {
          this.logger.warn("Skipping row with unknown role", { affiliationText });
          return;
        }

        const parsedFinish = parseFinishText(finishText);
        if (!parsedFinish && finishText) {
          this.logger.warn("Skipping row with unhandled status", { finishText });
          return;
        }

        const roundStates: RoundState[] = [];
        if (parsedFinish) {
          roundStates.push({
            ...parsedFinish,
            role: originalRole,
          });
        }

        candidates.push({
          series: 1,
          id: i,
          name,
          age,
          job: occupation,
          location: hometown,
          originalRole,
          roundStates,
        });
      });

    return candidates;
  }
}
