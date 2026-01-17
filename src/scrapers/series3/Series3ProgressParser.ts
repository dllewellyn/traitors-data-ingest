import * as cheerio from "cheerio";
import { TableParser } from "../../types";
import { CandidateProgressRow } from "../types";
import {
  normalizeName,
  normalizeGameStatus,
} from "../../utils/dataNormalizers";

/**
 * Parses the HTML from the Series 3 Wikipedia page to extract candidate progress data.
 * Uses robust column mapping to handle offsets and colspans.
 */
export class Series3ProgressParser
  implements TableParser<CandidateProgressRow>
{
  parse(html: string): CandidateProgressRow[] {
    const $ = cheerio.load(html);
    const rows: CandidateProgressRow[] = [];

    // Find the Elimination history table
    // In Series 3, the ID is on the h2: <h2 id="Elimination_history">
    const heading = $("#Elimination_history").parent();
    const table = heading.nextAll("table").first();

    if (table.length === 0) {
      console.warn("Could not find the Elimination history table.");
      return [];
    }

    // 1. Build Episode Column Map
    // Map column index -> Episode Number
    const columnMap: Record<number, number> = {};
    const allRows = table.find("tbody tr");
    let episodeHeaderRowIndex = -1;
    let maxCols = 0;

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
        let colIdx = 0;
        cells.each((j, cell) => {
          const $cell = $(cell);
          const colspan = parseInt($cell.attr("colspan") || "1", 10);
          const text = $cell.text().trim();

          if (/^\d+$/.test(text)) {
            const epNum = parseInt(text, 10);
            for (let k = 0; k < colspan; k++) {
              columnMap[colIdx + k] = epNum;
            }
          }
          colIdx += colspan;
        });
        maxCols = colIdx;
      }
    });

    if (Object.keys(columnMap).length === 0) {
      console.warn("Could not find episode headers.");
      return [];
    }
    // console.log("Column Map:", JSON.stringify(columnMap));

    // 2. Parse Rows with Rowspan Tracking
    // pendingSpans: map of colIdx -> { rowsLeft, status }
    const pendingSpans: Record<number, { rowsLeft: number; status: string }> =
      {};

    allRows.slice(episodeHeaderRowIndex + 1).each((i, row) => {
      const tr = $(row);

      // Identify Candidate Row
      // Sometimes "th" is not scope="row" but just a th.
      // But metadata rows also have th.
      // We rely on keyword exclusion later.
      let nameCell = tr.find("th[scope='row']").first();
      if (nameCell.length === 0) {
        nameCell = tr.find("th").first();
      }
      const nameRaw = nameCell.text().trim();
      const isCandidateRow =
        nameRaw &&
        ![
          "Traitors'",
          "Decision",
          "Murder",
          "Immune",
          "Banishment",
          "Vote",
          "Episode",
        ].some((kw) => nameRaw.includes(kw));

      const name = isCandidateRow ? normalizeName(nameRaw) : null;
      const progress: Record<number, string> = {};

      const dataCells = nameCell.nextAll("td");
      let cellCursor = 0;

      // Determine initial colIdx based on nameCell and its predecessors
      const precedingCells = nameCell.prevAll("td, th");
      let startColIdx = 0;
      precedingCells.each((_, cell) => {
        startColIdx += parseInt($(cell).attr("colspan") || "1", 10);
      });
      let colIdx = startColIdx + parseInt(nameCell.attr("colspan") || "1", 10);

      // Iterate through expected columns until maxCols
      while (colIdx < maxCols) {
        // Check pending rowspan for this column
        if (pendingSpans[colIdx] && pendingSpans[colIdx].rowsLeft > 0) {
          const { status } = pendingSpans[colIdx];
          const epNum = columnMap[colIdx];
          if (epNum && isCandidateRow) {
            // Only set if not already set (handling multi-column spanning same episode)
            if (!progress[epNum]) {
                progress[epNum] = status;
            }
          }
          pendingSpans[colIdx].rowsLeft--;
          colIdx++;
          continue;
        }

        // Need to read next cell from DOM
        if (cellCursor >= dataCells.length) {
          // No more cells, stop
          break;
        }

        const cell = $(dataCells[cellCursor]);
        cellCursor++;

        const rawText = cell.text();
        let status = normalizeGameStatus(rawText);

        if (rawText.includes("Winner")) status = "Winner";
        if (rawText.includes("Runner-up")) status = "RunnerUp";
        if (rawText.includes("Eliminated")) status = "Eliminated";

        const colspan = parseInt(cell.attr("colspan") || "1", 10);
        const rowspan = parseInt(cell.attr("rowspan") || "1", 10);

        for (let k = 0; k < colspan; k++) {
          const currentC = colIdx + k;
          const epNum = columnMap[currentC];

          if (epNum && isCandidateRow) {
            progress[epNum] = status || "";
          }

          if (rowspan > 1) {
            pendingSpans[currentC] = {
              rowsLeft: rowspan - 1,
              status: status || "",
            };
          }
        }

        colIdx += colspan;
      }

      if (isCandidateRow && name && Object.keys(progress).length > 0) {
        rows.push({ name, progress });
      }
      // Note: We don't save metadata rows, but we processed them to update pendingSpans if they had rowspans
    });

    return rows;
  }
}
