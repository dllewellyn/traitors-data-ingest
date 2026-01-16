import { Series1CandidateParser } from "./Series1CandidateParser";
import { Role } from "../../domain/enums";

describe("Series1CandidateParser", () => {
  const parser = new Series1CandidateParser();
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it("should parse a standard row correctly", () => {
    const html = `
      <html>
        <body>
          <h2><span id="Contestants">Contestants</span></h2>
          <table>
            <tbody>
              <tr>
                <th>Contestant</th>
                <th>Age</th>
                <th>Residence</th>
                <th>Occupation</th>
                <th>Affiliation</th>
                <th>Finish</th>
              </tr>
              <tr>
                <td>Aisha Birley</td>
                <td>23</td>
                <td>Manchester, England</td>
                <td>Masters Graduate</td>
                <td>Faithful</td>
                <td>Murdered (Episode 2)</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const result = parser.parse(html);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 0,
      name: "Aisha Birley",
      age: 23,
      location: "Manchester, England",
      job: "Masters Graduate",
      originalRole: Role.Faithful,
      roundStates: [
        {
          episode: 2,
          role: Role.Faithful,
          status: "Murdered",
        },
      ],
    });
  });

  it("should handle names with citations", () => {
    const html = `
      <html>
        <body>
          <h2><span id="Contestants">Contestants</span></h2>
          <table>
            <tbody>
              <tr>
                <th>Contestant</th>
                <th>Age</th>
                <th>Residence</th>
                <th>Occupation</th>
                <th>Affiliation</th>
                <th>Finish</th>
              </tr>
              <tr>
                <td>John[a]</td>
                <td>49</td>
                <td>Edinburgh, Scotland</td>
                <td>Spa therapist</td>
                <td>Faithful</td>
                <td>Murdered (Episode 5)</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const result = parser.parse(html);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("John");
  });

  it("should handle a winner status", () => {
    const html = `
      <html>
        <body>
          <h2><span id="Contestants">Contestants</span></h2>
          <table>
            <tbody>
              <tr>
                <th>Contestant</th>
                <th>Age</th>
                <th>Residence</th>
                <th>Occupation</th>
                <th>Affiliation</th>
                <th>Finish</th>
              </tr>
              <tr>
                <td>Aaron Evans</td>
                <td>24</td>
                <td>Portsmouth, England</td>
                <td>Property agent</td>
                <td>Faithful</td>
                <td>Winner (Episode 12)</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const result = parser.parse(html);

    expect(result).toHaveLength(1);
    expect(result[0].roundStates).toEqual([
      {
        episode: 12,
        role: Role.Faithful,
        status: "Winner",
      },
    ]);
  });

  it("should correctly identify the 'Contestants' table", () => {
    const html = `
      <html>
        <body>
          <h2>Some Other Table</h2>
          <table>
            <tbody>
              <tr>
                <td>This is not the table we're looking for</td>
              </tr>
            </tbody>
          </table>
          <h2><span id="Contestants">Contestants</span></h2>
          <table>
            <tbody>
              <tr>
                <th>Contestant</th>
                <th>Age</th>
                <th>Residence</th>
                <th>Occupation</th>
                <th>Affiliation</th>
                <th>Finish</th>
              </tr>
              <tr>
                <td>Aisha Birley</td>
                <td>23</td>
                <td>Manchester, England</td>
                <td>Masters Graduate</td>
                <td>Faithful</td>
                <td>Murdered (Episode 2)</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const result = parser.parse(html);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Aisha Birley");
  });

  it("should return an empty array if the table is not found", () => {
    const html = `
      <html>
        <body>
          <h2>Some Other Table</h2>
          <table>
            <tbody>
              <tr>
                <td>This is not the table we're looking for</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const result = parser.parse(html);

    expect(result).toHaveLength(0);
  });

  it("should skip a row with an unknown role", () => {
    const html = `
      <html>
        <body>
          <h2><span id="Contestants">Contestants</span></h2>
          <table>
            <tbody>
              <tr>
                <th>Contestant</th>
                <th>Age</th>
                <th>Residence</th>
                <th>Occupation</th>
                <th>Affiliation</th>
                <th>Finish</th>
              </tr>
              <tr>
                <td>Bad Data</td>
                <td>30</td>
                <td>Someplace</td>
                <td>Some Job</td>
                <td>Unknown Role</td>
                <td>Banished (Episode 1)</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const result = parser.parse(html);

    expect(result).toHaveLength(0);
  });

  it("should skip a row with an unhandled status", () => {
    const html = `
      <html>
        <body>
          <h2><span id="Contestants">Contestants</span></h2>
          <table>
            <tbody>
              <tr>
                <th>Contestant</th>
                <th>Age</th>
                <th>Residence</th>
                <th>Occupation</th>
                <th>Affiliation</th>
                <th>Finish</th>
              </tr>
              <tr>
                <td>More Bad Data</td>
                <td>40</td>
                <td>Another Place</td>
                <td>Another Job</td>
                <td>Faithful</td>
                <td>Withdrew (Episode 2)</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const result = parser.parse(html);

    expect(result).toHaveLength(0);
  });
});
