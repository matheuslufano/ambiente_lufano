import { describe, expect, it } from "vitest";
import {
  removeNotebookPage,
  PAGE_KEY_SEPARATOR,
  TITLE_KEY_SEPARATOR,
} from "./notebookPages";

const page = (index: number) => "portugues" + PAGE_KEY_SEPARATOR + index;
const title = (index: number) => "portugues" + TITLE_KEY_SEPARATOR + index;

describe("removeNotebookPage", () => {
  it("shifts later content and titles together without changing another notebook", () => {
    const notes = {
      [page(0)]: "primeira",
      [title(0)]: "Título 1",
      [page(1)]: "remover",
      [title(1)]: "Título 2",
      [page(2)]: "terceira",
      [title(2)]: "Título 3",
      ["direito" + PAGE_KEY_SEPARATOR + 0]: "preservar",
    };
    const result = removeNotebookPage(notes, "portugues", 1);
    expect(result).toEqual({
      [page(0)]: "primeira",
      [title(0)]: "Título 1",
      [page(1)]: "terceira",
      [title(1)]: "Título 3",
      ["direito" + PAGE_KEY_SEPARATOR + 0]: "preservar",
    });
    expect(notes[page(1)]).toBe("remover");
  });
  it("removes legacy first-page content so it cannot reappear", () => {
    expect(
      removeNotebookPage(
        { portugues: "legado", [page(1)]: "segunda", [title(1)]: "Segunda" },
        "portugues",
        0,
      ),
    ).toEqual({ [page(0)]: "segunda", [title(0)]: "Segunda" });
  });
  it("deletes the last sheet without creating a blank entry in the contents", () => {
    expect(
      removeNotebookPage(
        { [page(0)]: "texto", [title(0)]: "Título" },
        "portugues",
        0,
      ),
    ).toEqual({});
  });
  it("preserves legacy content when removing a later sheet and rejects invalid indexes", () => {
    const notes = { portugues: "legado", [title(1)]: "apagar" };
    expect(removeNotebookPage(notes, "portugues", 1)).toEqual({
      portugues: "legado",
    });
    expect(removeNotebookPage(notes, "portugues", -1)).toBe(notes);
  });
});
