import * as cheerio from "cheerio";
import { TableParser, ILogger } from "../../types";
import { CandidateProgressRow } from "../types";
import {
  normalizeName,
  normalizeGameStatus,
} from "../../utils/dataNormalizers";
import { ConsoleLogger } from "../../utils/ConsoleLogger";

/**
 * Parses the HTML from the US Series 2 Wikipedia page to extract candidate progress data.
 */
export class SeriesUS2ProgressParser implements TableParser<CandidateProgressRow> {
  constructor(private logger: ILogger = new ConsoleLogger()) {}

  /**
   * Parses the "Elimination history" table to extract voting and progress data.
   * @param html The HTML string to parse.
   * @returns An array of CandidateProgressRow objects.
   */
  parse(html: string): CandidateProgressRow[] {
    const $ = cheerio.load(html);
    const rows: CandidateProgressRow[] = [];

    // Find the Elimination history table
    const heading = $("#Elimination_history").parent();
    const table = heading.nextAll("table").first();

    if (table.length === 0) {
      this.logger.warn("Could not find the Elimination history table.");
      return [];
    }

    // 1. Build Episode Column Map
    const columnMap: Record<number, number> = {};
    const allRows = table.find("tbody tr");
    let episodeHeaderRowIndex = -1;
    let maxCols = 0;

    // Find the header row containing numbers (Episodes)
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

        // Heuristic: If the first header cell is "1", it implies the first column (Name)
        // is rowspanned from the previous row. We start indexing at 1.
        if ($(cells[0]).text().trim() === "1") {
          colIdx = 1;
        }

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
      this.logger.warn("Could not find episode headers.");
      return [];
    }

    // 2. Parse Rows with Rowspan Tracking
    const pendingSpans: Record<number, { rowsLeft: number; status: string }> =
      {};

    allRows.slice(episodeHeaderRowIndex + 1).each((i, row) => {
      const tr = $(row);

      // Identify Candidate Row
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
          "Secret Traitor",
          "Shortlist",
          "Key",
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

      while (colIdx < maxCols) {
        // Check pending rowspan for this column
        if (pendingSpans[colIdx] && pendingSpans[colIdx].rowsLeft > 0) {
          const { status } = pendingSpans[colIdx];
          const epNum = columnMap[colIdx];
          if (epNum && isCandidateRow) {
            if (!progress[epNum]) {
              progress[epNum] = status;
            }
          }
          pendingSpans[colIdx].rowsLeft--;
          colIdx++;
          continue;
        }

        if (cellCursor >= dataCells.length) {
          break;
        }

        const cell = $(dataCells[cellCursor]);
        cellCursor++;

        const rawText = cell.text();
        let status = normalizeGameStatus(rawText);

        if (rawText.includes("Winner")) status = "Winner";
        if (rawText.includes("Runner-up")) status = "RunnerUp";
        if (rawText.includes("Eliminated")) status = "Eliminated";
        if (rawText.includes("Walked") || rawText.includes("Quit")) status = "Withdrew";

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
    });

    return rows;
  }
}
