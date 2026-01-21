import * as path from "path";
import * as fs from "fs/promises";
import { CsvWriter, WikipediaFetcher, Series4Scraper } from "@gcp-adl/core";

async function main() {
  const fetcher = new WikipediaFetcher();
  const scraper = new Series4Scraper();
  const writer = new CsvWriter();
  const outputDir = path.resolve(__dirname, "../data/series4");

  await fs.mkdir(outputDir, { recursive: true });

  console.log("Fetching Series 4 data...");
  const html = await fetcher.fetch(
    "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_4"
  );

  console.log("Parsing candidates...");
  const candidates = scraper.parseCandidates(html);

  console.log("Parsing progress...");
  const progress = scraper.parseProgress(html);

  // Flatten for CSV
  const candidateRows = candidates.map((c) => ({
    ...c,
    roundStates: JSON.stringify(c.roundStates),
  }));

  const progressRows = progress.map((p) => ({
    ...p,
    progress: JSON.stringify(p.progress),
  }));

  await writer.write(candidateRows, path.join(outputDir, "candidates.csv"));
  await writer.write(progressRows, path.join(outputDir, "votes.csv"));

  console.log(`Done. CSVs written to ${outputDir}`);
}

main().catch(console.error);
