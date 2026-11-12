export type StudySnapshot = Record<string, unknown>;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** Three-way merge: preserve independent edits, including deletions; reject collisions. */
export function mergeStudySnapshots(
  base: StudySnapshot, local: StudySnapshot, remote: StudySnapshot,
): StudySnapshot {
  function merge(b: unknown, l: unknown, r: unknown, path: string): unknown {
    if (same(l, r) || same(b, r)) return l;
    if (same(b, l)) return r;
    if (object(b) && object(l) && object(r)) {
      return Object.fromEntries([...new Set([...Object.keys(b), ...Object.keys(l), ...Object.keys(r)])]
        .map(key => [key, merge(b[key], l[key], r[key], `${path}.${key}`)])
        .filter(([, value]) => value !== undefined));
    }
    if (Array.isArray(b) && Array.isArray(l) && Array.isArray(r) &&
      [...b, ...l, ...r].every(item => object(item) && typeof item.id === "string")) {
      const index = (items: Record<string, unknown>[]) => Object.fromEntries(items.map(item => [String(item.id), item]));
      return Object.values(merge(index(b), index(l), index(r), path) as StudySnapshot);
    }
    throw new Error(`Conflito em ${path}. Os dados locais foram preservados. Exporte um backup antes de carregar a versão da nuvem.`);
  }
  return merge(base, local, remote, "estudos") as StudySnapshot;
}
