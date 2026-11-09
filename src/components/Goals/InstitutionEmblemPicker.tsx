import { useEffect, useRef, useState } from "react";
import { ExternalLink, Search, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Goal, InstitutionEmblem as Emblem } from "../../types";
import {
  searchInstitutionEmblems,
  downloadInstitutionEmblem,
} from "../../lib/institutionEmblems";
import { GlassButton } from "../Glass/Glass";
import InstitutionEmblem from "./InstitutionEmblem";
import styles from "./InstitutionEmblemPicker.module.css";
export default function InstitutionEmblemPicker({
  goal,
  blob,
  onSelect,
  onClear,
}: {
  goal: Goal;
  blob: Blob | null;
  onSelect: (emblem: Emblem, blob: Blob) => void;
  onClear: () => void;
}) {
  const [input, setInput] = useState(goal.institution);
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  useEffect(() => setInput(goal.institution), [goal.institution]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (!blob) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  const results = useQuery({
    queryKey: ["institution-emblems", query],
    queryFn: ({ signal }) => searchInstitutionEmblems(query, signal),
    enabled: !!query,
    staleTime: 15 * 60 * 1000,
    retry: false,
  });
  return (
    <section
      id="goal-institution-emblem-picker"
      className={styles.picker}
      aria-label="Buscar brasão da instituição"
    >
      <InstitutionEmblem goal={goal} previewUrl={preview} />
      <strong className={styles.institution}>{goal.institution}</strong>
      <label>
        Buscar instituição
        <input
          id="goal-emblem-search-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex.: Polícia Civil Tocantins"
        />
      </label>
      <GlassButton
        id="goal-emblem-search"
        type="button"
        disabled={input.trim().length < 3 || results.isFetching || busy}
        onClick={() => {
          setError("");
          if (query === input.trim()) void results.refetch();
          else setQuery(input.trim());
        }}
      >
        <Search size={14} />
        {results.isFetching ? "Buscando…" : "Buscar brasão via API"}
      </GlassButton>
      <p className="form-hint">
        Resultados do Wikimedia Commons. Confira instituição, versão e licença
        antes de escolher.
      </p>
      {(error || results.error) && (
        <p className="error-message" role="alert">
          {error || results.error?.message}
        </p>
      )}
      {results.isSuccess && !results.data.length && (
        <p className="form-hint">
          Nenhuma imagem encontrada. Tente o nome completo da instituição.
        </p>
      )}
      <div className={styles.results}>
        {results.data?.map((emblem, index) => (
          <article key={emblem.source}>
            <img src={emblem.url} alt={emblem.title} loading="lazy" />
            <div>
              <strong>{emblem.title}</strong>
              <span>
                {emblem.license} · {emblem.author}
              </span>
              <a href={emblem.source} target="_blank" rel="noreferrer">
                Ver fonte <ExternalLink size={10} />
              </a>
              <GlassButton
                id={`goal-emblem-select-${index}`}
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    const downloaded = await downloadInstitutionEmblem(emblem);
                    if (alive.current) onSelect(emblem, downloaded);
                  } catch (reason) {
                    if (alive.current)
                      setError(
                        reason instanceof Error
                          ? reason.message
                          : "Erro ao baixar a imagem.",
                      );
                  } finally {
                    if (alive.current) setBusy(false);
                  }
                }}
              >
                {busy ? "Baixando…" : "Usar este brasão"}
              </GlassButton>
            </div>
          </article>
        ))}
      </div>
      {goal.emblem && (
        <>
          <a
            className={styles.source}
            href={goal.emblem.source}
            target="_blank"
            rel="noreferrer"
          >
            Brasão escolhido · {goal.emblem.license}
          </a>
          <GlassButton id="goal-emblem-clear" type="button" onClick={onClear}>
            <Trash2 size={12} /> Remover escolha
          </GlassButton>
        </>
      )}
    </section>
  );
}
