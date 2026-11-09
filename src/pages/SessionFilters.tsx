import { Search, SlidersHorizontal } from "lucide-react";
import { useStudyStore } from "../store/useStudyStore";
import type { SessionFilters as Filters } from "../lib/studyInsights";
import styles from "./WorkspacePages.module.css";
export default function SessionFilters({
  prefix,
  value,
  onChange,
}: {
  prefix: string;
  value: Filters;
  onChange: (value: Filters) => void;
}) {
  const subjects = useStudyStore((s) => s.subjects);
  return (
    <aside id={`${prefix}-filters`} className={styles.filterPanel}>
      <h2>
        <SlidersHorizontal size={16} /> Filtrar atividades
      </h2>
      <label>
        Matéria
        <select
          id={`${prefix}-filter-subject`}
          value={value.subjectId || ""}
          onChange={(e) => onChange({ ...value, subjectId: e.target.value })}
        >
          <option value="">Todas as matérias</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Conteúdo
        <div className={styles.searchField}>
          <Search size={14} />
          <input
            id={`${prefix}-filter-topic`}
            placeholder="Buscar conteúdo"
            value={value.topic || ""}
            onChange={(e) => onChange({ ...value, topic: e.target.value })}
          />
        </div>
      </label>
      <label>
        Data inicial
        <input
          id={`${prefix}-filter-from`}
          type="date"
          value={value.from || ""}
          max={value.to}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
        />
      </label>
      <label>
        Data final
        <input
          id={`${prefix}-filter-to`}
          type="date"
          value={value.to || ""}
          min={value.from}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
        />
      </label>
      <button
        id={`${prefix}-clear-filters`}
        type="button"
        onClick={() => onChange({})}
      >
        Limpar filtros
      </button>
    </aside>
  );
}
