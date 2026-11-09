import { describe, expect, it } from "vitest";
import { appRoutes, pageFromHash } from "./appRoutes";
describe("bookmarkable application pages", () => {
  it("resolves each header link to a distinct page and supports the initial URL", () => {
    expect(new Set(appRoutes.map((route) => route.path)).size).toBe(6);
    for (const route of appRoutes)
      expect(pageFromHash(`#${route.path}`)).toBe(route.id);
    expect(pageFromHash("")).toBe("home");
  });
  it("preserves known pages with trailing slashes/queries and rejects unknown routes", () => {
    expect(pageFromHash("#/atividades/?dia=hoje")).toBe("activities");
    expect(pageFromHash("#/inexistente")).toBe("not-found");
  });
});
