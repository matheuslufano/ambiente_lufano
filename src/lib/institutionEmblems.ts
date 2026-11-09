import type { InstitutionEmblem } from "../types";
interface ApiImage {
  url?: string;
  thumburl?: string;
  descriptionurl?: string;
  mime?: string;
  extmetadata?: Record<string, { value?: string }>;
}
interface ApiPage {
  title?: string;
  imageinfo?: ApiImage[];
  index?: number;
}
interface ApiResponse {
  error?: { info?: string };
  query?: { pages?: Record<string, ApiPage> };
}
const text = (value: string | undefined) =>
  (value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
function trustedUrl(value: string | undefined, hosts: string[]): string | null {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" && hosts.includes(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function isInstitutionEmblem(
  value: unknown,
): value is InstitutionEmblem {
  if (!value || typeof value !== "object") return false;
  const emblem = value as Partial<InstitutionEmblem>;
  return (
    !!trustedUrl(emblem.url, ["upload.wikimedia.org", "thumb.wikimedia.org"]) &&
    !!trustedUrl(emblem.source, ["commons.wikimedia.org"]) &&
    ["title", "license", "author"].every(
      (key) => typeof emblem[key as keyof InstitutionEmblem] === "string",
    )
  );
}
/** Only Wikimedia image hosts are accepted; metadata is rendered as plain text. */
export function parseEmblemResults(data: ApiResponse): InstitutionEmblem[] {
  if (data.error)
    throw new Error(data.error.info || "A busca de brasões está indisponível.");
  return Object.values(data.query?.pages || {})
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .flatMap((page) => {
      const image = page.imageinfo?.[0];
      if (
        !image ||
        !["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(
          image.mime || "",
        )
      )
        return [];
      const url = trustedUrl(image.thumburl || image.url, [
        "upload.wikimedia.org",
        "thumb.wikimedia.org",
      ]);
      const source = trustedUrl(image.descriptionurl, [
        "commons.wikimedia.org",
      ]);
      if (!url || !source) return [];
      const metadata = image.extmetadata || {};
      return [
        {
          title: text(page.title).replace(/^File:/, ""),
          url,
          source,
          license:
            text(metadata.LicenseShortName?.value) || "Ver licença na fonte",
          author: text(metadata.Artist?.value) || "Ver autoria na fonte",
        },
      ];
    });
}
export async function searchInstitutionEmblems(
  institution: string,
  signal?: AbortSignal,
) {
  const query = institution.trim();
  if (query.length < 3)
    throw new Error("Informe pelo menos três caracteres da instituição.");
  const terms = /^pc\s*[-–]?\s*to$/i.test(query)
    ? "Polícia Civil Tocantins"
    : query;
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: terms,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "360",
  });
  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?${params}`,
    {
      credentials: "omit",
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
    },
  );
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "A API limitou as consultas. Tente novamente mais tarde."
        : "Não foi possível consultar a API Wikimedia.",
    );
  return parseEmblemResults(await response.json());
}
export async function downloadInstitutionEmblem(emblem: InstitutionEmblem) {
  const url = trustedUrl(emblem.url, [
    "upload.wikimedia.org",
    "thumb.wikimedia.org",
  ]);
  if (!url) throw new Error("Origem de imagem inválida.");
  const response = await fetch(url, {
    credentials: "omit",
    referrerPolicy: "no-referrer",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "O servidor de imagens limitou os downloads. Tente novamente mais tarde."
        : "Não foi possível baixar o brasão escolhido.",
    );
  const blob = await response.blob();
  if (!blob.type.startsWith("image/") || blob.size > 10 * 1024 * 1024)
    throw new Error("A imagem retornada é inválida ou excede 10 MB.");
  return blob;
}
