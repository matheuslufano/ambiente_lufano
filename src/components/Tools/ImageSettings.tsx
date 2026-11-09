import { useState } from "react";
import { ImagePlus, Trash2, UserRound } from "lucide-react";
import { useVisualAsset } from "../../hooks/useVisualAsset";
import { saveVisualAsset } from "../../lib/visualAssets";
import { db } from "../../lib/db";
import type { VisualAssetKind } from "../../types";
import { GlassButton } from "../Glass/Glass";
import styles from "./ImageSettings.module.css";
import { useStudyStore } from "../../store/useStudyStore";
export default function ImageSettings({
  kind,
  idPrefix = "settings",
}: {
  kind: Exclude<VisualAssetKind, "emblem">;
  idPrefix?: string;
}) {
  const { url, error } = useVisualAsset(kind);
  const mode = useStudyStore((state) => state.preferences.wallpaper);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const avatar = kind === "avatar";
  return (
    <section
      id={`${idPrefix}-image-${kind}`}
      className={styles.imageSettings}
      aria-label={avatar ? "Foto de perfil" : "Imagem de fundo"}
    >
      <div className={styles.preview} data-kind={kind}>
        {url ? (
          <img
            src={url}
            alt={avatar ? "Sua foto de perfil" : "Prévia do seu plano de fundo"}
          />
        ) : avatar ? (
          <UserRound size={28} />
        ) : mode === "desk" ? (
          <img
            src="/images/study-desk-wallpaper.jpg"
            alt="Plano de fundo padrão de mesa de estudos"
          />
        ) : (
          <ImagePlus size={28} />
        )}
      </div>
      <div className={styles.actions}>
        <label className={styles.upload} aria-disabled={busy}>
          <ImagePlus size={14} />
          {busy
            ? "Salvando…"
            : avatar
              ? "Adicionar foto"
              : "Adicionar plano de fundo"}
          <input
            id={`${idPrefix}-upload-${kind}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={async (e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (!file) return;
              setBusy(true);
              setMessage("");
              try {
                await saveVisualAsset(kind, file);
                setMessage("Imagem salva neste dispositivo.");
              } catch (reason) {
                setMessage(
                  reason instanceof Error
                    ? reason.message
                    : "Não foi possível salvar.",
                );
              } finally {
                setBusy(false);
                input.value = "";
              }
            }}
          />
        </label>
        {url && (
          <GlassButton
            id={`${idPrefix}-remove-${kind}`}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await db.visualAssets.delete(kind);
                setMessage(
                  avatar ? "Foto removida." : "Fundo personalizado removido.",
                );
              } catch {
                setMessage("Não foi possível remover a imagem.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Trash2 size={12} /> Remover
          </GlassButton>
        )}
        <p>JPG, PNG ou WebP · até 10 MB</p>
      </div>
      {(message || error) && (
        <p className={styles.message} role="status">
          {message || error}
        </p>
      )}
    </section>
  );
}
