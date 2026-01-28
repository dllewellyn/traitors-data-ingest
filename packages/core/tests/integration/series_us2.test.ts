import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { SeriesUS2Scraper } from "../../src/scrapers/SeriesUS2Scraper";
import { Role } from "../../src/domain/enums";

describe("Series US 2 Scraper Integration", () => {
  const fetcher = new FileBasedFetcher();
  const url = "https://en.wikipedia.org/wiki/The_Traitors_(American_TV_series)_season_2";
  const scraper = new SeriesUS2Scraper();

  it("should parse candidates correctly", async () => {
    const html = await fetcher.fetch(url);
    const candidates = scraper.parseCandidates(html);

    // From mock: Bananas, Parvati, Dan, Phaedra, Sandra, CT, Trishelle = 7 candidates
    expect(candidates).toHaveLength(7);

    // Verify Parvati (Traitor[c])
    const parvati = candidates.find((c) => c.name === "Parvati Shallow");
    expect(parvati).toBeDefined();
    expect(parvati?.originalRole).toBe(Role.Traitor); // Assuming we map Traitor -> Traitor

    // Verify Sandra (Faithful)
    const sandra = candidates.find((c) => c.name === "Sandra Diaz-Twine");
    expect(sandra).toBeDefined();
    expect(sandra?.originalRole).toBe(Role.Faithful);

    expect(candidates).toMatchSnapshot();
  });

  it("should parse progress/votes correctly", async () => {
    const html = await fetcher.fetch(url);
    const progress = scraper.parseProgress(html);

    // From mock table
    expect(progress.length).toBeGreaterThan(0);

    // Verify Parvati's progress
    const parvati = progress.find((p) => p.name === "Parvati");
    expect(parvati).toBeDefined();
    expect(parvati?.progress[1]).toBe("Safe");
    expect(parvati?.progress[8]).toBe("Banished");

    // Verify CT
    const ct = progress.find((p) => p.name === "CT");
    expect(ct).toBeDefined();
    expect(ct?.progress[11]).toBe("Winner");

    expect(progress).toMatchSnapshot();
  });
});
