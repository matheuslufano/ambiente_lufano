import { afterEach, describe, expect, it, vi } from "vitest";
import {
  downloadInstitutionEmblem,
  isInstitutionEmblem,
  parseEmblemResults,
  searchInstitutionEmblems,
} from "./institutionEmblems";
const emblem = {
  title: "PC-TO",
  url: "https://upload.wikimedia.org/wikipedia/commons/9/98/Pctocantins.jpg",
  source: "https://commons.wikimedia.org/wiki/File:Pctocantins.jpg",
  license: "Public domain",
  author: "PC-TO",
};
afterEach(() => vi.restoreAllMocks());
describe("institution emblem API integration", () => {
  it("keeps provenance and converts attribution to plain text", () => {
    const results = parseEmblemResults({
      query: {
        pages: {
          "1": {
            title: "File:PC-TO.png",
            imageinfo: [
              {
                mime: "image/png",
                url: emblem.url,
                descriptionurl: emblem.source,
                extmetadata: {
                  Artist: { value: "<b>PC-TO</b>" },
                  LicenseShortName: { value: "Public domain" },
                },
              },
            ],
          },
        },
      },
    });
    expect(results).toEqual([{ ...emblem, title: "PC-TO.png" }]);
  });
  it("rejects documents, external image hosts and unsafe source links", () => {
    expect(
      parseEmblemResults({
        query: {
          pages: {
            "1": {
              imageinfo: [
                {
                  mime: "application/pdf",
                  url: emblem.url,
                  descriptionurl: emblem.source,
                },
              ],
            },
            "2": {
              imageinfo: [
                {
                  mime: "image/png",
                  url: "https://untrusted.example/logo.png",
                  descriptionurl: emblem.source,
                },
              ],
            },
            "3": {
              imageinfo: [
                {
                  mime: "image/png",
                  url: emblem.url,
                  descriptionurl: "javascript:alert(1)",
                },
              ],
            },
          },
        },
      }),
    ).toEqual([]);
    expect(isInstitutionEmblem(emblem)).toBe(true);
    expect(
      isInstitutionEmblem({ ...emblem, source: "javascript:alert(1)" }),
    ).toBe(false);
  });
  it("handles API errors even when returned inside a successful HTTP response", () => {
    expect(() =>
      parseEmblemResults({ error: { info: "Limite de consultas" } }),
    ).toThrow("Limite de consultas");
  });
  it("uses the public CORS endpoint and expands the PC-TO abbreviation without credentials", async () => {
    const mocked = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ query: { pages: {} } }), { status: 200 }),
      );
    await expect(searchInstitutionEmblems("PC - TO")).resolves.toEqual([]);
    const [url, options] = mocked.mock.calls[0];
    const parsed = new URL(String(url));
    expect(parsed.origin).toBe("https://commons.wikimedia.org");
    expect(parsed.searchParams.get("origin")).toBe("*");
    expect(parsed.searchParams.get("gsrsearch")).toBe(
      "Polícia Civil Tocantins",
    );
    expect(options?.credentials).toBe("omit");
  });
  it("reports rate limits instead of pretending an image was downloaded", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 429 }),
    );
    await expect(downloadInstitutionEmblem(emblem)).rejects.toThrow(
      "limitou os downloads",
    );
  });
});
