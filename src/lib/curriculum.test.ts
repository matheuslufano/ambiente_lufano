import { describe, expect, it } from "vitest";
import { normalizeCurriculum } from "./curriculum";
describe("legacy curriculum normalization", () => {
  it("retains subject IDs, topics and goals while assigning legacy groups", () => {
    const old = [
      {
        id: "penal",
        name: "Direito Penal",
        color: "#123",
        targetHours: 73,
        topics: ["Meu tópico"],
      },
    ];
    const result = normalizeCurriculum(old);
    expect(result.subjects[0]).toEqual({
      ...old[0],
      groupId: "nocoes-direito",
      targetQuestions: 0,
    });
    expect(old[0]).not.toHaveProperty("groupId");
  });
  it("preserves custom groups, empty groups and question targets during backup restoration", () => {
    const groups = [
      { id: "custom", name: "Grupo pessoal" },
      { id: "empty", name: "Em preparação" },
    ];
    const result = normalizeCurriculum(
      [
        {
          id: "my-subject",
          name: "Minha matéria",
          color: "#123",
          targetHours: 10,
          targetQuestions: 500,
          groupId: "custom",
          topics: ["Tópico"],
        },
      ],
      groups,
    );
    expect(result.subjectGroups).toEqual(groups);
    expect(result.subjects[0].targetQuestions).toBe(500);
    expect(result.subjects[0].groupId).toBe("custom");
  });
  it("keeps unknown subjects accessible instead of silently dropping them", () => {
    const result = normalizeCurriculum([
      {
        id: "custom",
        name: "Matéria personalizada",
        color: "#123",
        targetHours: 10,
        topics: [],
      },
    ]);
    expect(result.subjectGroups).toContainEqual({
      id: "outras-materias",
      name: "Outras matérias",
    });
    expect(result.subjects[0].groupId).toBe("outras-materias");
  });
});
