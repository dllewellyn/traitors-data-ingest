import { normalizeName, normalizeDate } from "./dataNormalizers";

describe("Data Normalizers", () => {
  describe("normalizeName", () => {
    it("should remove leading and trailing whitespace", () => {
      expect(normalizeName("  John Doe  ")).toBe("John Doe");
    });

    it("should remove annotations like [a], [b], etc.", () => {
      expect(normalizeName("Jane Doe[a]")).toBe("Jane Doe");
      expect(normalizeName("Peter Pan[b]")).toBe("Peter Pan");
    });

    it("should handle names with multiple annotations", () => {
      expect(normalizeName("James[a] Kirk[b]")).toBe("James Kirk");
    });

    it("should handle citation markers like ^", () => {
      expect(normalizeName("Traitor^[102][a]")).toBe("Traitor");
    });

    it("should handle names with no annotations", () => {
      expect(normalizeName("Clark Kent")).toBe("Clark Kent");
    });

    it("should return an empty string if the name is empty", () => {
      expect(normalizeName("")).toBe("");
    });
  });

  describe("normalizeDate", () => {
    it("should correctly format a valid date string", () => {
      expect(normalizeDate("25 December 2023")).toBe("2023-12-25");
    });

    it("should handle different valid date formats", () => {
      expect(normalizeDate("2023-12-25")).toBe("2023-12-25");
      expect(normalizeDate("12/25/2023")).toBe("2023-12-25");
    });

    it("should return an empty string for an invalid date string", () => {
      expect(normalizeDate("Invalid Date")).toBe("");
    });

    it("should return an empty string for an empty input string", () => {
      expect(normalizeDate("")).toBe("");
    });
  });
});
