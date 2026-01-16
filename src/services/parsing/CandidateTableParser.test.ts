import { CandidateTableParser } from "./CandidateTableParser";
import { HtmlParser } from "../HtmlParser";
import { Candidate } from "../../domain/models";
import { Role } from "../../domain/enums";

describe("CandidateTableParser", () => {
  let parser: CandidateTableParser;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    parser = new CandidateTableParser(new HtmlParser());
    consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it("should parse a table of contestants and return an array of candidates", () => {
    const html = `
      <div>
        <h2>Contestants</h2>
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Hometown</th>
              <th>Occupation</th>
            </tr>
            <tr>
              <td>Aaron Evans</td>
              <td>25</td>
              <td>Location 1</td>
              <td>Job 1</td>
            </tr>
            <tr>
              <td>Meryl Williams</td>
              <td>28[a]</td>
              <td>Location 2</td>
              <td>Job 2</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    const expectedCandidates: Omit<Candidate, "id" | "roundStates">[] = [
      {
        name: "Aaron Evans",
        age: 25,
        location: "Location 1",
        job: "Job 1",
        originalRole: Role.Faithful,
      },
      {
        name: "Meryl Williams",
        age: 28,
        location: "Location 2",
        job: "Job 2",
        originalRole: Role.Faithful,
      },
    ];

    const result = parser.parse(html);

    // We only check the parsed fields, not the placeholder ones
    result.forEach((candidate, index) => {
      expect(candidate).toMatchObject(expectedCandidates[index]);
    });
  });

  it("should throw an error if the contestants table is not found", () => {
    const html = `
      <div>
        <h2>Some other heading</h2>
        <table>
          <tbody>
            <tr>
              <td>Some data</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    expect(() => parser.parse(html)).toThrow(
      "Could not find the 'Contestants' table."
    );
  });

  it("should handle malformed rows gracefully and log a warning", () => {
    const html = `
      <div>
        <h2>Contestants</h2>
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Hometown</th>
              <th>Occupation</th>
            </tr>
            <tr>
              <td>Aaron Evans</td>
              <td>25</td>
              <td>Location 1</td>
              <td>Job 1</td>
            </tr>
            <tr>
              <td>Meryl Williams</td>
              <td>invalid age</td>
              <td>Location 2</td>
              <td>Job 2</td>
            </tr>
             <tr>
              <td></td>
              <td>28</td>
              <td>Location 2</td>
              <td>Job 2</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    const result = parser.parse(html);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Aaron Evans");

    expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Skipping row 1: Expected at least 4 cells, but found 0."
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Skipping row 3: Failed validation. Name: "Meryl Williams", Age: "invalid age".'
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Skipping row 4: Failed validation. Name: "", Age: "28".'
    );
  });
});
