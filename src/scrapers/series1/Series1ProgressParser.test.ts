import { Series1ProgressParser } from "./Series1ProgressParser";

describe("Series1ProgressParser", () => {
  const parser = new Series1ProgressParser();
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it("should parse the Elimination history table correctly with rowspans", () => {
    const html = `
            <html>
                <body>
                    <h2><span id="Elimination_history">Elimination history</span></h2>
                    <table>
                        <tbody>
                            <tr>
                                <th colspan="3">Episode</th>
                                <th>1</th>
                                <th>2</th>
                            </tr>
                            <tr>
                                <th>Traitors' Decision</th>
                                <td>None</td>
                                <td>Murder</td>
                            </tr>
                             <tr>
                                <th>Vote</th>
                                <td>10-2</td>
                                <td>5-5</td>
                            </tr>
                            <tr>
                                <th scope="row">Aaron</th>
                                <td rowspan="2">No vote</td>
                                <td>Imran</td>
                            </tr>
                            <tr>
                                <th scope="row">Hannah</th>
                                <!-- Ep 1 covered by rowspan from Aaron -->
                                <td>Nicky</td>
                            </tr>
                             <tr>
                                <th scope="row">Maddy</th>
                                <td>Imran</td>
                                <td>Banished</td>
                            </tr>
                        </tbody>
                    </table>
                </body>
            </html>
        `;

    const result = parser.parse(html);

    expect(result).toHaveLength(3);

    // Aaron: Ep 1 "No vote" (Safe), Ep 2 "Imran" (Safe/Vote)
    expect(result[0]).toEqual({
      name: "Aaron",
      progress: {
        1: "Safe",
        2: "Safe",
      },
    });

    // Hannah: Ep 1 covered by rowspan "No vote" (Safe), Ep 2 "Nicky" (Safe)
    expect(result[1]).toEqual({
      name: "Hannah",
      progress: {
        1: "Safe",
        2: "Safe",
      },
    });

    // Maddy: Ep 1 "Imran" (Safe), Ep 2 "Banished"
    expect(result[2]).toEqual({
      name: "Maddy",
      progress: {
        1: "Safe",
        2: "Banished",
      },
    });
  });

  it("should handle eliminated and murdered statuses", () => {
    const html = `
            <html>
                <body>
                    <h2><span id="Elimination_history">Elimination history</span></h2>
                    <table>
                        <tbody>
                             <tr>
                                <th>Episode</th>
                                <th>1</th>
                            </tr>
                            <tr>
                                <th scope="row">Alice</th>
                                <td>Eliminated</td>
                            </tr>
                            <tr>
                                <th scope="row">Bob</th>
                                <td>Murdered</td>
                            </tr>
                        </tbody>
                    </table>
                </body>
            </html>
        `;

    const result = parser.parse(html);
    expect(result[0].progress[1]).toBe("Banished"); // Eliminated -> Banished
    expect(result[1].progress[1]).toBe("Murdered");
  });

  it("should handle colspans for exit status", () => {
    const html = `
            <html>
                <body>
                    <h2><span id="Elimination_history">Elimination history</span></h2>
                    <table>
                        <tbody>
                             <tr>
                                <th>Episode</th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                            </tr>
                            <tr>
                                <th scope="row">Charlie</th>
                                <td>Safe</td>
                                <td colspan="2">Murdered</td>
                            </tr>
                        </tbody>
                    </table>
                </body>
            </html>
        `;

    const result = parser.parse(html);
    expect(result[0].progress).toEqual({
      1: "Safe",
      2: "Murdered",
      3: "Murdered",
    });
  });
});
