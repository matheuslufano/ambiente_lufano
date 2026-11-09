import type { StudyShortcut } from "../types";
export const defaultShortcuts: StudyShortcut[] = [
  {
    id: "questions",
    label: "Qconcursos",
    url: "https://www.qconcursos.com/",
    icon: "questions",
  },
  {
    id: "courses",
    label: "Gran Cursos",
    url: "https://www.grancursosonline.com.br/",
    icon: "courses",
  },
  {
    id: "youtube",
    label: "YouTube",
    url: "https://www.youtube.com/",
    icon: "youtube",
  },
  {
    id: "drive",
    label: "Google Drive",
    url: "https://drive.google.com/",
    icon: "drive",
  },
];
export function isHttpsUrl(value: unknown): value is string {
  try {
    return typeof value === "string" && new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
export function validShortcuts(value: unknown): value is StudyShortcut[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.label === "string" &&
        item.label.trim() &&
        isHttpsUrl(item.url) &&
        ["questions", "courses", "youtube", "drive", "site"].includes(
          item.icon,
        ),
    ) &&
    new Set(value.map((item) => item.id)).size === value.length
  );
}
