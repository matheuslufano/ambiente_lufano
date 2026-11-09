import { describe, expect, it } from "vitest";
import { defaultShortcuts, isHttpsUrl, validShortcuts } from "./shortcuts";
describe("study shortcut validation", () => {
  it("accepts the configured study sites and an empty user list", () => {
    expect(validShortcuts(defaultShortcuts)).toBe(true);
    expect(validShortcuts([])).toBe(true);
  });
  it("rejects script URLs, invalid addresses and duplicate identifiers", () => {
    expect(isHttpsUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpsUrl("site sem endereço")).toBe(false);
    expect(validShortcuts([defaultShortcuts[0], defaultShortcuts[0]])).toBe(
      false,
    );
  });
});
