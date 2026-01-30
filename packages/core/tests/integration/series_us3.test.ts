import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { SeriesUS3Scraper } from "../../src/scrapers/SeriesUS3Scraper";
import { Role } from "../../src/domain/enums";

describe("Series US 3 Scraper Integration", () => {
  const fetcher = new FileBasedFetcher();
  const url = "https://en.wikipedia.org/wiki/The_Traitors_(American_TV_series)_season_3";
  const scraper = new SeriesUS3Scraper();

  it("should parse candidates correctly", async () => {
    const html = await fetcher.fetch(url);
    const candidates = scraper.parseCandidates(html);

    // Expecting 23 candidates (based on Infobox saying 23)
    expect(candidates.length).toBeGreaterThan(0);

    // Verify Bob the Drag Queen (Traitor usually?)
    const bob = candidates.find((c) => c.name.includes("Bob"));
    expect(bob).toBeDefined();
    // Not asserting role yet, will check snapshot

    // Verify Dolores (Winner)
    const dolores = candidates.find((c) => c.name.includes("Dolores"));
    expect(dolores).toBeDefined();

    expect(candidates).toMatchSnapshot();
  });

  it("should parse progress/votes correctly", async () => {
    const html = await fetcher.fetch(url);
    const progress = scraper.parseProgress(html);

    expect(progress.length).toBeGreaterThan(0);

    // Verify Dolores progress
    const dolores = progress.find((p) => p.name.includes("Dolores"));
    expect(dolores).toBeDefined();
    // She won, so check for Winner status eventually

    expect(progress).toMatchSnapshot();
  });
});
