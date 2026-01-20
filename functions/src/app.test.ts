import request from "supertest";
import app from "./app";

describe("Functions API", () => {
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

    it("should accept requests with valid token", async () => {
      const response = await request(app)
        .post("/api/ingest")
        .set("X-Auth-Token", "LOCAL_DEV_TOKEN");
      expect(response.status).toBe(202);
      expect(response.body).toEqual({
        status: "ingestion_started",
      });
    });
  });
});
