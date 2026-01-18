import { Banishment, Candidate, Episode, Murder, Vote } from "./models";
import { Role, Status } from "./enums";

describe("Domain Models", () => {
  it("should allow creation of a Candidate object", () => {
    const candidate: Candidate = {
      series: 1,
      id: 1,
      name: "John Doe",
      age: 30,
      job: "Software Engineer",
      location: "London",
      originalRole: Role.Faithful,
      roundStates: [
        {
          episode: 1,
          role: Role.Faithful,
          status: Status.Active,
        },
      ],
    };
    expect(candidate).toBeDefined();
  });

  it("should allow creation of an Episode object", () => {
    const episode: Episode = {
      series: 1,
      episodeNumber: 1,
      airDate: new Date("2023-01-01"),
    };
    expect(episode).toBeDefined();
  });

  it("should allow creation of a Vote object", () => {
    const vote: Vote = {
      series: 1,
      voterId: 1,
      targetId: 2,
      round: 1,
      episode: 1,
    };
    expect(vote).toBeDefined();
  });

  it("should allow creation of a Banishment object", () => {
    const banishment: Banishment = {
      banishedId: 1,
      episode: 1,
      round: 1,
    };
    expect(banishment).toBeDefined();
  });

  it("should allow creation of a Murder object", () => {
    const murder: Murder = {
      murderedId: 2,
      episode: 1,
    };
    expect(murder).toBeDefined();
  });
});
