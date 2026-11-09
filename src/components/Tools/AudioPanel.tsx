import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Search, Square, Trash2 } from "lucide-react";
import { db } from "../../lib/db";
import type { AudioNote } from "../../types";
import { useStudyStore } from "../../store/useStudyStore";
import { GlassButton, GlassIconButton } from "../Glass/Glass";
import styles from "./Tools.module.css";
function AudioItem({
  note,
  onDelete,
  onRename,
}: {
  note: AudioNote;
  onDelete: () => void;
  onRename: () => Promise<void>;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(note.blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [note.blob]);
  return (
    <article className={styles.audioItem}>
      <div>
        <input
          aria-label="Nome da gravação"
          defaultValue={note.title}
          onBlur={(e) => {
            if (e.target.value.trim())
              void db.audioNotes
                .update(note.id, {
                  title: e.target.value.trim(),
                })
                .then(onRename);
          }}
        />
        <GlassIconButton
          id={`audio-delete-${note.id}`}
          aria-label="Excluir gravação"
          onClick={onDelete}
        >
          <Trash2 size={13} />
        </GlassIconButton>
      </div>
      <span>{new Date(note.date).toLocaleString("pt-BR")}</span>
      <audio controls src={url} preload="metadata" />
    </article>
  );
}
export default function AudioPanel() {
  const { subjects } = useStudyStore();
  const [notes, setNotes] = useState<AudioNote[]>([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState(subjects[0]?.id || "");
  const [state, setState] = useState<"idle" | "recording" | "paused">("idle");
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  async function refresh() {
    try {
      const result = await db.audioNotes.toArray();
      if (mounted.current) setNotes(result.reverse());
    } catch {
      setError("Não foi possível acessar o armazenamento de áudios.");
    }
  }
  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
      recorder.current?.state !== "inactive" && recorder.current?.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  async function record() {
    try {
      setError("");
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error("Este navegador não oferece gravação de áudio.");
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      const rec = new MediaRecorder(media);
      recorder.current = rec;
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = () => {
        media.getTracks().forEach((t) => t.stop());
        void db.audioNotes
          .add({
            id: crypto.randomUUID(),
            title: `Resumo · ${subjects.find((s) => s.id === subject)?.name || "Estudo"}`,
            subjectId: subject,
            date: new Date().toISOString(),
            blob: new Blob(chunks, { type: rec.mimeType }),
          })
          .then(refresh)
          .catch(() => setError("Não foi possível salvar a gravação."));
      };
      rec.start();
      setState("recording");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível acessar o microfone.",
      );
    }
  }
  return (
    <div id="audio-library-tool" className={styles.audioWorkspace}>
      <header className={styles.audioHeader}>
        <div className="tool-eyebrow">
          <Mic size={13} /> DÊ VOZ AO APRENDIZADO
        </div>
        <h2 className={`tool-title ${styles.audioTitle}`}>
          Suas ideias, em voz alta.
        </h2>
        <p className={`tool-description ${styles.audioDescription}`}>
          Grave resumos para ouvir no seu tempo.
        </p>
      </header>
      <div className={`form-stack ${styles.audioComposer}`}>
        <label>
          Disciplina
          <select
            id="audio-subject"
            disabled={state !== "idle"}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.recordingControls}>
          {state === "idle" ? (
            <GlassButton
              id="audio-record"
              variant="primary"
              onClick={() => void record()}
            >
              <Mic size={15} /> Nova gravação
            </GlassButton>
          ) : (
            <>
              <GlassButton
                id="audio-pause"
                onClick={() => {
                  if (state === "recording") {
                    recorder.current?.pause();
                    setState("paused");
                  } else {
                    recorder.current?.resume();
                    setState("recording");
                  }
                }}
              >
                {state === "recording" ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} />
                )}{" "}
                {state === "recording" ? "Pausar" : "Retomar"}
              </GlassButton>
              <GlassButton
                id="audio-stop"
                onClick={() => {
                  recorder.current?.stop();
                  setState("idle");
                }}
              >
                <Square size={13} /> Salvar
              </GlassButton>
            </>
          )}
        </div>
        {state !== "idle" && (
          <p role="status" className={styles.recordingStatus}>
            {state === "recording" ? "Gravando…" : "Gravação pausada"}
          </p>
        )}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <label className={styles.audioSearch}>
          <Search size={14} />
          <input
            id="audio-search"
            placeholder="Buscar gravações"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className={styles.audioList} aria-label="Gravações salvas">
        {notes
          .filter((n) => n.title.toLowerCase().includes(search.toLowerCase()))
          .map((note) => (
            <AudioItem
              key={note.id}
              note={note}
              onDelete={() => void db.audioNotes.delete(note.id).then(refresh)}
              onRename={refresh}
            />
          ))}
        {!notes.length && (
          <div className={`empty-state ${styles.audioEmptyState}`}>
            <Mic size={30} />
            <strong>O que você aprendeu hoje?</strong>
            <p>Suas gravações ficam salvas neste dispositivo.</p>
          </div>
        )}
        {notes.length > 0 &&
          !notes.some((note) =>
            note.title.toLowerCase().includes(search.toLowerCase()),
          ) && (
            <div className={`empty-state ${styles.audioEmptyState}`}>
              <Search size={24} />
              <strong>Nenhuma gravação encontrada</strong>
              <p>Tente buscar por outro nome.</p>
            </div>
          )}
      </div>
    </div>
  );
}
