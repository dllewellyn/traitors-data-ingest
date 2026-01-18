import * as cheerio from "cheerio";
import { TableParser } from "../../types";
import { Candidate, RoundState } from "../../domain/models";
import { Role } from "../../domain/enums";
import { normalizeName } from "../../utils/dataNormalizers";
import { parseFinishText } from "../../utils/statusParser";

export class Series4CandidateParser implements TableParser<Candidate> {
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
        // We expect at least 5 columns (last column might be rowspanned "Participating")
        if (columns.length < 5) {
          return;
        }

        const name = normalizeName($(columns[0]).text().trim());
        if (!name) return;

        const age = parseInt($(columns[1]).text().trim(), 10);
        const location = $(columns[2]).text().trim();
        const job = $(columns[3]).text().trim();
        const affiliationText = normalizeName($(columns[4]).text().trim());
        const finishText =
          columns.length > 5 ? $(columns[5]).text().trim() : "";

        let originalRole: Role;
        if (affiliationText === "Traitor") {
          originalRole = Role.Traitor;
        } else if (affiliationText === "Faithful") {
          originalRole = Role.Faithful;
        } else {
          // Handle "None" or other roles by defaulting to Faithful
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
            role: originalRole,
          });
        }

        candidates.push({
          series: 4,
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
