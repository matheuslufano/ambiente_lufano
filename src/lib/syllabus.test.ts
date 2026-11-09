import { describe, expect, it } from "vitest";
import { extractSyllabusTopics } from "./syllabus";
import { portugueseSyllabus } from "./curriculum";
describe("syllabus extraction from user-provided text", () => {
  it("extracts the nine Portuguese topics while retaining the internal word-class list", () => {
    const text =
      "1. Língua Portuguesa\n" +
      portugueseSyllabus.replace("e antônimos", "e\nantônimos");
    const topics = extractSyllabusTopics(text, "Língua Portuguesa");
    expect(topics).toHaveLength(9);
    expect(topics[0]).toBe(
      "Leitura, compreensão e interpretação de textos de diferentes gêneros",
    );
    expect(topics[1]).toBe("Sinônimos e antônimos");
    expect(topics[4]).toContain(
      "substantivo, adjetivo, numeral, artigo, pronome, verbo, advérbio, preposição e conjunção",
    );
    expect(topics[8]).toBe("Emprego do sinal indicativo de crase.");
  });
  it("does not split semicolons that have no numbered topic following them", () => {
    expect(
      extractSyllabusTopics(
        "1. Classes: substantivo; verbo; pronome; 2. Pontuação.",
      ),
    ).toEqual(["Classes: substantivo; verbo; pronome", "Pontuação."]);
  });
  it("supports numbered subtopics, bullets, duplicate lines and empty input", () => {
    expect(extractSyllabusTopics("1.1 Princípios\n1.2 Direitos")).toEqual([
      "Princípios",
      "Direitos",
    ]);
    expect(extractSyllabusTopics("• Pontuação\n- Crase\n• Pontuação")).toEqual([
      "Pontuação",
      "Crase",
    ]);
    expect(extractSyllabusTopics("  ")).toEqual([]);
  });
});
