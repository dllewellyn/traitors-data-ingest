import { Series2CandidateParser } from "./Series2CandidateParser";
import { Role } from "../../domain/enums";

describe("Series2CandidateParser", () => {
  const parser = new Series2CandidateParser();

  it("should return empty array if table is missing", () => {
    const html = "<html><body></body></html>";
    const result = parser.parse(html);
    expect(result).toEqual([]);
  });

  it("should skip rows with insufficient columns", () => {
    const html = `
      <html><body>
        <h2><span id="Contestants">Contestants</span></h2>
        <table>
          <tbody>
            <tr><th>Header</th></tr>
            <tr><td>Just one col</td></tr>
          </tbody>
        </table>
      </body></html>
    `;
    const result = parser.parse(html);
    expect(result).toEqual([]);
  });

  it("should skip rows with empty names", () => {
    const html = `
      <html><body>
        <h2><span id="Contestants">Contestants</span></h2>
        <table>
          <tbody>
            <tr><th>Name</th><th>Age</th><th>Home</th><th>Job</th><th>Role</th><th>Finish</th></tr>
            <tr><td></td><td>20</td><td>City</td><td>Job</td><td>Faithful</td><td>Winner</td></tr>
          </tbody>
        </table>
      </body></html>
    `;
    const result = parser.parse(html);
    expect(result).toEqual([]);
  });

  it("should warn and default to Faithful for unknown roles", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    const html = `
      <html><body>
        <h2><span id="Contestants">Contestants</span></h2>
        <table>
          <tbody>
            <tr><th>Name</th><th>Age</th><th>Home</th><th>Job</th><th>Role</th><th>Finish</th></tr>
            <tr><td>John</td><td>20</td><td>City</td><td>Job</td><td>UnknownRole</td><td>Winner</td></tr>
          </tbody>
        </table>
      </body></html>
    `;
    const result = parser.parse(html);
    expect(result).toHaveLength(1);
    expect(result[0].originalRole).toBe(Role.Faithful);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unknown role")
    );
    consoleSpy.mockRestore();
  });

  it("should parse Traitor role correctly", () => {
    const html = `
      <html><body>
        <h2><span id="Contestants">Contestants</span></h2>
        <table>
          <tbody>
            <tr><th>Name</th><th>Age</th><th>Home</th><th>Job</th><th>Role</th><th>Finish</th></tr>
            <tr><td>John</td><td>20</td><td>City</td><td>Job</td><td>Traitor</td><td>Winner</td></tr>
          </tbody>
        </table>
      </body></html>
    `;
    const result = parser.parse(html);
    expect(result[0].originalRole).toBe(Role.Traitor);
  });
});
