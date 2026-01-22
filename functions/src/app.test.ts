import request from "supertest";
import * as admin from "firebase-admin";
import app from "./app";

// Mock @gcp-adl/core for ingestion endpoint
jest.mock("@gcp-adl/core", () => ({
  runIngestionProcess: jest.fn().mockResolvedValue(undefined),
  createStorageWriter: jest.fn()
}));

// Initialize Firestore if not already initialized (should be handled in app.ts, but safe to check)
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

describe("Functions API Integration Tests", () => {
  // Clear Firestore before tests
  beforeAll(async () => {
    // Note: Emulators must be running for this to work correctly in a real integration scenario.
    // If emulators are not running, this might try to hit real Firestore or fail depending on config.
    // For local tests without `firebase emulators:exec`, we assume the environment is set up to point to emulator.
    // However, usually `process.env.FIRESTORE_EMULATOR_HOST` is needed.
  });

  beforeEach(async () => {
     // Clear relevant collections
     await deleteCollection(db, "series", 50);
     await deleteCollection(db, "candidates", 50);

     // Seed data
     await db.collection("series").add({ id: 1, title: "Series 1", year: 2022 });
     await db.collection("series").add({ id: 2, title: "Series 2", year: 2023 });
     await db.collection("candidates").add({ id: 101, name: "Alice", seriesId: 1, role: "Faithful", outcome: "Winner" });
     await db.collection("candidates").add({ id: 102, name: "Bob", seriesId: 1, role: "Traitor", outcome: "Banished" });
     await db.collection("candidates").add({ id: 201, name: "Charlie", seriesId: 2, role: "Faithful", outcome: "Murdered" });
  });

  async function deleteCollection(db: admin.firestore.Firestore, collectionPath: string, batchSize: number) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }

  async function deleteQueryBatch(db: admin.firestore.Firestore, query: admin.firestore.Query, resolve: (value?: unknown) => void) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve);
    });
  }

  describe("GET /status", () => {
    it("should respond with 200 OK", async () => {
      const response = await request(app).get("/status");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({status: "ok"});
    });
  });

  describe("GET /series", () => {
    it("should return all series", async () => {
      const response = await request(app).get("/series");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.find((s: any) => s.id === 1)).toBeDefined();
    });
  });

  describe("GET /series/:seriesId", () => {
    it("should return a specific series", async () => {
      const response = await request(app).get("/series/1");
      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Series 1");
    });

    it("should return 404 for non-existent series", async () => {
      const response = await request(app).get("/series/999");
      expect(response.status).toBe(404);
    });
  });

  describe("GET /series/:seriesId/candidates", () => {
    it("should return candidates for a series", async () => {
      const response = await request(app).get("/series/1/candidates");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      // Alice and Bob are in series 1
    });

    it("should return empty list if no candidates found for series", async () => {
      const response = await request(app).get("/series/3/candidates"); // Series 3 doesn't exist/has no candidates seeded
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe("GET /candidates/:candidateId", () => {
    it("should return a specific candidate", async () => {
      const response = await request(app).get("/candidates/101");
      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Alice");
    });

    it("should return 404 for non-existent candidate", async () => {
      const response = await request(app).get("/candidates/999");
      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/ingest", () => {
    it("should accept requests with valid token", async () => {
      const { runIngestionProcess } = require("@gcp-adl/core");
      const response = await request(app)
        .post("/api/ingest")
        .set("X-Auth-Token", "LOCAL_DEV_TOKEN");

      expect(response.status).toBe(202);
      expect(runIngestionProcess).toHaveBeenCalled();
    });
  });
});
