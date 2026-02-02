import { SeriesUS3CandidateParser } from "../../../../src/scrapers/seriesUS3/SeriesUS3CandidateParser";
import { Role } from "../../../../src/domain/enums";

describe("Series US 3 Parsers", () => {
  const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

  afterEach(() => {
    consoleWarnSpy.mockClear();
  });

  describe("SeriesUS3CandidateParser", () => {
    const parser = new SeriesUS3CandidateParser();

    it("should return empty array and log warning if table is missing", () => {
      const html = "<html><body><h1>Nothing here</h1></body></html>";
      const result = parser.parse(html);
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("Could not find the contestants table.");
    });

    it("should ignore rows with insufficient columns", () => {
      const html = `
        <html>
          <body>
            <h2><span id="Contestants">Contestants</span></h2>
            <table>
              <tbody>
                <tr><th>Name</th></tr>
                <tr><td>Just Name</td></tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      const result = parser.parse(html);
      expect(result).toEqual([]);
    });

    it("should default to Faithful and log warning for unknown role", () => {
      const html = `
        <html>
          <body>
            <h2><span id="Contestants">Contestants</span></h2>
            <table>
              <tbody>
                <tr><th>Name</th><th>Age</th><th>From</th><th>Job</th><th>Affiliation</th><th>Finish</th></tr>
                <tr>
                  <td>Unknown Person</td>
                  <td>25</td>
                  <td>Nowhere</td>
                  <td>Nobody</td>
                  <td>Mystery</td>
                  <td>Banished</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      const result = parser.parse(html);
      expect(result).toHaveLength(1);
      expect(result[0].originalRole).toBe(Role.Faithful);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Unknown role. Defaulting to Faithful.",
        expect.objectContaining({
          affiliationText: "Mystery",
          name: "Unknown Person",
        })
      );
    });
  });
});
