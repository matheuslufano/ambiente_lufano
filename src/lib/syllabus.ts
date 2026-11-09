/** Splits numbered syllabus items while preserving punctuation inside each topic. */
export function extractSyllabusTopics(
  text: string,
  subjectName = "",
): string[] {
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/\u00ad/g, "")
    .trim();
  if (!normalized) return [];
  const markers = [
    ...normalized.matchAll(/(?:^|\s)(\d+(?:\.\d+)+(?:[.)])?|\d+[.)])\s+/g),
  ];
  const parts = markers.length
    ? markers.map((marker, i) =>
        normalized.slice(
          marker.index! + marker[0].length,
          markers[i + 1]?.index ?? normalized.length,
        ),
      )
    : normalized.split(/\n+/);
  const identity = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const heading = identity(subjectName);
  return [
    ...new Set(
      parts
        .map((part) =>
          part
            .replace(/^\s*[-•–]\s*/, "")
            .replace(/\s+/g, " ")
            .replace(/[;\s]+$/, "")
            .trim(),
        )
        .filter((part) => part && (!heading || identity(part) !== heading)),
    ),
  ];
}
