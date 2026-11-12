import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  Volume2,
  Download,
  RotateCcw,
  Play,
  Pause,
  ChevronDown,
  X,
} from "lucide-react";
import type { AudioNote } from "../../types";
import { useAudioWaveform } from "../../hooks/useAudioWaveform";
import styles from "./SessionAudioPlayer.module.css";

const speeds = [1, 1.5, 2, 0.75];
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export default function SessionAudioPlayer({ note }: { note: AudioNote }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const player = useRef<HTMLAudioElement>(null);
  const controlsId = useId();
  const waveform = useAudioWaveform(note.blob, expanded);
  const duration = waveform.duration || mediaDuration;
  const progress = duration ? Math.min(100, (position / duration) * 100) : 0;
  const peaks = waveform.peaks.length
    ? waveform.peaks
    : Array<number>(48).fill(0);
  useEffect(() => {
    setError(false);
    setPosition(0);
    setMediaDuration(0);
    setPlaying(false);
    if (!(note.blob instanceof Blob) || !note.blob.size) {
      setUrl("");
      setError(true);
      return;
    }
    const source = URL.createObjectURL(note.blob);
    setUrl(source);
    return () => URL.revokeObjectURL(source);
  }, [note.blob]);
  function updateDuration() {
    const value = player.current?.duration;
    if (value && Number.isFinite(value)) setMediaDuration(value);
  }
  function collapse() {
    player.current?.pause();
    setExpanded(false);
    setMenu(false);
  }
  return (
    <div
      className={styles.player}
      data-expanded={expanded}
      data-component="session-audio-player"
    >
      <button
        className={styles.toggle}
        type="button"
        aria-label="Abrir áudio"
        aria-expanded={expanded}
        aria-controls={controlsId}
        onClick={() => setExpanded(true)}
      >
        <Volume2 size={19} />
      </button>
      <div id={controlsId} className={styles.controls} hidden={!expanded}>
        {url && (
          <audio
            ref={player}
            src={url}
            preload="metadata"
            onLoadedMetadata={() => {
              updateDuration();
              if (player.current) player.current.playbackRate = speed;
            }}
            onDurationChange={updateDuration}
            onTimeUpdate={() => setPosition(player.current?.currentTime ?? 0)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => setError(true)}
          />
        )}
        <div className={styles.transport}>
          <button
            className={styles.speed}
            type="button"
            aria-label={`Velocidade ${speed} vezes. Clique para alterar`}
            onClick={() => {
              const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
              setSpeed(next);
              if (player.current) player.current.playbackRate = next;
            }}
          >
            {speed.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}×
          </button>
          <button
            className={styles.play}
            type="button"
            disabled={!url || error}
            aria-label={playing ? "Pausar áudio" : "Reproduzir áudio"}
            onClick={() => {
              if (playing) player.current?.pause();
              else void player.current?.play().catch(() => setError(true));
            }}
          >
            {playing ? (
              <Pause size={19} fill="currentColor" />
            ) : (
              <Play size={19} fill="currentColor" />
            )}
          </button>
          <div className={styles.timeline}>
            <div
              className={styles.waveform}
              style={{ "--audio-progress": `${progress}%` } as CSSProperties}
            >
              <svg
                viewBox="0 0 192 32"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {peaks.map((peak, index) => (
                  <line
                    key={index}
                    x1={index * 4 + 2}
                    x2={index * 4 + 2}
                    y1={16 - (2 + peak * 13)}
                    y2={16 + (2 + peak * 13)}
                    data-played={(index / 48) * 100 <= progress}
                  />
                ))}
              </svg>
              <span className={styles.playhead} aria-hidden="true" />
              <input
                className={styles.seek}
                aria-label="Posição no áudio"
                aria-valuetext={`${formatTime(position)} de ${formatTime(duration)}`}
                type="range"
                min="0"
                max={duration || 1}
                step="0.1"
                value={Math.min(position, duration || 1)}
                disabled={!duration}
                onChange={(event) => {
                  if (player.current) {
                    player.current.currentTime = Number(event.target.value);
                    setPosition(Number(event.target.value));
                  }
                }}
              />
            </div>
            <div className={styles.times}>
              <span>{formatTime(position)}</span>
              <span>{duration ? formatTime(duration) : "--:--"}</span>
            </div>
          </div>
          <button
            className={styles.more}
            type="button"
            aria-label="Opções do áudio"
            aria-expanded={menu}
            aria-controls={`${controlsId}-actions`}
            onClick={() => setMenu(!menu)}
          >
            <ChevronDown size={17} />
          </button>
        </div>
        <div
          id={`${controlsId}-actions`}
          className={styles.actions}
          hidden={!menu}
        >
          <button
            type="button"
            onClick={() => {
              if (player.current)
                player.current.currentTime = Math.max(
                  0,
                  player.current.currentTime - 10,
                );
            }}
          >
            <RotateCcw size={14} /> Voltar 10 s
          </button>
          {url && (
            <a
              href={url}
              download={`${note.title}.${note.blob.type.includes("mp4") ? "m4a" : note.blob.type.includes("ogg") ? "ogg" : "webm"}`}
            >
              <Download size={14} /> Baixar
            </a>
          )}
          <button type="button" onClick={collapse}>
            <X size={14} /> Recolher
          </button>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            Não foi possível reproduzir este áudio neste navegador.
          </p>
        )}
      </div>
    </div>
  );
}
