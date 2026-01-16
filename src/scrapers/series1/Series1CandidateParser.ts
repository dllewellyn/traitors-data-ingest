import * as cheerio from "cheerio";
import { TableParser } from "../../types";
import { Candidate } from "../../domain/models";
import { Role } from "../../domain/enums";
import { normalizeName } from "../../utils/dataNormalizers";
import { parseFinishText } from "../../utils/statusParser";

/**
 * Parses the HTML from the Series 1 Wikipedia page to extract candidate data.
 */
export class Series1CandidateParser implements TableParser<Candidate> {
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
      console.warn("Could not find the contestants table.");
      return [];
    }

    table
      .find("tbody tr")
      .slice(1)
      .each((i, row) => {
        const columns = $(row).find("th, td");
        if (columns.length < 6) {
          console.warn(`Skipping malformed row: ${$(row).text()}`);
          return;
        }

        const name = normalizeName($(columns[0]).text().trim());
        const age = parseInt($(columns[1]).text().trim(), 10);
        const hometown = $(columns[2]).text().trim();
        const occupation = $(columns[3]).text().trim();
        const affiliationText = $(columns[4]).text().trim();
        const finishText = $(columns[5]).text().trim();

        const parsedFinish = parseFinishText(finishText);
        const originalRole =
          affiliationText === "Traitor" ? Role.Traitor : Role.Faithful;

        const roundStates = [];
        if (parsedFinish) {
          roundStates.push({
            ...parsedFinish,
            role: originalRole,
          });
        }

        candidates.push({
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
