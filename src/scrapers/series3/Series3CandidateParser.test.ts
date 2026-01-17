import { Series3CandidateParser } from "./Series3CandidateParser";
import { Role } from "../../domain/enums";

describe("Series3CandidateParser", () => {
  const parser = new Series3CandidateParser();

  it("should return empty array if table is not found", () => {
    const html = "<html><body></body></html>";
    const result = parser.parse(html);
    expect(result).toEqual([]);
  });

  it("should skip rows with insufficient columns", () => {
    const html = `
      <html>
        <body>
          <h2><span id="Contestants">Contestants</span></h2>
          <table>
            <tbody>
              <tr><th>Header</th></tr>
              <tr><td>Short Row</td></tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    const result = parser.parse(html);
    expect(result).toEqual([]);
  });

  it("should skip rows with empty name", () => {
    const html = `
      <html>
        <body>
          <h2><span id="Contestants">Contestants</span></h2>
          <table>
            <tbody>
              <tr><th>Name</th><th>Age</th><th>Home</th><th>Job</th><th>Role</th><th>Finish</th></tr>
              <tr><td></td><td>20</td><td>Home</td><td>Job</td><td>Faithful</td><td>Winner</td></tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    const result = parser.parse(html);
    expect(result).toEqual([]);
  });
});
