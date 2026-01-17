import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { Series2Scraper } from "../../src/scrapers/Series2Scraper";

describe("Series 2 Scraper Integration", () => {
  const fetcher = new FileBasedFetcher();
  const url = "https://en.wikipedia.org/wiki/The_Traitors_(British_series_2)";
  const scraper = new Series2Scraper();

  it("should parse candidates correctly", async () => {
    const html = await fetcher.fetch(url);
    const candidates = scraper.parseCandidates(html);

    expect(candidates).toHaveLength(22);

    // Verify Harry Clark (Winner)
    const harry = candidates.find((c) => c.name === "Harry Clark");
    expect(harry).toBeDefined();
    expect(harry?.age).toBe(22);
    expect(harry?.job).toBe("British army engineer");
    expect(harry?.location).toBe("Slough, England");
    expect(harry?.originalRole).toBe("Traitor");

    // Verify a Faithful: Mollie Pearce
    const mollie = candidates.find((c) => c.name === "Mollie Pearce");
    expect(mollie).toBeDefined();
    expect(mollie?.originalRole).toBe("Faithful");

    expect(candidates).toMatchSnapshot();
  });

  it("should parse progress/votes correctly", async () => {
    const html = await fetcher.fetch(url);
    const progress = scraper.parseProgress(html);

    // Basic check
    expect(progress.length).toBeGreaterThan(0);

    // Verify Harry's path (Table uses first name)
    const harry = progress.find((p) => p.name === "Harry");
    expect(harry).toBeDefined();

    // Verify Voting History
    // Episode 1 was "No vote" (Safe)
    expect(harry?.progress[1]).toBe("Safe");
    // Harry voted for Zack in Episode 2
    expect(harry?.progress[2]).toBe("Zack");

    // In Series 2 table, the final episode might not have explicit "Winner" text in the voting row,
    // or the row might be short. We verify he has progress in late episodes (e.g. Ep 10).
    expect(harry?.progress[10]).toBeDefined();

    // Verify Mollie's vote (to ensure column alignment is correct)
    const mollie = progress.find((p) => p.name === "Mollie");
    expect(mollie).toBeDefined();
    // Mollie voted for Sonja in Episode 2
    expect(mollie?.progress[2]).toBe("Sonja");

    expect(progress).toMatchSnapshot();
  });
});
