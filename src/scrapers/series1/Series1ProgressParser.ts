import * as cheerio from "cheerio";
import { TableParser } from "../../types";
import { CandidateProgressRow } from "../types";
import {
  normalizeName,
  normalizeGameStatus,
} from "../../utils/dataNormalizers";

/**
 * Parses the HTML from the Series 1 Wikipedia page to extract candidate progress data.
 * Handles the "Elimination history" table which contains voting history and status.
 */
export class Series1ProgressParser
  implements TableParser<CandidateProgressRow>
{
  /**
   * Parses the HTML content and returns an array of candidate progress rows.
   * @param html The HTML string to parse.
   * @returns An array of `CandidateProgressRow` objects.
   */
  parse(html: string): CandidateProgressRow[] {
    const $ = cheerio.load(html);
    const rows: CandidateProgressRow[] = [];

    // Find the Elimination history table
    const heading = $("#Elimination_history").parent();
    const table = heading.nextAll("table").first();

    if (table.length === 0) {
      console.warn("Could not find the Elimination history table.");
      return [];
    }

    // 1. Identify Episodes from Headers
    const episodes: number[] = [];
    const allRows = table.find("tbody tr");
    let episodeHeaderRowIndex = -1;

    // Find the header row containing numbers
    allRows.each((i, row) => {
      if (episodeHeaderRowIndex !== -1) return;

      const cells = $(row).find("th");
      let hasNumbers = false;
      cells.each((j, cell) => {
        if (/^\d+$/.test($(cell).text().trim())) {
          hasNumbers = true;
        }
      });

      if (hasNumbers) {
        episodeHeaderRowIndex = i;
        cells.each((j, cell) => {
          const $cell = $(cell);
          const text = $cell.text().trim();
          if (/^\d+$/.test(text)) {
            const epNum = parseInt(text, 10);
            const colspan = parseInt($cell.attr("colspan") || "1", 10);
            for (let k = 0; k < colspan; k++) {
              episodes.push(epNum);
            }
          }
        });
      }
    });

    if (episodes.length === 0) {
      console.warn("Could not find episode headers.");
      return [];
    }
    // 2. Parse Rows with Rowspan Tracking
    // pendingSpans[episodeIndex] = { rowsLeft: number, status: string }
    const pendingSpans: { rowsLeft: number; status: string }[] = new Array(
      episodes.length
    ).fill(null);

    // Iterate rows starting after the header
    allRows.slice(episodeHeaderRowIndex + 1).each((i, row) => {
      const tr = $(row);

      // Identify if this is a Candidate row
      // We look for a th with scope="row" (standard for wikitable row headers)
      // or check the text against metadata keywords.
      let nameCell = tr.find("th[scope='row']").first();
      if (nameCell.length === 0) {
        nameCell = tr.find("th").first();
      }

      const nameRaw = nameCell.text().trim();

      // Filter out non-candidate rows (Metadata rows)
      const metadataKeywords = [
        "Traitors'",
        "Decision",
        "Murder",
        "Immune",
        "Banishment",
        "Vote",
        "Episode",
      ];
      if (!nameRaw || metadataKeywords.some((kw) => nameRaw.includes(kw))) {
        return;
      }

      const name = normalizeName(nameRaw);
      const progress: Record<number, string> = {};

      // Data cells are td elements.
      // We select all td elements that follow the name header cell.
      // This avoids picking up colored status bars that precede the name.
      const dataCells = nameCell.nextAll("td");

      let cellCursor = 0;

      for (let epIdx = 0; epIdx < episodes.length; epIdx++) {
        const episodeNum = episodes[epIdx];

        // Check pending rowspan
        if (pendingSpans[epIdx] && pendingSpans[epIdx].rowsLeft > 0) {
          progress[episodeNum] = pendingSpans[epIdx].status;
          pendingSpans[epIdx].rowsLeft--;
          continue;
        }

        if (cellCursor >= dataCells.length) {
          break;
        }

        const cell = $(dataCells[cellCursor]);
        cellCursor++;

        const rawText = cell.text();
        let status = normalizeGameStatus(rawText);

        // Inference: if status looks like a name (not a known keyword), assume Safe
        const knownStatuses = [
          "Safe",
          "Banished",
          "Murdered",
          "Traitor",
          "Faithful",
          "Winner",
          "RunnerUp",
        ];
        // Note: normalizeGameStatus already handles "No vote" -> "Safe"
        // and "Eliminated" -> "Banished".

        // Logic to infer "Safe" status from unknown text (votes) has been removed
        // to allow the DataMerger to process the raw vote text.

        // If status is empty string, what does it mean?
        // Could be a gap? Or just empty cell?
        // If it's a gap in the table, it might mean "Safe" (didn't vote, didn't leave).
        // Or "No vote" (which we handle if text present).
        // Let's skip empty for now.

        const colspan = parseInt(cell.attr("colspan") || "1", 10);
        const rowspan = parseInt(cell.attr("rowspan") || "1", 10);

        for (let k = 0; k < colspan; k++) {
          if (epIdx + k < episodes.length) {
            const targetEp = episodes[epIdx + k];
            if (status) {
              progress[targetEp] = status;
            }

            if (rowspan > 1) {
              pendingSpans[epIdx + k] = {
                rowsLeft: rowspan - 1,
                status: status || "",
              };
            }
          }
        }

        epIdx += colspan - 1;
      }

      if (Object.keys(progress).length > 0) {
        rows.push({ name, progress });
      }
    });

    return rows;
  }
}
