import { useState } from "react";
import {
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
  const cards = flashcards.filter((c) => !dueOnly || c.due <= Date.now());
  const card = cards[index % Math.max(1, cards.length)];
  return (
    <div id="flashcards-tool">
      <div className="tool-eyebrow">
        <Layers size={13} /> LEMBRAR É PRATICAR
      </div>
      <h2 className="tool-title">Um cartão por vez.</h2>
      <p className="tool-description">Revise hoje. Lembre amanhã.</p>
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
