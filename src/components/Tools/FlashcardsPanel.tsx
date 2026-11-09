import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Plus,
  RotateCw,
  Trash2,
} from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import { GlassButton, GlassIconButton, GlassModal } from "../Glass/Glass";
import styles from "./Tools.module.css";
export default function FlashcardsPanel() {
  const {
    subjects,
    flashcards,
    addFlashcard,
    reviewFlashcard,
    deleteFlashcard,
  } = useStudyStore();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [create, setCreate] = useState(false);
  const [dueOnly, setDueOnly] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const subjectCards = flashcards.filter(
    (card) => selectedSubject === "all" || card.subjectId === selectedSubject,
  );
  const cards = subjectCards.filter(
    (card) => !dueOnly || card.due <= Date.now(),
  );
  const card = cards[index % Math.max(1, cards.length)];
  return (
    <div id="flashcards-tool" className={styles.flashcardsWorkspace}>
      <div className="tool-eyebrow">
        <Layers size={13} /> LEMBRAR É PRATICAR
      </div>
      <h2 className={`tool-title ${styles.flashcardsTitle}`}>
        Um cartão por vez.
      </h2>
      <p className={`tool-description ${styles.flashcardsDescription}`}>
        Revise hoje. Lembre amanhã.
      </p>
      <section
        id="flashcards-subject-filter"
        className={styles.flashcardSubjects}
        aria-label="Selecionar matéria dos flashcards"
      >
        <div className={styles.flashcardSubjectsHeading}>
          <strong>Matérias</strong>
          <span>{subjectCards.length} cartões</span>
        </div>
        <button
          id="flashcards-subject-trigger"
          className={styles.flashcardSubjectTrigger}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={subjectsOpen}
          aria-controls="flashcards-subject-list"
          onClick={() => setSubjectsOpen((open) => !open)}
        >
          <span>
            {selectedSubject === "all"
              ? "Todas as matérias"
              : subjects.find((subject) => subject.id === selectedSubject)
                  ?.name || "Selecione uma matéria"}
          </span>
          <ChevronDown size={15} />
        </button>
        {subjectsOpen && (
          <div
            id="flashcards-subject-list"
            className={styles.flashcardSubjectList}
            role="group"
            aria-label="Matérias disponíveis"
          >
            <button
              id="flashcards-subject-all"
              type="button"
              className={styles.flashcardSubjectOption}
              data-selected={selectedSubject === "all"}
              aria-pressed={selectedSubject === "all"}
              onClick={() => {
                setSelectedSubject("all");
                setIndex(0);
                setFlipped(false);
                setSubjectsOpen(false);
              }}
            >
              <span>Todas as matérias</span>
              <small>{flashcards.length}</small>
            </button>
            {subjects.map((subject) => {
              const count = flashcards.filter(
                (card) => card.subjectId === subject.id,
              ).length;
              return (
                <button
                  id={`flashcards-subject-${subject.id}`}
                  key={subject.id}
                  type="button"
                  className={styles.flashcardSubjectOption}
                  data-selected={selectedSubject === subject.id}
                  aria-pressed={selectedSubject === subject.id}
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    setIndex(0);
                    setFlipped(false);
                    setSubjectsOpen(false);
                  }}
                >
                  <span>{subject.name}</span>
                  <small>{count}</small>
                </button>
              );
            })}
          </div>
        )}
      </section>
      <div className={styles.flashcardControls}>
        <label>
          <input
            id="flashcards-due-only"
            type="checkbox"
            checked={dueOnly}
            onChange={(e) => {
              setDueOnly(e.target.checked);
              setIndex(0);
              setFlipped(false);
            }}
          />{" "}
          Apenas revisões pendentes
        </label>
        <GlassIconButton
          id="flashcard-add"
          aria-label="Criar flashcard"
          onClick={() => setCreate(true)}
        >
          <Plus size={16} />
        </GlassIconButton>
      </div>
      {card ? (
        <>
          <button
            id="flashcard-flip"
            className={styles.flashcard}
            data-flipped={flipped}
            aria-label={flipped ? "Mostrar pergunta" : "Mostrar resposta"}
            onClick={() => setFlipped(!flipped)}
          >
            <span className={styles.cardInner}>
              <span className={styles.cardFront}>
                <small>
                  {subjects.find((s) => s.id === card.subjectId)?.name ||
                    "Disciplina arquivada"}
                </small>
                <strong>{card.question}</strong>
                <span>
                  <RotateCw size={12} /> Toque para revelar
                </span>
              </span>
              <span className={styles.cardBack}>
                <small>RESPOSTA</small>
                <strong>{card.answer}</strong>
                <span>Qual foi sua facilidade?</span>
              </span>
            </span>
          </button>
          <div className={styles.cardNavigation}>
            <GlassIconButton
              id="flashcard-previous"
              aria-label="Cartão anterior"
              onClick={() => {
                setIndex((index + cards.length - 1) % cards.length);
                setFlipped(false);
              }}
            >
              <ChevronLeft size={15} />
            </GlassIconButton>
            <span>
              {(index % cards.length) + 1} de {cards.length}
            </span>
            <GlassIconButton
              id="flashcard-next"
              aria-label="Próximo cartão"
              onClick={() => {
                setIndex((index + 1) % cards.length);
                setFlipped(false);
              }}
            >
              <ChevronRight size={15} />
            </GlassIconButton>
          </div>
          {flipped && (
            <div className={styles.ratings}>
              {["Errei", "Difícil", "Bom", "Fácil"].map((rating, i) => (
                <button
                  id={`flashcard-rate-${i}`}
                  key={rating}
                  onClick={() => {
                    reviewFlashcard(card.id, i);
                    setFlipped(false);
                    setIndex((index + 1) % cards.length);
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
          )}
          <p className="form-hint">
            Próxima revisão: {new Date(card.due).toLocaleString("pt-BR")}
          </p>
          <GlassIconButton
            id="flashcard-delete"
            aria-label="Excluir cartão atual"
            onClick={() => {
              deleteFlashcard(card.id);
              setIndex(0);
              setFlipped(false);
            }}
          >
            <Trash2 size={14} />
          </GlassIconButton>
        </>
      ) : (
        <div className="empty-state">
          <Layers size={35} />
          <strong>
            {dueOnly
              ? "Revisões em dia."
              : "Seu conhecimento em pequenas doses."}
          </strong>
          <p>
            {dueOnly
              ? "Volte mais tarde ou visualize todos os cartões."
              : "Crie seu primeiro cartão para começar."}
          </p>
          <GlassButton
            id="flashcard-create-empty"
            onClick={() => setCreate(true)}
          >
            <Plus size={14} /> Criar cartão
          </GlassButton>
        </div>
      )}
      <GlassModal
        id="flashcard-create-modal"
        title="Novo flashcard"
        open={create}
        onClose={() => setCreate(false)}
      >
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            addFlashcard({
              subjectId: String(d.get("subject")),
              question: String(d.get("question")),
              answer: String(d.get("answer")),
            });
            setCreate(false);
            setDueOnly(false);
          }}
        >
          <label>
            Disciplina
            <select name="subject">
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Pergunta
            <textarea
              id="flashcard-question"
              name="question"
              rows={3}
              required
            />
          </label>
          <label>
            Resposta
            <textarea id="flashcard-answer" name="answer" rows={4} required />
          </label>
          <GlassButton id="flashcard-save" variant="primary" type="submit">
            Salvar cartão
          </GlassButton>
        </form>
      </GlassModal>
    </div>
  );
}
