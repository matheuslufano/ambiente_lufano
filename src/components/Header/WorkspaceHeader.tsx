import {
  ChartNoAxesCombined,
  ClipboardList,
  HeartHandshake,
  House,
  NotebookPen,
  Repeat2,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { appRoutes } from "../../lib/appRoutes";
import type { AppPage } from "../../lib/appRoutes";
import styles from "./WorkspaceHeader.module.css";
import AccountAccess, {
  useAccountSession,
  type AccountMode,
} from "../Account/AccountAccess";
import { supabase } from "../../lib/supabase";
import { useState } from "react";
const icons = {
  home: House,
  activities: ClipboardList,
  planning: NotebookPen,
  cycle: Repeat2,
  tracking: ChartNoAxesCombined,
  blog: HeartHandshake,
};
export default function WorkspaceHeader({
  page,
  studying,
  onStudyControls,
}: {
  page: AppPage | "not-found";
  studying: boolean;
  onStudyControls: () => void;
}) {
  const { session, loading } = useAccountSession();
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<AccountMode>("login");
  const [accountMessage, setAccountMessage] = useState("");
  return (
    <header
      id="workspace-header"
      className={styles.header}
      data-studying={studying}
    >
      {studying && page !== "home" && (
        <button
          id="workspace-open-active-study"
          className={styles.sessionShortcut}
          onClick={onStudyControls}
        >
          Sessão de estudo em andamento · abrir controles
        </button>
      )}
      <nav
        id="workspace-main-navigation"
        aria-label="Navegação principal"
        className={styles.navigation}
      >
        {appRoutes.map((route) => {
          const Icon = icons[route.id];
          return (
            <a
              id={`workspace-nav-${route.id}`}
              key={route.id}
              href={`#${route.path}`}
              aria-current={page === route.id ? "page" : undefined}
            >
              <Icon size={25} strokeWidth={1.7} />
              <span>{route.label}</span>
            </a>
          );
        })}
      </nav>
      <div id="workspace-account-actions" className={styles.accountActions}>
        {session ? (
          <>
            <span
              className={styles.accountEmail}
              title={session.user.email || "Conta conectada"}
            >
              {session.user.email}
            </span>
            <button
              id="workspace-sign-out"
              type="button"
              disabled={!supabase || loading}
              onClick={async () => {
                const { error } = await supabase!.auth.signOut();
                setAccountMessage(
                  error ? error.message : "Você saiu da conta.",
                );
                window.setTimeout(() => setAccountMessage(""), 4000);
              }}
            >
              <LogOut size={15} />
              <span>Sair</span>
            </button>
          </>
        ) : (
          <>
            <button
              id="workspace-login"
              type="button"
              disabled={loading}
              onClick={() => {
                setAccountMode("login");
                setAccountOpen(true);
              }}
            >
              <LogIn size={15} />
              <span>Entrar</span>
            </button>
            <button
              id="workspace-sign-up"
              className={styles.accountPrimary}
              type="button"
              disabled={loading}
              onClick={() => {
                setAccountMode("signup");
                setAccountOpen(true);
              }}
            >
              <UserPlus size={15} />
              <span>Criar conta</span>
            </button>
          </>
        )}
      </div>
      {accountMessage && (
        <span className={styles.accountStatus} role="status">
          {accountMessage}
        </span>
      )}
      {accountOpen && (
        <AccountAccess
          open={accountOpen}
          mode={accountMode}
          onModeChange={setAccountMode}
          onClose={() => setAccountOpen(false)}
        />
      )}
    </header>
  );
}
