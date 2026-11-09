export const PAGE_KEY_SEPARATOR = "::notebook-page::";
export const TITLE_KEY_SEPARATOR = "::notebook-title::";

/** Removes one note sheet and shifts later titles/content together, preserving other notebooks. */
export function removeNotebookPage(
  notes: Record<string, string>,
  subjectId: string,
  contentIndex: number,
): Record<string, string> {
  if (!Number.isInteger(contentIndex) || contentIndex < 0) return notes;
  const result = { ...notes };
  if (contentIndex === 0) delete result[subjectId];
  for (const separator of [PAGE_KEY_SEPARATOR, TITLE_KEY_SEPARATOR]) {
    const prefix = subjectId + separator;
    const entries = Object.entries(notes).filter(([key]) => {
      if (!key.startsWith(prefix)) return false;
      const index = Number(key.slice(prefix.length));
      return Number.isInteger(index) && index >= contentIndex;
    });
    for (const [key] of entries) delete result[key];
    for (const [key, value] of entries) {
      const index = Number(key.slice(prefix.length));
      if (index > contentIndex) result[prefix + (index - 1)] = value;
    }
  }
  return result;
}
