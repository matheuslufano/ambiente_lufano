import { useState } from "react";
import { FileText, ListChecks, Trash2, Upload } from "lucide-react";
import type { Subject, SubjectGroup } from "../../types";
import { extractSyllabusTopics } from "../../lib/syllabus";
import { readPdfSyllabus } from "../../lib/pdfSyllabus";
import { GlassButton, GlassIconButton } from "../Glass/Glass";
import styles from "./GoalEditor.module.css";
export default function SubjectSyllabusEditor({
  subject,
  groups,
  onChange,
  onRemove,
  locked,
}: {
  subject: Subject;
  groups: SubjectGroup[];
  onChange: (patch: Partial<Subject>) => void;
  onRemove: () => void;
  locked: boolean;
}) {
  const [reading, setReading] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <details
      id={`goal-subject-editor-${subject.id}`}
      className={styles.subjectEditor}
    >
      <summary>
        <FileText size={14} />
        <span>{subject.name || "Nova matéria"}</span>
        <small>{subject.topics.length} tópicos</small>
      </summary>
      <div className={styles.subjectFields}>
        <label>
          Nome da matéria
          <input
            id={`goal-subject-name-${subject.id}`}
            value={subject.name}
            required
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </label>
        <label>
          Grupo
          <select
            id={`goal-subject-group-${subject.id}`}
            value={subject.groupId}
            onChange={(e) => onChange({ groupId: e.target.value })}
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name || "Novo grupo"}
              </option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>
            Meta de questões
            <input
              id={`goal-subject-questions-${subject.id}`}
              type="number"
              min="0"
              max="1000000"
              step="1"
              value={subject.targetQuestions}
              required
              onChange={(e) =>
                onChange({ targetQuestions: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Meta de horas
            <input
              id={`goal-subject-hours-${subject.id}`}
              type="number"
              min="0"
              max="100000"
              step="0.5"
              value={subject.targetHours}
              required
              onChange={(e) =>
                onChange({ targetHours: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <label>
          Conteúdo programático do edital
          <textarea
            id={`goal-subject-syllabus-${subject.id}`}
            rows={5}
            value={subject.syllabusText || ""}
            onChange={(e) => onChange({ syllabusText: e.target.value })}
            placeholder={
              "Cole aqui o trecho desta matéria.\nEx.: 1. Interpretação de textos; 2. Pontuação; 3. Concordância verbal e nominal."
            }
          />
        </label>
        <div className={styles.syllabusActions}>
          <label className={styles.pdfUpload} aria-disabled={reading}>
            <Upload size={13} />
            {reading ? "Lendo PDF…" : "Carregar texto do PDF"}
            <input
              id={`goal-subject-pdf-${subject.id}`}
              type="file"
              accept="application/pdf,.pdf"
              disabled={reading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setReading(true);
                setMessage("");
                try {
                  const text = await readPdfSyllabus(file);
                  onChange({ syllabusText: text });
                  setMessage(
                    "Texto do PDF carregado. Mantenha apenas o trecho desta matéria e clique em Extrair tópicos.",
                  );
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Não foi possível ler o PDF.",
                  );
                } finally {
                  setReading(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
          <GlassButton
            id={`goal-subject-extract-${subject.id}`}
            type="button"
            disabled={reading || !subject.syllabusText?.trim()}
            onClick={() => {
              const topics = extractSyllabusTopics(
                subject.syllabusText || "",
                subject.name,
              );
              onChange({ topics });
              setMessage(
                topics.length
                  ? `${topics.length} tópicos extraídos. Revise a lista abaixo antes de salvar.`
                  : "Nenhum tópico encontrado. Cole o conteúdo desta matéria.",
              );
            }}
          >
            <ListChecks size={14} /> Extrair tópicos
          </GlassButton>
        </div>
        <p className="form-hint">
          O texto é processado neste dispositivo. A extração reconhece itens
          numerados e junta linhas quebradas; não inventa conteúdo. PDFs
          escaneados precisam de OCR externo.
        </p>
        {message && (
          <p className={styles.extractionMessage} role="status">
            {message}
          </p>
        )}
        <label>
          Tópicos para revisar (um por linha)
          <textarea
            id={`goal-subject-topics-${subject.id}`}
            rows={Math.min(10, Math.max(3, subject.topics.length + 1))}
            value={subject.topics.join("\n")}
            onChange={(e) => onChange({ topics: e.target.value.split("\n") })}
            placeholder="Os tópicos extraídos aparecem aqui. Você também pode escrevê-los ou corrigi-los."
          />
        </label>
        <div className={styles.removeSubject}>
          <span>
            {locked
              ? "Encerre a sessão ativa para remover esta matéria."
              : "Remover do objetivo mantém os registros anteriores."}
          </span>
          <GlassIconButton
            id={`goal-subject-remove-${subject.id}`}
            type="button"
            aria-label={`Remover matéria ${subject.name}`}
            disabled={locked}
            onClick={onRemove}
          >
            <Trash2 size={14} />
          </GlassIconButton>
        </div>
      </div>
    </details>
  );
}
