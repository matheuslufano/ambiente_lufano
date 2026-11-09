import { Extension } from "@tiptap/core";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { motion, useReducedMotion } from "motion/react";
import {
  AlignCenter,
  ArrowLeft,
  ArrowRight,
  Bold,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Italic,
  List,
  ListOrdered,
  Trash2,
  X,
} from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import { GlassButton, GlassIconButton, GlassModal } from "../Glass/Glass";
import styles from "./NotebooksPanel.module.css";
import NotebookPageRemoval from "./NotebookPageRemoval";
import {
  PAGE_KEY_SEPARATOR,
  TITLE_KEY_SEPARATOR,
} from "../../lib/notebookPages";

const EMPTY_PAGE = "<p></p>";
const STARTER_PROMPT = "Comece suas anotações aqui…";
const NotebookTextAlignment = Extension.create({
  name: "notebookTextAlignment",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => element.style.textAlign || null,
            renderHTML: (attributes) =>
              attributes.textAlign
                ? { style: "text-align: " + attributes.textAlign }
                : {},
          },
        },
      },
    ];
  },
});

function notebookPageKey(subjectId: string, contentIndex: number) {
  return subjectId + PAGE_KEY_SEPARATOR + contentIndex;
}

function notebookTitleKey(subjectId: string, contentIndex: number) {
  return subjectId + TITLE_KEY_SEPARATOR + contentIndex;
}

function cleanStarterPrompt(content: string) {
  return content.replace(
    /^<p>\s*Comece suas anotações aqui…\s*<\/p>/,
    EMPTY_PAGE,
  );
}

function getNotebookPageContent(
  notes: Record<string, string>,
  subjectId: string,
  contentIndex: number,
) {
  const content =
    notes[notebookPageKey(subjectId, contentIndex)] ??
    (contentIndex === 0 ? notes[subjectId] : undefined) ??
    EMPTY_PAGE;
  return cleanStarterPrompt(content);
}

function getNotebookPageTitle(
  notes: Record<string, string>,
  subjectId: string,
  contentIndex: number,
) {
  return (
    notes[notebookTitleKey(subjectId, contentIndex)] ||
    (getNotebookPageContent(notes, subjectId, contentIndex) !== EMPTY_PAGE
      ? "Anotações"
      : "Nova página")
  );
}

function getNotebookContentIndexes(
  notes: Record<string, string>,
  subjectId: string,
) {
  const indexes = new Set<number>();
  const pagePrefix = subjectId + PAGE_KEY_SEPARATOR;
  const titlePrefix = subjectId + TITLE_KEY_SEPARATOR;
  if (notes[subjectId]) indexes.add(0);
  for (const key of Object.keys(notes)) {
    const prefix = key.startsWith(pagePrefix)
      ? pagePrefix
      : key.startsWith(titlePrefix)
        ? titlePrefix
        : null;
    if (!prefix) continue;
    const index = Number(key.slice(prefix.length));
    if (Number.isInteger(index) && index >= 0) indexes.add(index);
  }
  return [...indexes].sort((left, right) => left - right);
}

function hasNotebookContent(notes: Record<string, string>, subjectId: string) {
  return (
    Boolean(notes[subjectId]) ||
    getNotebookContentIndexes(notes, subjectId).length > 0
  );
}

