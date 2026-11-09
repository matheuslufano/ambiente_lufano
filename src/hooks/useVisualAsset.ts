import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { db } from "../lib/db";
import type { VisualAssetKind } from "../types";
/** Dexie's live query updates every open preview when the stored image changes. */
export function useVisualAsset(kind: VisualAssetKind) {
  const [url, setUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let current: string | null = null;
    const subscription = liveQuery(() => db.visualAssets.get(kind)).subscribe({
      next: (asset) => {
        setName(asset?.name || null);
        if (current) URL.revokeObjectURL(current);
        current = asset ? URL.createObjectURL(asset.blob) : null;
        setUrl(current);
        setError("");
      },
      error: () =>
        setError("Não foi possível acessar as imagens salvas neste navegador."),
    });
    return () => {
      subscription.unsubscribe();
      if (current) URL.revokeObjectURL(current);
    };
  }, [kind]);
  return { url, error, name };
}
