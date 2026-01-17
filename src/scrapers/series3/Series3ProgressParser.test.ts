import { Series3ProgressParser } from "./Series3ProgressParser";

describe("Series3ProgressParser", () => {
  const parser = new Series3ProgressParser();

  it("should return empty array if elimination table is not found", () => {
    const html = "<html><body></body></html>";
    const result = parser.parse(html);
    expect(result).toEqual([]);
  });

  it("should return empty array if no episode headers are found", () => {
    const html = `
      <html>
        <body>
          <h2 id="Elimination_history">Elimination history</h2>
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
  });
});