function NotebookEditor({
  subjectId,
  pageIndex,
  active,
  onActivate,
}: {
  subjectId: string;
  pageIndex: number;
  active: boolean;
  onActivate: () => void;
}) {
  const { notes, saveNote } = useStudyStore();
  const contentIndex = pageIndex - 1;
  const noteKey = notebookPageKey(subjectId, contentIndex);
  const titleKey = notebookTitleKey(subjectId, contentIndex);
  const pageTitle = getNotebookPageTitle(notes, subjectId, contentIndex);
  const editor = useEditor({
    extensions: [StarterKit, NotebookTextAlignment],
    content: getNotebookPageContent(notes, subjectId, contentIndex),
    onUpdate: ({ editor: updatedEditor }) => {
      saveNote(noteKey, updatedEditor.getHTML());
      if (useStudyStore.getState().notes[titleKey] === undefined)
        saveNote(titleKey, "Anotações");
    },
    onFocus: onActivate,
    editorProps: {
      attributes: {
        id: "notebook-editor-" + subjectId + "-page-" + (pageIndex + 1),
        "aria-label": "Anotações da folha " + (pageIndex + 1),
        "data-notebook-placeholder": STARTER_PROMPT,
      },
    },
  });

  return (
    <div className={styles.notebookWritingArea}>
      <input
        id={"notebook-title-" + subjectId + "-page-" + (pageIndex + 1)}
        className={styles.notebookPageTitle}
        aria-label={"Título da folha " + (pageIndex + 1)}
        value={pageTitle}
        onFocus={(event) => {
          onActivate();
          if (pageTitle === "Nova página" || pageTitle === "Anotações")
            event.currentTarget.select();
        }}
        onChange={(event) => saveNote(titleKey, event.target.value)}
        onClick={onActivate}
        placeholder="Título da folha"
      />
      {active && (
        <div
          className={styles.notebookToolbar}
          aria-label={"Formatação da folha " + (pageIndex + 1)}
          onMouseDown={(event) => event.preventDefault()}
        >
          {[
            {
              id: "bold",
              label: "Negrito",
              icon: Bold,
              action: () => editor?.chain().focus().toggleBold().run(),
            },
            {
              id: "italic",
              label: "Itálico",
              icon: Italic,
              action: () => editor?.chain().focus().toggleItalic().run(),
            },
            {
              id: "list",
              label: "Lista com marcadores",
              icon: List,
              action: () => editor?.chain().focus().toggleBulletList().run(),
            },
            {
              id: "ordered",
              label: "Lista numerada",
              icon: ListOrdered,
              action: () => editor?.chain().focus().toggleOrderedList().run(),
            },
            {
              id: "align-center",
              label: "Centralizar texto",
              icon: AlignCenter,
              action: () =>
                editor
                  ?.chain()
                  .focus()
                  .updateAttributes("paragraph", { textAlign: "center" })
                  .run(),
            },
          ].map(({ id, label, icon: Icon, action }) => (
            <GlassIconButton
              key={id}
              id={"notebook-format-" + id + "-page-" + (pageIndex + 1)}
              aria-label={label}
              onClick={action}
            >
              <Icon size={14} />
            </GlassIconButton>
          ))}
        </div>
      )}
      <EditorContent
        editor={editor}
        className={styles.notebookEditor}
        onClick={onActivate}
      />
    </div>
  );
}

