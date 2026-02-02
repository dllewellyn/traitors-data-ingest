import { SeriesUS2CandidateParser } from "../../../../src/scrapers/seriesUS2/SeriesUS2CandidateParser";
import { SeriesUS2ProgressParser } from "../../../../src/scrapers/seriesUS2/SeriesUS2ProgressParser";
import { Role } from "../../../../src/domain/enums";

describe("Series US 2 Parsers", () => {
  const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

  afterEach(() => {
    consoleWarnSpy.mockClear();
  });

  describe("SeriesUS2CandidateParser", () => {
    const parser = new SeriesUS2CandidateParser();

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
      // Should not log warning about table missing
      expect(consoleWarnSpy).not.toHaveBeenCalled();
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

  describe("SeriesUS2ProgressParser", () => {
    const parser = new SeriesUS2ProgressParser();

    it("should return empty array and log warning if table is missing", () => {
      const html = "<html><body><h1>Nothing here</h1></body></html>";
      const result = parser.parse(html);
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("Could not find the Elimination history table.");
    });

    it("should return empty array and log warning if episode headers are missing", () => {
      const html = `
        <html>
          <body>
            <h2><span id="Elimination_history">Elimination history</span></h2>
            <table>
              <tbody>
                <tr><th>Something else</th></tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      const result = parser.parse(html);
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("Could not find episode headers.");
    });

    it("should handle rowspans correctly", () => {
      const html = `
        <html>
          <body>
            <h2><span id="Elimination_history">Elimination history</span></h2>
            <table>
              <tbody>
                <tr><th>Name</th><th>1</th><th>2</th></tr>
                <tr>
                  <th scope="row">Alice</th>
                  <td rowspan="2">Safe</td>
                  <td>Banished</td>
                </tr>
                <tr>
                  <th scope="row">Bob</th>
                  <!-- Col 1 is covered by Alice's rowspan -->
                  <td>Winner</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      const result = parser.parse(html);
      expect(result).toHaveLength(2);

      const alice = result.find((r) => r.name === "Alice");
      expect(alice).toBeDefined();
      expect(alice?.progress[1]).toBe("Safe");
      expect(alice?.progress[2]).toBe("Banished");

      const bob = result.find((r) => r.name === "Bob");
      expect(bob).toBeDefined();
      expect(bob?.progress[1]).toBe("Safe"); // Inherited from rowspan
      expect(bob?.progress[2]).toBe("Winner");
    });

    it("should ignore metadata rows based on keywords", () => {
      const html = `
        <html>
          <body>
            <h2><span id="Elimination_history">Elimination history</span></h2>
            <table>
              <tbody>
                <tr><th>Name</th><th>1</th></tr>
                <tr>
                  <th scope="row">Alice</th>
                  <td>Safe</td>
                </tr>
                <tr>
                  <th scope="row">Traitors' Decision</th>
                  <td>Murder</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      const result = parser.parse(html);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Alice");
    });

    it("should handle rows with fewer cells than headers (ragged rows)", () => {
      const html = `
        <html>
          <body>
            <h2><span id="Elimination_history">Elimination history</span></h2>
            <table>
              <tbody>
                <tr><th>Name</th><th>1</th><th>2</th></tr>
                <tr>
                  <th scope="row">Alice</th>
                  <td>Safe</td>
                  <!-- Missing second cell -->
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      const result = parser.parse(html);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Alice");
      // Episode 1 should be parsed
      expect(result[0].progress[1]).toBe("Safe");
      // Episode 2 should be missing/undefined
      expect(result[0].progress[2]).toBeUndefined();
    });

    it("should handle pending rowspans correctly when moving to next row", () => {
      const html = `
        <html>
          <body>
            <h2><span id="Elimination_history">Elimination history</span></h2>
            <table>
              <tbody>
                <tr><th>Name</th><th>1</th><th>2</th></tr>
                <tr>
                  <th scope="row">Alice</th>
                  <td rowspan="2">Safe</td>
                  <td>Banished</td>
                </tr>
                <tr>
                  <!-- Alice's rowspan covers col 1 -->
                  <th scope="row">Bob</th>
                  <td>Winner</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      // This test is similar to the rowspan one but explicitly targets the logic
      // where pendingSpans are checked at the start of a column loop.
      const result = parser.parse(html);
      expect(result).toHaveLength(2);
      expect(result[1].name).toBe("Bob");
      expect(result[1].progress[1]).toBe("Safe");
    });

    it("should skip column if pending rowspan has remaining rows", () => {
       const html = `
        <html>
          <body>
            <h2><span id="Elimination_history">Elimination history</span></h2>
            <table>
              <tbody>
                <tr><th>Name</th><th>1</th></tr>
                <tr>
                  <th scope="row">Alice</th>
                  <td rowspan="3">Safe</td>
                </tr>
                <tr><th scope="row">Bob</th></tr>
                <tr><th scope="row">Charlie</th></tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      const result = parser.parse(html);
      expect(result).toHaveLength(3);
      expect(result[1].name).toBe("Bob");
      expect(result[1].progress[1]).toBe("Safe");
      expect(result[2].name).toBe("Charlie");
      expect(result[2].progress[1]).toBe("Safe");
    });

    it("should handle rows where name cell fallback is needed (no th[scope=row])", () => {
      const html = `
        <html>
          <body>
            <h2><span id="Elimination_history">Elimination history</span></h2>
            <table>
              <tbody>
                <tr><th>Name</th><th>1</th></tr>
                <tr>
                  <!-- No scope="row" -->
                  <th>Alice</th>
                  <td>Safe</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      const result = parser.parse(html);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Alice");
      expect(result[0].progress[1]).toBe("Safe");
    });

    it("should ignore metadata rows even if rowspan is active", () => {
        const html = `
         <html>
           <body>
             <h2><span id="Elimination_history">Elimination history</span></h2>
             <table>
               <tbody>
                 <tr><th>Name</th><th>1</th><th>2</th></tr>
                 <tr>
                   <th scope="row">Alice</th>
                   <td rowspan="2">Safe</td>
                   <td>Banished</td>
                 </tr>
                 <tr>
                   <!-- Metadata row, but column 1 is covered by Alice's rowspan -->
                   <th scope="row">Traitors' Decision</th>
                   <td>Murder</td>
                 </tr>
               </tbody>
             </table>
           </body>
         </html>
       `;
       // Logic:
       // Row 1 (Alice): Col 1 (Ep1) = Safe (rowspan 2), Col 2 (Ep2) = Banished.
       // Row 2 (Decision): Col 1 is pending (Safe). Logic checks pendingSpans.
       // Since it is NOT a candidate row, it should NOT add 'Safe' to any progress map.
       // The parser logic `if (epNum && isCandidateRow)` inside the pending block handles this.

       const result = parser.parse(html);
       expect(result).toHaveLength(1);
       expect(result[0].name).toBe("Alice");
       // Ensure no random "Traitors' Decision" row appeared
     });
  });
});
