import { useState } from "react";
import { Pencil, Plus, Save } from "lucide-react";
import { useStudyStore } from "../store/useStudyStore";
import { GlassButton } from "../components/Glass/Glass";
import type { StudyPost } from "../types";
import styles from "./WorkspacePages.module.css";
export default function StudyJournal() {
  const { studyPosts, saveStudyPost } = useStudyStore();
  const [editing, setEditing] = useState<StudyPost | null>(null);
  return (
    <section id="study-journal">
      <div className={styles.pageHeader}>
        <div>
          <span>SUAS IDEIAS MERECEM UM LUGAR</span>
          <h2>Meus textos de estudo</h2>
          <p>
            Textos pessoais salvos neste dispositivo. Salvar aqui não publica na
            internet.
          </p>
        </div>
        <GlassButton
          id="blog-new-post"
          onClick={() =>
            setEditing({
              id: crypto.randomUUID(),
              title: "",
              body: "",
              updatedAt: Date.now(),
            })
          }
        >
          <Plus size={15} /> Novo texto
        </GlassButton>
      </div>
      {editing && (
        <form
          id="blog-post-editor"
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            if (!editing.title.trim() || !editing.body.trim()) return;
            saveStudyPost({
              ...editing,
              title: editing.title.trim(),
              body: editing.body.trim(),
              updatedAt: Date.now(),
            });
            setEditing(null);
          }}
        >
          <label>
            Título
            <input
              id="blog-post-title"
              required
              maxLength={180}
              value={editing.title}
              onChange={(event) =>
                setEditing({ ...editing, title: event.target.value })
              }
            />
          </label>
          <label>
            Seu texto
            <textarea
              id="blog-post-body"
              required
              rows={10}
              value={editing.body}
              onChange={(event) =>
                setEditing({ ...editing, body: event.target.value })
              }
            />
          </label>
          <div className={styles.pageActions}>
            <GlassButton
              id="blog-cancel-edit"
              type="button"
              onClick={() => setEditing(null)}
            >
              Cancelar
            </GlassButton>
            <GlassButton id="blog-save-post" type="submit" variant="primary">
              <Save size={14} /> Salvar no dispositivo
            </GlassButton>
          </div>
        </form>
      )}
      <div className={styles.posts}>
        {studyPosts
          .slice()
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((post) => (
            <article key={post.id}>
              <span>
                {new Date(post.updatedAt).toLocaleDateString("pt-BR")}
              </span>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              <GlassButton
                id={`blog-edit-${post.id}`}
                onClick={() => setEditing({ ...post })}
              >
                <Pencil size={13} /> Editar texto
              </GlassButton>
            </article>
          ))}
      </div>
      {!studyPosts.length && !editing && (
        <div className="empty-state">
          <h2>Uma página para o que você aprende.</h2>
          <p>Crie seu primeiro texto. Nenhum artigo fictício foi adicionado.</p>
        </div>
      )}
    </section>
  );
}