export default function NotebooksPanel({
  onClose = () => {},
}: {
  onClose?: () => void;
}) {
  const { subjects, notes, deleteNotebookPage } = useStudyStore();
  const [deletingPage, setDeletingPage] = useState<number | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<number | null>(null);
  const [pageRevision, setPageRevision] = useState(0);
  const [deletionMessage, setDeletionMessage] = useState("");
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState<number | null>(null);
  const [turnDirection, setTurnDirection] = useState<"next" | "previous">(
    "next",
  );
  const [pageFlip, setPageFlip] = useState<"next" | "previous" | null>(null);
  const [singlePage, setSinglePage] = useState(
    () => window.matchMedia("(max-width: 700px)").matches,
  );
  const selectedSubject = subjects.find((subject) => subject.id === selected);
  const visiblePages = singlePage ? [pageIndex] : [pageIndex, pageIndex + 1];
  const contentIndexes = selectedSubject
    ? getNotebookContentIndexes(notes, selectedSubject.id)
    : [];

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const updateLayout = (event: MediaQueryListEvent) =>
      setSinglePage(event.matches);
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  function turnPages(direction: "next" | "previous") {
    if (pageFlip || deletingPage !== null) return;
    setTurnDirection(direction);
    setPageFlip(direction);
  }

  function completePageTurn() {
    const pageStep = singlePage ? 1 : 2;
    setPageIndex((current) =>
      turnDirection === "next"
        ? current + pageStep
        : Math.max(0, current - pageStep),
    );
    setActivePageIndex(null);
    setPageFlip(null);
  }

  function openContentsPage(contentIndex: number) {
    const targetPageIndex = contentIndex + 1;
    setTurnDirection(targetPageIndex >= pageIndex ? "next" : "previous");
    setActivePageIndex(targetPageIndex);
    setPageIndex(
      singlePage ? targetPageIndex : Math.floor(targetPageIndex / 2) * 2,
    );
  }

  function completePageDeletion() {
    if (deletingPage === null || !selectedSubject) return;
    deleteNotebookPage(selectedSubject.id, deletingPage - 1);
    const remaining = getNotebookContentIndexes(
      useStudyStore.getState().notes,
      selectedSubject.id,
    );
    const lastPage = remaining.length ? remaining[remaining.length - 1] + 1 : 0;
    setPageIndex((current) =>
      Math.min(current, singlePage ? lastPage : Math.floor(lastPage / 2) * 2),
    );
    setPageRevision((revision) => revision + 1);
    setActivePageIndex(null);
    setDeletingPage(null);
    setDeletionMessage("Folha excluída. O sumário foi atualizado.");
  }

  const flipPageIndex =
    pageFlip === "next" ? (singlePage ? pageIndex : pageIndex + 1) : pageIndex;
  const reversePageIndex =
    pageFlip === "next"
      ? singlePage
        ? pageIndex + 1
        : pageIndex + 2
      : Math.max(0, pageIndex - 1);

  return (
    <section id="notebooks-tool" className={styles.notebookWorkspace}>
      <header className={styles.notebookHeader}>
        <div>
          <h2>{selectedSubject?.name || "Seus cadernos."}</h2>
        </div>
        <GlassIconButton
          id="notebooks-close"
          disabled={deletingPage !== null}
          aria-label="Fechar cadernos e voltar ao calendário"
          onClick={onClose}
        >
          <X size={17} />
        </GlassIconButton>
      </header>

      {selectedSubject ? (
        <div className={styles.openNotebook}>
          <div className={styles.openNotebookToolbar}>
            <GlassButton
              id="notebook-back"
              disabled={deletingPage !== null}
              onClick={() => {
                setSelected(null);
                setPageIndex(0);
                setActivePageIndex(null);
              }}
            >
              <ArrowLeft size={14} /> Todos os cadernos
            </GlassButton>
            <div className={styles.pageTurnControls}>
              <GlassIconButton
                id="notebook-previous-pages"
                aria-label="Virar folha para trás"
                disabled={
                  pageIndex === 0 || !!pageFlip || deletingPage !== null
                }
                onClick={() => turnPages("previous")}
              >
                <ChevronLeft size={16} />
              </GlassIconButton>
              <span>
                {singlePage
                  ? "Folha " + (pageIndex + 1)
                  : "Folhas " + (pageIndex + 1) + "–" + (pageIndex + 2)}
              </span>
              <GlassIconButton
                id="notebook-next-pages"
                aria-label="Virar folha para frente"
                disabled={!!pageFlip || deletingPage !== null}
                onClick={() => turnPages("next")}
              >
                <ChevronRight size={16} />
              </GlassIconButton>
            </div>
          </div>

          <div
            className={styles.notebookBookFrame}
            data-single-page={singlePage}
            inert={deletingPage !== null}
            aria-busy={deletingPage !== null}
          >
            <div className={styles.notebookSpread}>
              {visiblePages.map((page) => (
                <div
                  key={page + "-" + pageRevision}
                  className={styles.notebookPageSlot}
                  data-deleting={deletingPage === page}
                >
                  {deletingPage === page && (
                    <div className={styles.notebookPage} aria-hidden="true">
                      <span className={styles.notebookPageFooter}>
                        {page + 1}
                      </span>
                    </div>
                  )}
                  <motion.article
                    initial={false}
                    animate={
                      deletingPage === page
                        ? {
                            x: [0, page === pageIndex ? -10 : 10, 0, 0, 0],
                            y: [0, -18, -10, 0, 0],
                            rotate: [0, -7, 12, -12, 8],
                            rotateY: [0, -24, 34, -30, 0],
                            scaleX: [1, 0.97, 0.65, 0.28, 0.2],
                            scaleY: [1, 0.98, 0.7, 0.25, 0.15],
                            borderRadius: [0, 0, 30, 90, 130],
                            opacity: [1, 1, 1, 0.8, 0],
                          }
                        : {}
                    }
                    transition={{
                      duration: reduceMotion ? 0.01 : 0.98,
                      times: [0, 0.22, 0.5, 0.78, 1],
                      ease: "easeInOut",
                    }}
                    className={styles.notebookPage}
                    data-active={activePageIndex === page}
                    data-deleting={deletingPage === page}
                    aria-label={"Folha " + (page + 1)}
                    onClick={() => setActivePageIndex(page)}
                  >
                    {page > 0 && (
                      <button
                        id={"notebook-delete-page-" + page}
                        className={styles.notebookDeletePage}
                        type="button"
                        aria-label={"Excluir folha " + (page + 1)}
                        title="Arrancar e excluir esta folha"
                        disabled={!!pageFlip || deletingPage !== null}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingDeletion(page);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    {page === 0 ? (
                      <>
                        <h3 className={styles.contentsTitle}>Sumário</h3>
                        <nav
                          className={styles.notebookContents}
                          aria-label="Sumário do caderno"
                        >
                          {contentIndexes.length ? (
                            contentIndexes.map((contentIndex) => (
                              <button
                                id={
                                  "notebook-contents-page-" + (contentIndex + 2)
                                }
                                key={contentIndex}
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openContentsPage(contentIndex);
                                }}
                              >
                                <span>
                                  {getNotebookPageTitle(
                                    notes,
                                    selectedSubject.id,
                                    contentIndex,
                                  )}
                                </span>
                                <small>{contentIndex + 2}</small>
                              </button>
                            ))
                          ) : (
                            <p className={styles.notebookContentsEmpty}>
                              Os títulos das suas folhas aparecerão aqui.
                            </p>
                          )}
                        </nav>
                      </>
                    ) : (
                      <NotebookEditor
                        key={selectedSubject.id + "-" + page}
                        subjectId={selectedSubject.id}
                        pageIndex={page}
                        active={activePageIndex === page}
                        onActivate={() => setActivePageIndex(page)}
                      />
                    )}
                    <span className={styles.notebookPageFooter}>
                      {page + 1}
                    </span>
                  </motion.article>
                  {deletingPage === page && (
                    <NotebookPageRemoval
                      reducedMotion={!!reduceMotion}
                      onComplete={completePageDeletion}
                    />
                  )}
                </div>
              ))}
            </div>

            <nav
              id="notebook-contents-bookmark"
              className={styles.notebookBookmarks}
              data-side="left"
              aria-label="Marcador do sumário"
            >
              <button
                id="notebook-bookmark-contents"
                type="button"
                className={styles.notebookBookmark}
                data-color="contents"
                data-active={pageIndex === 0}
                aria-label={"Ir para o sumário de " + selectedSubject.name}
                onClick={() => {
                  setPageIndex(0);
                  setActivePageIndex(null);
                }}
              >
                <span className={styles.notebookBookmarkLabel}>Sumário</span>
              </button>
            </nav>

            <nav
              id="notebook-subject-bookmarks"
              className={styles.notebookBookmarks}
              data-side="right"
              aria-label="Marcadores dos cadernos"
            >
              {subjects.map((subject, index) => (
                <button
                  id={"notebook-bookmark-" + subject.id}
                  key={subject.id}
                  type="button"
                  className={styles.notebookBookmark}
                  data-color={index % 8}
                  data-active={subject.id === selectedSubject.id}
                  aria-label={"Abrir caderno de " + subject.name}
                  onClick={() => {
                    if (subject.id === selectedSubject.id) return;
                    setSelected(subject.id);
                    setPageIndex(0);
                    setActivePageIndex(null);
                    setPageFlip(null);
                  }}
                >
                  <span className={styles.notebookBookmarkLabel}>
                    {subject.name}
                  </span>
                </button>
              ))}
            </nav>

            <button
              id="notebook-book-edge-previous"
              className={styles.notebookBookEdge}
              data-edge="previous"
              type="button"
              aria-label="Virar a folha anterior"
              disabled={pageIndex === 0 || !!pageFlip}
              onClick={() => turnPages("previous")}
            >
              <ChevronLeft size={19} />
            </button>
            <button
              id="notebook-book-edge-next"
              className={styles.notebookBookEdge}
              data-edge="next"
              type="button"
              aria-label="Virar a próxima folha"
              disabled={!!pageFlip}
              onClick={() => turnPages("next")}
            >
              <ChevronRight size={19} />
            </button>

            {pageFlip && (
              <motion.div
                key={"page-flip-" + pageIndex + "-" + pageFlip}
                className={styles.notebookFlipSheet}
                data-direction={pageFlip}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: pageFlip === "next" ? -180 : 180 }}
                transition={{ duration: 0.62, ease: [0.45, 0, 0.25, 1] }}
                onAnimationComplete={completePageTurn}
              >
                <div className={styles.notebookFlipFront}>
                  <strong>
                    {flipPageIndex === 0
                      ? "Sumário"
                      : getNotebookPageTitle(
                          notes,
                          selectedSubject.id,
                          flipPageIndex - 1,
                        )}
                  </strong>
                  <span>{flipPageIndex + 1}</span>
                </div>
                <div className={styles.notebookFlipBack}>
                  <strong>
                    {reversePageIndex === 0
                      ? "Sumário"
                      : getNotebookPageTitle(
                          notes,
                          selectedSubject.id,
                          reversePageIndex - 1,
                        )}
                  </strong>
                  <span>{reversePageIndex + 1}</span>
                </div>
              </motion.div>
            )}
          </div>
          <footer className={styles.notebookFooter}>
            <span role="status">
              {deletionMessage ||
                "Selecione uma folha para escrever e formatar o texto."}
            </span>
            <GlassButton
              id="notebook-turn-next"
              variant="primary"
              disabled={!!pageFlip || deletingPage !== null}
              onClick={() => turnPages("next")}
            >
              {singlePage ? "Próxima folha" : "Virar folha"}{" "}
              <ArrowRight size={14} />
            </GlassButton>
          </footer>
        </div>
      ) : (
        <div className={styles.notebookShelf}>
          {subjects.map((subject) => (
            <button
              id={"notebook-open-" + subject.id}
              key={subject.id}
              className={styles.notebookBook}
              onClick={() => {
                setSelected(subject.id);
                setPageIndex(0);
                setActivePageIndex(null);
              }}
              style={
                { "--notebook-cover": subject.color } as React.CSSProperties
              }
            >
              <span className={styles.notebookCover}>
                <BookOpen size={24} />
                <strong>{subject.name}</strong>
              </span>
              <span className={styles.notebookBookCaption}>
                {hasNotebookContent(notes, subject.id)
                  ? "Continuar escrevendo"
                  : "Começar a primeira folha"}
              </span>
            </button>
          ))}
          {!subjects.length && (
            <div className={styles.notebookEmptyShelf}>
              <BookOpen size={28} />
              <strong>Seu primeiro caderno começa com uma matéria.</strong>
              <p>Adicione matérias ao seu objetivo para criar cadernos.</p>
            </div>
          )}
        </div>
      )}
      <GlassModal
        id="notebook-delete-confirmation"
        title="Excluir esta folha?"
        description={
          pendingDeletion !== null && selectedSubject
            ? `A folha ${pendingDeletion + 1}, “${getNotebookPageTitle(notes, selectedSubject.id, pendingDeletion - 1)}”, será excluída. Essa ação não pode ser desfeita.`
            : undefined
        }
        open={pendingDeletion !== null}
        onClose={() => setPendingDeletion(null)}
      >
        <div className={styles.notebookDeleteActions}>
          <GlassButton
            id="notebook-delete-cancel"
            autoFocus
            onClick={() => setPendingDeletion(null)}
          >
            Cancelar
          </GlassButton>
          <GlassButton
            id="notebook-delete-confirm"
            variant="danger"
            onClick={() => {
              if (pendingDeletion === null) return;
              setActivePageIndex(null);
              setDeletionMessage("");
              setDeletingPage(pendingDeletion);
              setPendingDeletion(null);
            }}
          >
            <Trash2 size={15} /> Excluir folha
          </GlassButton>
        </div>
      </GlassModal>
    </section>
  );
}
