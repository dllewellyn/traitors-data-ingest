import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { Series3Scraper } from "../../src/scrapers/Series3Scraper";

describe("Series 3 Scraper Integration", () => {
  const fetcher = new FileBasedFetcher();
  const url =
    "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_3";
  const scraper = new Series3Scraper();

  it("should parse candidates correctly", async () => {
    const html = await fetcher.fetch(url);
    const candidates = scraper.parseCandidates(html);

    expect(candidates).toHaveLength(25);

    // Verify a Winner (Faithful)
    const jake = candidates.find((c) => c.name === "Jake Brown");
    expect(jake).toBeDefined();
    expect(jake?.originalRole).toBe("Faithful");

    // Verify a Traitor
    // I need to look up a known Traitor.
    // From wiki snippet: Armani Gouveia, Linda Rands, Minah Shannon were Traitors?
    // Let's check Linda Rands.
    const linda = candidates.find((c) => c.name === "Linda Rands");
    expect(linda).toBeDefined();
    expect(linda?.originalRole).toBe("Traitor");

    expect(candidates).toMatchSnapshot();
  });

  it("should parse progress/votes correctly", async () => {
    const html = await fetcher.fetch(url);
    const progress = scraper.parseProgress(html);

    expect(progress.length).toBeGreaterThan(0);

    // Verify Jake's path
    const jake = progress.find((p) => p.name === "Jake");
    expect(jake).toBeDefined();

    expect(progress).toMatchSnapshot();
  });
});
