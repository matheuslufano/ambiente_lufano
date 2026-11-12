import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { db } from "../../lib/db";
import { dateKey } from "../../lib/time";
import { useStudyStore } from "../../store/useStudyStore";
import type { AudioNote } from "../../types";
import SessionAudioPlayer from "./SessionAudioPlayer";
import styles from "./NotebookSessionRecords.module.css";

export default function NotebookSessionRecords({ subjectId }: { subjectId: string }) {
  const sessions = useStudyStore(state => state.sessions).filter(session => session.subjectId === subjectId);
  const [audio, setAudio] = useState<AudioNote[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    setAudio([]); setError("");
    const subscription = liveQuery(() => db.audioNotes.where("subjectId").equals(subjectId).toArray()).subscribe({
      next: setAudio, error: () => setError("Não foi possível carregar os áudios deste dispositivo."),
    });
    return () => subscription.unsubscribe();
  }, [subjectId]);
  const audioDay = (note: AudioNote) => dateKey(new Date(note.sessionStartedAt ?? note.date));
  const dates = [...new Set([...sessions.map(session => session.date), ...audio.map(audioDay)])].sort().reverse();
  return <section id={`notebook-session-records-${subjectId}`} className={styles.records}>
    <h3>Resumos das sessões</h3>
    {error && <p role="alert">{error}</p>}
    {!dates.length && <p>Seus resumos e áudios aparecerão aqui após salvar uma sessão.</p>}
    {dates.map(date => <section key={date} className={styles.dateGroup} aria-label={date}>
      <h4>{new Date(date + "T12:00:00").toLocaleDateString("pt-BR")}</h4>
      {sessions.filter(session => session.date === date).sort((a,b) => a.startedAt - b.startedAt).map(session => <article key={session.id}>
        <strong>{session.topic || "Estudo geral"}</strong>
        <small>{Math.floor(session.duration / 60)} min · {session.correct}/{session.questions} acertos</small>
        <p>{session.summary}</p>
        {audio.filter(note => note.sessionStartedAt === session.startedAt).map(note => <SessionAudioPlayer key={note.id} note={note} />)}
      </article>)}
      {audio.filter(note => audioDay(note) === date && (!note.sessionStartedAt || !sessions.some(session => session.startedAt === note.sessionStartedAt))).map(note => <article key={note.id}>
        <strong>{note.title}</strong><small>Áudio do dia · {new Date(note.date).toLocaleTimeString("pt-BR")}</small>
        <SessionAudioPlayer note={note} />
      </article>)}
    </section>)}
  </section>;
}
