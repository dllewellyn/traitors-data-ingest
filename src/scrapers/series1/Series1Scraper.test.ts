import { Series1Scraper } from "./Series1Scraper";
import { WikipediaFetcher } from "../../services/WikipediaFetcher";
import fs from "fs";
import path from "path";

jest.mock("../../services/WikipediaFetcher");

const mockWikipediaFetcher = WikipediaFetcher as jest.MockedClass<
  typeof WikipediaFetcher
>;

describe("Series1Scraper", () => {
  let scraper: Series1Scraper;
  let mockHtml: string;

  beforeEach(() => {
    scraper = new Series1Scraper();
    mockHtml = fs.readFileSync(
      path.join(__dirname, "series1-snapshot.html"),
      "utf-8",
    );
    mockWikipediaFetcher.prototype.fetch.mockResolvedValue(mockHtml);
  });

  it("should parse the candidates from the HTML", async () => {
    const seriesData = await scraper.scrape();
    expect(seriesData.candidates.length).toBeGreaterThan(0);

    const wilfred = seriesData.candidates.find((c) => c.name === "Wilfred Webster");
    expect(wilfred).toBeDefined();
    expect(wilfred?.age).toBe(28);
    expect(wilfred?.job).toBe("Senior fundraiser");
  });

  it("should parse the voting history from the HTML", async () => {
    const seriesData = await scraper.scrape();
    // This is a placeholder test.
    // The actual implementation will need to be much more complex.
    expect(seriesData.episodes.length).toBe(0);
    expect(seriesData.votes.length).toBe(0);
    expect(seriesData.banishments.length).toBe(0);
    expect(seriesData.murders.length).toBe(0);
  });
});
