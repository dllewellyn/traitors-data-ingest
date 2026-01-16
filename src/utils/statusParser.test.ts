import { parseFinishText } from "./statusParser";
import { Status } from "../domain/enums";

describe("statusParser", () => {
  it("should parse a 'Murdered' status correctly", () => {
    const result = parseFinishText("Murdered (Episode 2)");
    expect(result).toEqual({
      status: Status.Murdered,
      episode: 2,
    });
  });

  it("should parse a 'Banished' status correctly", () => {
    const result = parseFinishText("Banished (Episode 3)");
    expect(result).toEqual({
      status: Status.Banished,
      episode: 3,
    });
  });

  it("should parse a 'Winner' status correctly", () => {
    const result = parseFinishText("Winner (Episode 12)");
    expect(result).toEqual({
      status: Status.Winner,
      episode: 12,
    });
  });

  it("should parse a 'Runner-up' status correctly", () => {
    const result = parseFinishText("Runner-up (Episode 12)");
    expect(result).toEqual({
      status: Status.RunnerUp,
      episode: 12,
    });
  });

  it("should return null for an unknown status", () => {
    const result = parseFinishText("Unknown Status (Episode 1)");
    expect(result).toBeNull();
  });

  it("should handle statuses without an episode number", () => {
    const result = parseFinishText("Winner");
    expect(result).toEqual({
      status: Status.Winner,
      episode: 0,
    });
  });

  it("should return null for empty or invalid input", () => {
    expect(parseFinishText("")).toBeNull();
    expect(parseFinishText(null as any)).toBeNull();
    expect(parseFinishText("Invalid Text")).toBeNull();
  });
});
