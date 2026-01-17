import { Series2ProgressParser } from "./Series2ProgressParser";

describe("Series2ProgressParser", () => {
  const parser = new Series2ProgressParser();

  it("should return empty array if table is missing", () => {
    const html = "<html><body></body></html>";
    const result = parser.parse(html);
    expect(result).toEqual([]);
  });

  it("should return empty array if episode headers are missing", () => {
    const html = `
      <html><body>
        <h2><span id="Elimination_history">Elimination history</span></h2>
        <table>
          <tbody>
            <tr><th>No numbers here</th></tr>
          </tbody>
        </table>
      </body></html>
    `;
    const result = parser.parse(html);
    expect(result).toEqual([]);
  });

  it("should handle mixed header and data rows", () => {
    const html = `
      <html><body>
        <h2><span id="Elimination_history">Elimination history</span></h2>
        <table>
          <tbody>
            <tr><th>Episode</th><th>1</th><th>2</th></tr>
            <tr>
                <th scope="row">Alice</th>
                <td>Safe</td>
                <td>Banished</td>
            </tr>
          </tbody>
        </table>
      </body></html>
    `;
    const result = parser.parse(html);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alice");
    expect(result[0].progress[1]).toBe("Safe");
    expect(result[0].progress[2]).toBe("Banished");
  });
});
