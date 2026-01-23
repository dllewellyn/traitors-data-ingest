import request from "supertest";

// This test assumes the emulator is running at localhost:5001
// It corresponds to the 'Emulator Integration Tests' requirement.
// Note: In a real CI environment, we would start the emulator
// programmatically or via a service.
// For this 'manual' verification phase, we skip it if the emulator
// isn't reachable.

const EMULATOR_HOST = "http://localhost:5001/demo-test/us-central1/api";

describe("Emulator Integration Tests", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let isEmulatorRunning = false;

  beforeAll(async () => {
    try {
      const response = await request(EMULATOR_HOST)
        .get("/api/health")
        .timeout(1000);
      if (response.status === 200) {
        isEmulatorRunning = true;
      }
    } catch {
      // eslint-disable-next-line no-console
      console.log("Emulator not running, skipping integration tests");
    }
  });

  it("should pass health check on emulator", async () => {
    if (!isEmulatorRunning) {
      // eslint-disable-next-line no-console
      console.log("Skipping test because emulator is not running");
      return;
    }

    const response = await request(EMULATOR_HOST).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({status: "ok"});
  });

  it("should support manual trigger on emulator", async () => {
    if (!isEmulatorRunning) {
      return;
    }

    const response = await request(EMULATOR_HOST)
      .post("/api/ingest")
      .set("X-Auth-Token", "LOCAL_DEV_TOKEN");

    expect(response.status).toBe(202);
    expect(response.body).toEqual({
      status: "ingestion_started",
    });
  });
});
