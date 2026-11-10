import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../lib/db";
import {
  claimStudyReward,
  claimMockReward,
  feedPet,
  initialPet,
  playWithPet,
  buyOrEquipAccessory,
} from "./petService";
import type { StudySession } from "../types";
beforeEach(async () => {
  await db.petStates.clear();
  await db.petRewards.clear();
});
const anchor = new Date(Date.now() - 7 * 86400000);
anchor.setHours(12, 0, 0, 0);
const base = anchor.getTime();
function session(id: string, start = base, minutes = 25): StudySession {
  return {
    id,
    subjectId: "portugues",
    topic: "Texto",
    startedAt: start,
    duration: minutes * 60,
    endedAt: start + minutes * 60000,
    validIntervals: [{ start, end: start + minutes * 60000 }],
    questions: 0,
    correct: 0,
    summary: "Estudo real concluído",
    date: "2026-11-08",
  };
}
describe("transactional pet persistence", () => {
  it("rewards one recorded mock exam exactly once", async () => {
    const exam = {
      id: "exam-one",
      title: "Simulado registrado",
      total: 100,
      correct: 80,
      completedAt: base,
    };
    await Promise.all([claimMockReward(exam), claimMockReward(exam)]);
    expect((await db.petStates.get("lufi"))?.coins).toBe(50);
    expect((await db.petStates.get("lufi"))?.xp).toBe(0);
    expect(await db.petRewards.count()).toBe(1);
  });
  it("credits simultaneous repeated claims only once and stays idempotent after reopening the database", async () => {
    await Promise.all([
      claimStudyReward(session("same"), 16),
      claimStudyReward(session("same"), 16),
    ]);
    expect((await db.petStates.get("lufi"))?.coins).toBe(30);
    expect(await db.petRewards.count()).toBe(1);
    db.close();
    await db.open();
    await claimStudyReward(session("same"), 16);
    expect((await db.petStates.get("lufi"))?.xp).toBe(30);
  });
  it("does not pay time or questions again for copied overlapping sessions", async () => {
    await claimStudyReward({ ...session("a"), questions: 10 }, 16);
    await claimStudyReward({ ...session("b"), questions: 10 }, 16);
    const pet = await db.petStates.get("lufi");
    expect(pet?.coins).toBe(40);
    expect(pet?.rewardedQuestions).toBe(10);
  });
  it("pays partial new time, then one daily bonus, regardless of repeated synchronization", async () => {
    await claimStudyReward(session("a", base, 25), 0.5);
    await claimStudyReward(session("b", base + 20 * 60000, 40), 0.5);
    await claimStudyReward(session("b", base + 20 * 60000, 40), 0.5);
    const pet = await db.petStates.get("lufi");
    expect(pet?.xp).toBe(80);
    expect(pet?.coins).toBe(120);
    expect(
      (await db.petRewards.toArray()).filter((r) => r.kind === "daily"),
    ).toHaveLength(1);
  });
  it("serializes purchases so two actions cannot spend the same balance", async () => {
    await db.petStates.put({ ...initialPet(), coins: 20 });
    const result = await Promise.allSettled([feedPet("fish"), feedPet("fish")]);
    expect(result.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await db.petStates.get("lufi"))?.coins).toBe(0);
  });
  it("applies milk and juice purchases to the existing pet vitals", async () => {
    await db.petStates.put({ ...initialPet(), coins: 33 });
    await feedPet("milk");
    const afterMilk = await db.petStates.get("lufi");
    expect(afterMilk?.coins).toBe(18);
    expect(afterMilk?.hunger).toBeCloseTo(100, 2);
    expect(afterMilk?.energy).toBeCloseTo(90, 2);

    await feedPet("juice");
    const afterJuice = await db.petStates.get("lufi");
    expect(afterJuice?.coins).toBe(0);
    expect(afterJuice?.hunger).toBeCloseTo(100, 2);
    expect(afterJuice?.energy).toBeCloseTo(100, 2);
  });
  it("buys and equips a new wardrobe accessory", async () => {
    await db.petStates.put({ ...initialPet(), coins: 25 });
    await buyOrEquipAccessory("bow");
    const pet = await db.petStates.get("lufi");
    expect(pet?.coins).toBe(0);
    expect(pet?.owned).toContain("bow");
    expect(pet?.equipped).toBe("bow");
  });
  it("cannot create coins by playing or by repeating the interaction cooldown", async () => {
    await db.petStates.put(initialPet());
    await playWithPet();
    await expect(playWithPet()).rejects.toThrow("minutinho");
    expect((await db.petStates.get("lufi"))?.coins).toBe(0);
  });
});
