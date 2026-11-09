import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  ArrowLeft,
  Bold,
  BookOpen,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";
import { useStudyStore } from "../../store/useStudyStore";
import { GlassButton, GlassIconButton } from "../Glass/Glass";
import styles from "./Tools.module.css";
function NotebookEditor({ subjectId }: { subjectId: string }) {
  const { notes, saveNote } = useStudyStore();
  const editor = useEditor({
    extensions: [StarterKit],
    content: notes[subjectId] || "<p>Comece suas anotações aqui…</p>",
    onUpdate: ({ editor }) => saveNote(subjectId, editor.getHTML()),
    editorProps: {
      attributes: {
        id: `notebook-editor-${subjectId}`,
        "aria-label": "Editor do caderno",
      },
    },
  });
  return (
    <>
      <div className={styles.editorToolbar}>
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
            label: "Lista",
            icon: List,
            action: () => editor?.chain().focus().toggleBulletList().run(),
          },
          {
            id: "ordered",
            label: "Lista numerada",
            icon: ListOrdered,
            action: () => editor?.chain().focus().toggleOrderedList().run(),
          },
        ].map(({ id, label, icon: Icon, action }) => (
          <GlassIconButton
            key={id}
            id={`notebook-format-${id}`}
            aria-label={label}
            onClick={action}
          >
            <Icon size={15} />
          </GlassIconButton>
        ))}
      </div>
      <EditorContent editor={editor} className={styles.editor} />
      <p className="form-hint">Salvo automaticamente neste dispositivo.</p>
    </>
  );
}
export default function NotebooksPanel() {
  const { subjects, notes } = useStudyStore();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div id="notebooks-tool">
      <div className="tool-eyebrow">
        <BookOpen size={13} /> CONHECIMENTO QUE FICA
      </div>
      <h2 className="tool-title">Seus cadernos.</h2>
      <p className="tool-description">Um lugar para organizar suas ideias.</p>
      {selected ? (
        <>
          <GlassButton id="notebook-back" onClick={() => setSelected(null)}>
            <ArrowLeft size={14} /> Todos os cadernos
          </GlassButton>
          <h3 className={styles.notebookTitle}>
            {subjects.find((s) => s.id === selected)?.name}
          </h3>
          <NotebookEditor key={selected} subjectId={selected} />
        </>
      ) : (
        <div className={styles.notebooks}>
          {subjects.map((s) => (
            <button
              id={`notebook-open-${s.id}`}
              key={s.id}
              className={styles.notebook}
              onClick={() => setSelected(s.id)}
              style={{ "--book-color": s.color } as React.CSSProperties}
            >
              <div>
                <BookOpen size={22} />
                <span>{s.name}</span>
              </div>
              <small>
                {notes[s.id] ? "Continuar escrevendo" : "Uma nova página"}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
