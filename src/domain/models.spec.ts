import { Candidate, Episode, Vote } from "./models";
import { Role, Status } from "./enums";

describe("Domain Models", () => {
  it("should allow creation of a Candidate object", () => {
    const candidate: Candidate = {
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
      voterId: 1,
      targetId: 2,
      round: 1,
      episode: 1,
    };
    expect(vote).toBeDefined();
  });
});
