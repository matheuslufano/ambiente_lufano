import type { ButtonHTMLAttributes, ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import styles from "./Glass.module.css";
export function GlassPanel({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-component="glass-panel"
      className={`${styles.panel} ${className}`}
    >
      {children}
    </section>
  );
}
export function GlassButton({
  children,
  variant = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger";
}) {
  return (
    <button {...props} className={styles.button} data-variant={variant}>
      {children}
    </button>
  );
}
export function GlassIconButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={styles.iconButton}>
      {children}
    </button>
  );
}
export function GlassSegmentedControl<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div id={id} className={styles.segmented} aria-label="Visualização">
      {options.map((o) => (
        <button
          key={o.value}
          id={`${id}-${o.value}`}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
/** Radix handles focus trapping, Escape and focus restoration. */
export function GlassModal({
  id,
  title,
  description,
  open,
  onClose,
  children,
  navigation,
}: {
  id: string;
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  navigation?: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          id={id}
          className={styles.modal}
          data-layout={navigation ? "settings" : "default"}
          aria-describedby={description ? `${id}-description` : undefined}
        >
          {navigation && (
            <aside className={styles.modalNavigation}>{navigation}</aside>
          )}
          <div className={navigation ? styles.modalBody : undefined}>
            <div className={styles.modalHeader}>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Close asChild>
                <GlassIconButton id={`${id}-close`} aria-label="Fechar">
                  <X size={19} />
                </GlassIconButton>
              </Dialog.Close>
            </div>
            {description && (
              <Dialog.Description
                id={`${id}-description`}
                className={styles.description}
              >
                {description}
              </Dialog.Description>
            )}
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
