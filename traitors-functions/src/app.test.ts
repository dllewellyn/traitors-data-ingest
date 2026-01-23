import request from "supertest";

/* eslint-disable @typescript-eslint/no-var-requires */

// Mocks must be declared before importing the module that uses them
jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(),
}));

jest.mock("@gcp-adl/core", () => ({
  runIngestionProcess: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("./persistence/firestore", () => ({
  getAllSeries: jest.fn(),
  getSeriesByNumber: jest.fn(),
  getCandidatesBySeriesNumber: jest.fn(),
  getVotes: jest.fn(),
}));

// Import app after mocks
import app from "./app";
const {
  getAllSeries,
  getSeriesByNumber,
  getCandidatesBySeriesNumber,
  getVotes,
} = require("./persistence/firestore");

describe("Functions API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /status", () => {
    it("should respond with 200 OK", async () => {
      const response = await request(app).get("/status");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({status: "ok"});
    });
  });

  describe("GET /api/health", () => {
    it("should respond with 200 OK", async () => {
      const response = await request(app).get("/api/health");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({status: "ok"});
    });
  });

  describe("POST /api/ingest", () => {
    it("should reject requests without authorization", async () => {
      const response = await request(app).post("/api/ingest");
      expect(response.status).toBe(401);
      expect(response.body).toEqual({error: "Unauthorized"});
    });

    it("should reject requests with invalid token", async () => {
      const response = await request(app)
        .post("/api/ingest")
        .set("X-Auth-Token", "invalid-token");
      expect(response.status).toBe(401);
      expect(response.body).toEqual({error: "Unauthorized"});
    });

    it("should accept requests with valid token and trigger", async () => {
      const {runIngestionProcess} = require("@gcp-adl/core");

      const response = await request(app)
        .post("/api/ingest")
        .set("X-Auth-Token", "LOCAL_DEV_TOKEN");

      expect(response.status).toBe(202);
      expect(response.body).toEqual({
        status: "ingestion_started",
      });

      expect(runIngestionProcess).toHaveBeenCalled();
    });

    it("should handle ingestion failure gracefully (log error)", async () => {
      const {runIngestionProcess} = require("@gcp-adl/core");
      // Simulate rejection
      runIngestionProcess.mockRejectedValue(new Error("Ingestion error"));

      // NOTE: Because the route does not await the promise,
      // the error is caught in the background.
      // The response to the user is still 202.
      // We mainly want to ensure this doesn't crash the process.
      const response = await request(app)
        .post("/api/ingest")
        .set("X-Auth-Token", "LOCAL_DEV_TOKEN");

      expect(response.status).toBe(202);
      expect(runIngestionProcess).toHaveBeenCalled();
    });
  });

  describe("GET /api/series", () => {
    it("should return list of series", async () => {
      getAllSeries.mockResolvedValue([
        {seriesNumber: 1, candidates: [], votes: []},
        {seriesNumber: 2, candidates: [], votes: []},
      ]);

      const response = await request(app).get("/api/series");
      expect(response.status).toBe(200);
      expect(response.headers["cache-control"]).toBe(
        "public, max-age=86400, s-maxage=86400"
      );
      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe(1);
      expect(response.body[0].title).toBe("The Traitors (UK series 1)");
    });

    it("should handle errors when fetching all series", async () => {
      getAllSeries.mockRejectedValue(new Error("Database error"));
      const response = await request(app).get("/api/series");
      expect(response.status).toBe(500);
      expect(response.headers["cache-control"]).toBeUndefined();
      expect(response.body).toEqual({error: "Internal Server Error"});
    });
  });

  describe("GET /api/series/:seriesId", () => {
    it("should return a specific series", async () => {
      getSeriesByNumber.mockResolvedValue({
        seriesNumber: 1,
        candidates: [],
        votes: [],
      });

      const response = await request(app).get("/api/series/1");
      expect(response.status).toBe(200);
      expect(response.headers["cache-control"]).toBe(
        "public, max-age=86400, s-maxage=86400"
      );
      expect(response.body.id).toBe(1);
    });

    it("should return 404 if series not found", async () => {
      getSeriesByNumber.mockResolvedValue(null);

      const response = await request(app).get("/api/series/999");
      expect(response.status).toBe(404);
      expect(response.headers["cache-control"]).toBeUndefined();
    });

    it("should return 400 for invalid series ID", async () => {
      const response = await request(app).get("/api/series/invalid");
      expect(response.status).toBe(400);
      expect(response.headers["cache-control"]).toBeUndefined();
      expect(response.body).toEqual({error: "Invalid series ID"});
    });

    it("should handle errors when fetching a series", async () => {
      getSeriesByNumber.mockRejectedValue(new Error("Database error"));
      const response = await request(app).get("/api/series/1");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({error: "Internal Server Error"});
    });
  });

  describe("GET /api/series/:seriesId/candidates", () => {
    it("should return candidates with default pagination", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      getCandidatesBySeriesNumber.mockResolvedValue([
        {
          id: 101,
          name: "Alice",
          series: 1,
          originalRole: "Faithful",
          roundStates: [{status: "Active"}],
        },
      ]);

      const response = await request(app).get("/api/series/1/candidates");
      expect(response.status).toBe(200);
      expect(response.headers["cache-control"]).toBe(
        "public, max-age=86400, s-maxage=86400"
      );
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe("Alice");
      // Expect default sort parameters "name", "asc"
      expect(getCandidatesBySeriesNumber).toHaveBeenCalledWith(
        1,
        25,
        0,
        "name",
        "asc"
      );
    });

    it("should support custom pagination parameters", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      getCandidatesBySeriesNumber.mockResolvedValue([]);

      const response = await request(app).get(
        "/api/series/1/candidates?limit=10&offset=5"
      );
      expect(response.status).toBe(200);
      expect(getCandidatesBySeriesNumber).toHaveBeenCalledWith(
        1,
        10,
        5,
        "name",
        "asc"
      );
    });

    it("should support sorting by name desc", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      getCandidatesBySeriesNumber.mockResolvedValue([]);

      const response = await request(app).get(
        "/api/series/1/candidates?sortBy=name&sortOrder=desc"
      );
      expect(response.status).toBe(200);
      expect(getCandidatesBySeriesNumber).toHaveBeenCalledWith(
        1,
        25,
        0,
        "name",
        "desc"
      );
    });

    it("should return 400 for invalid limit", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      const response = await request(app).get(
        "/api/series/1/candidates?limit=0"
      );
      expect(response.status).toBe(400);
      expect(response.body).toEqual({error: "Invalid limit"});
    });

    it("should return 400 for invalid offset", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      const response = await request(app).get(
        "/api/series/1/candidates?offset=-1"
      );
      expect(response.status).toBe(400);
      expect(response.body).toEqual({error: "Invalid offset"});
    });

    it("should return 400 for invalid series ID", async () => {
      const response = await request(app).get("/api/series/invalid/candidates");
      expect(response.status).toBe(400);
      expect(response.headers["cache-control"]).toBeUndefined();
      expect(response.body).toEqual({error: "Invalid series ID"});
    });

    it("should return 404 if series not found", async () => {
      getSeriesByNumber.mockResolvedValue(null);
      const response = await request(app).get("/api/series/999/candidates");
      expect(response.status).toBe(404);
      expect(response.headers["cache-control"]).toBeUndefined();
      expect(response.body).toEqual({error: "Series not found"});
    });

    it("should handle errors when fetching candidates", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      getCandidatesBySeriesNumber.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/series/1/candidates");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({error: "Internal Server Error"});
    });
  });

  describe("GET /api/series/:seriesId/votes", () => {
    it("should return votes for a series with default pagination", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      getVotes.mockResolvedValue([
        {series: 1, episode: 1, voterId: 101, targetId: 102, round: 1},
      ]);

      const response = await request(app).get("/api/series/1/votes");
      expect(response.status).toBe(200);
      expect(response.headers["cache-control"]).toBe(
        "public, max-age=86400, s-maxage=86400"
      );
      expect(response.body).toHaveLength(1);
      expect(response.body[0].voterId).toBe(101);
      expect(response.body[0].votedForId).toBe(102);
      expect(getVotes).toHaveBeenCalledWith(1, 20, 0); // Default limit is 20
    });

    it("should support custom pagination parameters", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      getVotes.mockResolvedValue([]);

      const response = await request(app).get(
        "/api/series/1/votes?limit=10&offset=5"
      );
      expect(response.status).toBe(200);
      expect(getVotes).toHaveBeenCalledWith(1, 10, 5);
    });

    it("should return 400 for invalid limit", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      const response = await request(app).get("/api/series/1/votes?limit=0");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({error: "Invalid limit"});
    });

    it("should return 400 for invalid offset", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      const response = await request(app).get("/api/series/1/votes?offset=-1");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({error: "Invalid offset"});
    });

    it("should return 400 for invalid series ID", async () => {
      const response = await request(app).get("/api/series/invalid/votes");
      expect(response.status).toBe(400);
      expect(response.headers["cache-control"]).toBeUndefined();
      expect(response.body).toEqual({error: "Invalid series ID"});
    });

    it("should return 404 if series not found", async () => {
      getSeriesByNumber.mockResolvedValue(null);
      const response = await request(app).get("/api/series/999/votes");
      expect(response.status).toBe(404);
      expect(response.headers["cache-control"]).toBeUndefined();
      expect(response.body).toEqual({error: "Series not found"});
    });

    it("should handle errors when fetching votes", async () => {
      getSeriesByNumber.mockResolvedValue({seriesNumber: 1});
      getVotes.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/series/1/votes");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({error: "Internal Server Error"});
    });
  });
});
