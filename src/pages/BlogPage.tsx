import { useState } from "react";
import { ArrowUpRight, BookOpenText, NotebookPen, Search } from "lucide-react";
import StudyJournal from "./StudyJournal";
import styles from "./WorkspacePages.module.css";
const articles = [
  {
    id: "revisoes",
    title: "Como fazer revisões",
    category: "Técnicas de estudos",
    description: "Uma leitura sobre revisão e continuidade na preparação.",
    url: "https://aprovadoapp.com/blog/como-fazer-revisoes",
  },
  {
    id: "confianca",
    title: "O segredo para marcar X com confiança",
    category: "Técnicas de estudos",
    description: "Uma história sobre preparação e hábitos para o dia da prova.",
    url: "https://aprovadoapp.com/blog/segredo-marcar-x",
  },
  {
    id: "cursos",
    title: "Cursos preparatórios: como escolher",
    category: "Como estudar",
    description:
      "Pontos para avaliar ao escolher cursos presenciais ou online.",
    url: "https://aprovadoapp.com/blog/curso-para-concurso",
  },
];
export default function BlogPage() {
  const [tab, setTab] = useState("articles"),
    [category, setCategory] = useState("Todos"),
    [query, setQuery] = useState("");
  const shown = articles.filter(
    (a) =>
      (category === "Todos" || a.category === category) &&
      `${a.title} ${a.description}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  return (
    <main id="blog-page" className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Blog</h1>
          <p>Leituras para organizar seus estudos e avançar na preparação.</p>
        </div>
      </div>
      <nav
        id="blog-tabs"
        className={styles.pageTabs}
        aria-label="Conteúdo do Blog"
      >
        <button
          id="blog-articles-tab"
          aria-pressed={tab === "articles"}
          onClick={() => setTab("articles")}
        >
          <BookOpenText size={16} /> Artigos
        </button>
        <button
          id="blog-journal-tab"
          aria-pressed={tab === "journal"}
          onClick={() => setTab("journal")}
        >
          <NotebookPen size={16} /> Meus textos
        </button>
      </nav>
      {tab === "journal" ? (
        <StudyJournal />
      ) : (
        <div className={styles.blogLayout}>
          <section id="blog-article-list" className={styles.articleFeed}>
            {shown.map((a) => (
              <article key={a.id}>
                <span className={styles.articleCategory}>{a.category}</span>
                <h2>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {a.title}
                  </a>
                </h2>
                <p>{a.description}</p>
                <a
                  className={styles.articleLink}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ler no Blog do Aprovado <ArrowUpRight size={14} />
                </a>
              </article>
            ))}
            {!shown.length && (
              <p className={styles.emptyNotice}>Nenhum artigo encontrado.</p>
            )}
          </section>
          <aside id="blog-sidebar" className={styles.filterPanel}>
            <h2>Encontre uma leitura</h2>
            <label>
              Buscar artigo
              <div className={styles.searchField}>
                <Search size={14} />
                <input
                  id="blog-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Título ou assunto"
                />
              </div>
            </label>
            <h2>Categorias</h2>
            {["Todos", "Como estudar", "Técnicas de estudos"].map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
            <h2>Mais leituras</h2>
            <a
              href="https://aprovadoapp.com/blog"
              target="_blank"
              rel="noreferrer"
            >
              Ver todos no Blog do Aprovado <ArrowUpRight size={12} />
            </a>
            <p className="form-hint">
              Seleção de links externos. Os artigos completos pertencem ao
              Aprovado e abrem no site original.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
