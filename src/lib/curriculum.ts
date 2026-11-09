import type { Subject, SubjectGroup } from "../types";
import { extractSyllabusTopics } from "./syllabus";
export const defaultSubjectGroups: SubjectGroup[] = [
  { id: "basicas-gerais", name: "Disciplinas Básicas e Gerais" },
  { id: "nocoes-direito", name: "Noções de Direito" },
  { id: "especificos-locais", name: "Conhecimentos Específicos e Locais" },
];
export const portugueseSyllabus =
  "1. Leitura, compreensão e interpretação de textos de diferentes gêneros; 2. Sinônimos e antônimos; 3. Sentido próprio e figurado das palavras; 4. Pontuação; 5. Classes de palavras: substantivo, adjetivo, numeral, artigo, pronome, verbo, advérbio, preposição e conjunção; 6. Concordância verbal e nominal; 7. Regência verbal e nominal; 8. Colocação pronominal; 9. Emprego do sinal indicativo de crase.";
const definitions = [
  ["portugues", "Língua Portuguesa", 0],
  ["raciocinio", "Raciocínio Lógico-Matemático", 0],
  ["informatica", "Noções de Informática", 0],
  ["constitucional", "Direito Constitucional", 1],
  ["administrativo", "Direito Administrativo", 1],
  ["penal", "Direito Penal", 1],
  ["processual-penal", "Direito Processual Penal", 1],
  ["legislacao-penal", "Legislação Penal Especial / Extravagantes", 1],
  ["direitos-humanos", "Direitos Humanos", 1],
  ["legislacao-institucional", "Legislação Institucional do Estatuto", 2],
  ["medicina-legal", "Medicina Legal", 2],
  ["criminalistica", "Criminalística", 2],
  ["criminologia", "Criminologia", 2],
] as const;
export const initialSubjects: Subject[] = definitions.map(
  ([id, name, group]) => ({
    id,
    name,
    groupId: defaultSubjectGroups[group].id,
    color: ["#718b65", "#859fbc", "#b7a276"][group],
    topics: id === "portugues" ? extractSyllabusTopics(portugueseSyllabus) : [],
    syllabusText: id === "portugues" ? portugueseSyllabus : "",
    targetHours: 40,
    targetQuestions: 0,
  }),
);
type LegacySubject = Omit<Subject, "groupId" | "targetQuestions"> &
  Partial<Pick<Subject, "groupId" | "targetQuestions">>;
/** Adds missing grouping metadata without changing existing subject IDs or histories. */
export function normalizeCurriculum(
  subjects: LegacySubject[],
  groups?: SubjectGroup[],
) {
  const resultGroups = (groups ?? defaultSubjectGroups).map((group) => ({
    ...group,
  }));
  const resultSubjects = subjects.map((subject) => {
    const match = initialSubjects.find(
      (item) => item.id === subject.id || item.name === subject.name,
    );
    const groupId =
      subject.groupId &&
      resultGroups.some((group) => group.id === subject.groupId)
        ? subject.groupId
        : match?.groupId;
    const resolvedGroup =
      groupId && resultGroups.some((group) => group.id === groupId)
        ? groupId
        : "outras-materias";
    if (!resultGroups.some((group) => group.id === resolvedGroup))
      resultGroups.push({ id: resolvedGroup, name: "Outras matérias" });
    return {
      ...subject,
      groupId: resolvedGroup,
      targetQuestions: subject.targetQuestions ?? 0,
    };
  });
  return { subjectGroups: resultGroups, subjects: resultSubjects };
}
