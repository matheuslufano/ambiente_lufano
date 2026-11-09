import { useState } from "react";
import {
  BookOpen,
  Globe,
  GraduationCap,
  HardDrive,
  Plus,
  Trash2,
  Youtube,
} from "lucide-react";

import { useStudyStore } from "../../store/useStudyStore";
import type { StudyShortcut } from "../../types";
import { validShortcuts } from "../../lib/shortcuts";
import {
  GlassButton,
  GlassIconButton,
  GlassModal,
} from "../Glass/Glass";

import styles from "./StudyShortcuts.module.css";

const icons = {
  questions: BookOpen,
  courses: GraduationCap,
  youtube: Youtube,
  drive: HardDrive,
  site: Globe,
};

interface ShortcutLogoProps {
  shortcut: StudyShortcut;
}

function ShortcutLogo({ shortcut }: ShortcutLogoProps) {
  const [imageError, setImageError] = useState(false);

  const Icon = icons[shortcut.icon];

  let faviconUrl = "";

  try {
    const hostname = new URL(shortcut.url).hostname;

    faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      hostname,
    )}&sz=128`;
  } catch {
    // Endereço inválido: utiliza o ícone padrão.
  }

  if (!faviconUrl || imageError) {
    return <Icon size={36} strokeWidth={2} />;
  }

  return (
    <img
      src={faviconUrl}
      alt={`Logo ${shortcut.label}`}
      className={styles.shortcutLogo}
      onError={() => setImageError(true)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

export default function StudyShortcuts() {
  const { shortcuts, setShortcuts } = useStudyStore();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<StudyShortcut[]>([]);
  const [error, setError] = useState("");

  function handleOpenModal() {
    setDraft(shortcuts.map((shortcut) => ({ ...shortcut })));
    setError("");
    setOpen(true);
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleaned = draft.map((item) => ({
      ...item,
      label: item.label.trim(),
      url: item.url.trim(),
    }));

    if (!validShortcuts(cleaned)) {
      setError("Preencha os nomes e use endereços HTTPS válidos.");
      return;
    }

    setShortcuts(cleaned);
    setOpen(false);
  }

  function handleAddShortcut() {
    setDraft((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        label: "",
        url: "",
        icon: "site",
      },
    ]);
  }

  function handleRemoveShortcut(id: string) {
    setDraft((current) =>
      current.filter((item) => item.id !== id),
    );
  }

  function handleChange(
    id: string,
    field: "label" | "url",
    value: string,
  ) {
    setDraft((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item,
      ),
    );
  }

  return (
    <section
      id="study-shortcuts"
      className={styles.shortcuts}
      aria-labelledby="study-shortcuts-title"
    >
      <h3 id="study-shortcuts-title">
        <Globe size={46} strokeWidth={1.7} />
        <span>Atalhos de estudo</span>
      </h3>

      <div
        id="study-shortcuts-list"
        className={styles.links}
      >
        {shortcuts.map((shortcut) => (
          <a
            id={`study-shortcut-${shortcut.id}`}
            key={shortcut.id}
            className={styles.shortcutItem}
            href={shortcut.url}
            target="_blank"
            rel="noopener noreferrer"
            title={shortcut.label}
            aria-label={`Abrir ${shortcut.label}`}
            data-kind={shortcut.icon}
          >
            <ShortcutLogo shortcut={shortcut} />
          </a>
        ))}

        <button
          id="study-shortcuts-add"
          className={styles.addShortcut}
          type="button"
          onClick={handleOpenModal}
          aria-label="Adicionar ou editar atalhos"
          title="Adicionar site"
        >
          <Plus size={40} strokeWidth={2.5} />
        </button>
      </div>

      <GlassModal
        id="study-shortcuts-modal"
        title="Atalhos de estudo"
        description="Adicione seus sites favoritos. A logo será identificada automaticamente pelo endereço."
        open={open}
        onClose={() => setOpen(false)}
      >
        <form
          className="form-stack"
          onSubmit={handleSave}
        >
          {draft.map((shortcut) => (
            <div
              key={shortcut.id}
              className={styles.shortcutFields}
            >
              <label>
                Nome
                <input
                  id={`shortcut-label-${shortcut.id}`}
                  value={shortcut.label}
                  placeholder="Ex.: Google"
                  required
                  maxLength={48}
                  onChange={(event) =>
                    handleChange(
                      shortcut.id,
                      "label",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Endereço do site
                <input
                  id={`shortcut-url-${shortcut.id}`}
                  type="url"
                  value={shortcut.url}
                  placeholder="https://www.exemplo.com"
                  required
                  maxLength={2048}
                  onChange={(event) =>
                    handleChange(
                      shortcut.id,
                      "url",
                      event.target.value,
                    )
                  }
                />
              </label>

              <GlassIconButton
                id={`shortcut-remove-${shortcut.id}`}
                type="button"
                aria-label={`Remover ${shortcut.label || "site"}`}
                onClick={() =>
                  handleRemoveShortcut(shortcut.id)
                }
              >
                <Trash2 size={14} />
              </GlassIconButton>
            </div>
          ))}

          <GlassButton
            id="shortcut-add-row"
            type="button"
            onClick={handleAddShortcut}
          >
            <Plus size={14} />
            Adicionar site
          </GlassButton>

          {error && (
            <p
              className="error-message"
              role="alert"
            >
              {error}
            </p>
          )}

          <GlassButton
            id="shortcuts-save"
            type="submit"
            variant="primary"
          >
            Salvar atalhos
          </GlassButton>
        </form>
      </GlassModal>
    </section>
  );
}
