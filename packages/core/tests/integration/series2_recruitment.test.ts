import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { Series2Scraper } from "../../src/scrapers/Series2Scraper";
import { Role } from "../../src/domain/enums";

describe("Series 2 Scraper - Recruitment Logic", () => {
  const fetcher = new FileBasedFetcher();
  const url = "https://en.wikipedia.org/wiki/The_Traitors_(British_series_2)";
  const scraper = new Series2Scraper();

  it("should correctly identify recruited Traitors as originally Faithful", async () => {
    const html = await fetcher.fetch(url);
    const candidates = scraper.parseCandidates(html);

    // Andrew Jenkins was recruited
    const andrew = candidates.find((c) => c.name === "Andrew Jenkins");
    expect(andrew).toBeDefined();
    expect(andrew?.originalRole).toBe(Role.Faithful);

    // Ross Carson was recruited
    const ross = candidates.find((c) => c.name === "Ross Carson");
    expect(ross).toBeDefined();
    expect(ross?.originalRole).toBe(Role.Faithful);

    // Harry Clark was an original Traitor
    const harry = candidates.find((c) => c.name === "Harry Clark");
    expect(harry).toBeDefined();
    expect(harry?.originalRole).toBe(Role.Traitor);
  });
});
