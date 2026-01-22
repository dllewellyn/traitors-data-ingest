import { IStorageWriter } from "./IStorageWriter";
import { Series } from "../domain/series";

/**
 * A storage writer that outputs data to the console for verification.
 * It does not persist any data, making it safe for dry runs.
 */
export class DryRunStorageWriter implements IStorageWriter {
  public async write(series: Series): Promise<void> {
    console.log(`[DRY RUN] Would write data for Series ${series.id}:`);

    // Pretty-print the JSON structure of the entire series object
    const seriesJson = JSON.stringify(series, null, 2);

    // Log in chunks to avoid potential truncation in some environments
    const chunkSize = 1000;
    for (let i = 0; i < seriesJson.length; i += chunkSize) {
      // Use console.log for clear, multi-line output
      // eslint-disable-next-line no-console
      console.log(seriesJson.substring(i, i + chunkSize));
    }

    console.log(`[DRY RUN] Completed for Series ${series.id}. No data was persisted.`);
    return Promise.resolve();
  }
}
