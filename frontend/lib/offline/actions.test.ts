import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/offline/db";
import { createIncidentOffline, createSosOffline } from "@/lib/offline/actions";

describe("createIncidentOffline", () => {
  beforeEach(async () => {
    await db.incidents.clear();
    await db.sync_queue.clear();
    await db.session.clear();
    await db.device.clear();
  });

  it("writes a PENDING incident with a client uuid and queues a CREATE_INCIDENT op", async () => {
    const incident = await createIncidentOffline({
      type: "FLOOD",
      title: "Rising water near residential area",
      description: "Water level rising near residential area.",
      severity: "HIGH",
      latitude: 7.0707,
      longitude: 125.6087,
      location_accuracy: 10,
    });

    expect(incident.uuid).toBeTruthy();
    expect(incident.status).toBe("REPORTED");
    expect(incident.verification_status).toBe("UNVERIFIED");

    const stored = await db.incidents.get(incident.uuid);
    expect(stored?.syncState).toBe("PENDING");
    expect(stored?.type).toBe("FLOOD");

    const queue = await db.sync_queue.toArray();
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe("CREATE_INCIDENT");
    expect(queue[0].local_ref).toBe(incident.uuid);
    expect((queue[0].payload as { uuid: string }).uuid).toBe(incident.uuid);
  });

  it("assigns a fresh uuid to every incident, even with identical content", async () => {
    const a = await createIncidentOffline({
      type: "FIRE",
      title: "Same title",
      description: "Same description text here.",
      severity: "MEDIUM",
      latitude: 1,
      longitude: 1,
      location_accuracy: null,
    });
    const b = await createIncidentOffline({
      type: "FIRE",
      title: "Same title",
      description: "Same description text here.",
      severity: "MEDIUM",
      latitude: 1,
      longitude: 1,
      location_accuracy: null,
    });

    expect(a.uuid).not.toBe(b.uuid);
    expect(await db.incidents.count()).toBe(2);
  });
});

describe("createSosOffline", () => {
  beforeEach(async () => {
    await db.sos_requests.clear();
    await db.sync_queue.clear();
  });

  it("defaults severity to CRITICAL and status to ACTIVE", async () => {
    const sos = await createSosOffline({
      latitude: 7.07,
      longitude: 125.61,
      message: "Need help",
    });

    expect(sos.severity).toBe("CRITICAL");
    expect(sos.status).toBe("ACTIVE");

    const queue = await db.sync_queue.toArray();
    expect(queue.filter((op) => op.type === "CREATE_SOS")).toHaveLength(1);
  });
});
