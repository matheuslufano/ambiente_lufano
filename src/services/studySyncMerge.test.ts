import { describe, expect, it } from "vitest";
import { mergeStudySnapshots } from "./studySyncMerge";

describe("study synchronization three-way merge", () => {
  it("keeps independent sessions added on two devices", () => {
    expect(mergeStudySnapshots({ sessions: [] }, { sessions: [{ id: "a" }] }, { sessions: [{ id: "b" }] }))
      .toEqual({ sessions: [{ id: "a" }, { id: "b" }] });
  });
  it("propagates deletions without resurrecting records", () => {
    const base = { cards: [{ id: "a", title: "A" }, { id: "b", title: "B" }] };
    expect(mergeStudySnapshots(base, { cards: [base.cards[1]] }, base)).toEqual({ cards: [base.cards[1]] });
  });
  it("does not overwrite simultaneous edits to the same note", () => {
    expect(() => mergeStudySnapshots({ notes: { a: "old" } }, { notes: { a: "local" } }, { notes: { a: "remote" } })).toThrow("Conflito");
  });
  it("merges independent profile fields", () => {
    expect(mergeStudySnapshots({ preferences: { name: "A", theme: "light" } },
      { preferences: { name: "B", theme: "light" } }, { preferences: { name: "A", theme: "dark" } }))
      .toEqual({ preferences: { name: "B", theme: "dark" } });
  });
  it("rejects editing a record deleted on another device", () => {
    expect(() => mergeStudySnapshots({ cards: [{ id: "a", title: "old" }] },
      { cards: [] }, { cards: [{ id: "a", title: "new" }] })).toThrow("Conflito");
  });
});
