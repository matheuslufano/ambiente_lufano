import { db } from "./db";
import type { VisualAssetKind } from "../types";
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
/** Images stay in IndexedDB; blobs never enter localStorage or a remote upload. */
export async function saveVisualAsset(id: VisualAssetKind, file: File) {
  if (!imageTypes.has(file.type))
    throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("A imagem deve ter no máximo 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight)
      throw new Error("Imagem inválida.");
  } catch {
    throw new Error("Não foi possível ler essa imagem. Escolha outro arquivo.");
  } finally {
    URL.revokeObjectURL(url);
  }
  await db.visualAssets.put({ id, blob: file, name: file.name });
}
