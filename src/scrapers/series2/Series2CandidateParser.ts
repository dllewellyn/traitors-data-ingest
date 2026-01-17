import * as cheerio from "cheerio";
import { TableParser } from "../../types";
import { Candidate, RoundState } from "../../domain/models";
import { Role } from "../../domain/enums";
import { normalizeName } from "../../utils/dataNormalizers";
import { parseFinishText } from "../../utils/statusParser";

/**
 * Parses the HTML from the Series 2 Wikipedia page to extract candidate data.
 */
export class Series2CandidateParser implements TableParser<Candidate> {
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
      .slice(1) // Skip header row
      .each((i, row) => {
        const columns = $(row).find("th, td");
        // We expect at least 6 columns
        if (columns.length < 6) {
          // Some rows might be metadata or hidden
          return;
        }

        const name = normalizeName($(columns[0]).text().trim());
        // If name is empty, skip
        if (!name) return;

        const age = parseInt($(columns[1]).text().trim(), 10);
        const hometown = $(columns[2]).text().trim();
        const occupation = $(columns[3]).text().trim();
        // Normalize affiliation text
        const affiliationText = normalizeName($(columns[4]).text().trim());
        const finishText = $(columns[5]).text().trim();

        let originalRole: Role;
        if (affiliationText === "Traitor") {
          originalRole = Role.Traitor;
        } else if (affiliationText === "Faithful") {
          originalRole = Role.Faithful;
        } else {
          // It's possible there are other roles or annotations
          // In Series 2, one player was "Recruited Traitor" later but usually "Affiliation" shows original role or final role?
          // The table shows "Traitor" or "Faithful".
          // If a Faithful becomes a Traitor, Wikipedia usually lists "Faithful" then "Traitor" or notes it.
          // In the grep output for Harry, it says "Traitor".
          // Let's assume standard roles. If unknown, log warn.
          console.warn(
            `Row ${i}: Unknown role '${affiliationText}' for ${name}. Defaulting to Faithful.`
          );
          originalRole = Role.Faithful;
        }

        const parsedFinish = parseFinishText(finishText);

        const roundStates: RoundState[] = [];
        if (parsedFinish) {
          roundStates.push({
            ...parsedFinish,
            role: originalRole, // Note: This might be inaccurate if they switched roles, but we start with original.
            // Ideally we get role changes from the progress table.
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
