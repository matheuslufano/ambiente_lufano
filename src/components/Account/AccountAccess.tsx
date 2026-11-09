import { useEffect, useState } from "react";
import { HardDrive, LogIn, LogOut, UserPlus } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { GlassButton, GlassModal } from "../Glass/Glass";
import styles from "./AccountAccess.module.css";
export type AccountMode = "login" | "signup" | "reset";
export function useAccountSession() {
  const [session, setSession] = useState<Session | null>(null),
    [loading, setLoading] = useState(!!supabase);
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let alive = true;
    void supabase!.auth.getSession().then(({ data }) => {
      if (alive) {
        setSession(data.session);
        setLoading(false);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);
  return { session, loading };
}
export default function AccountAccess({
  open,
  onClose,
  mode = "login",
  onModeChange,
  idPrefix = "account",
}: {
  open: boolean;
  onClose: () => void;
  mode?: AccountMode;
  onModeChange?: (mode: AccountMode) => void;
  idPrefix?: string;
}) {
  const { session, loading } = useAccountSession();
  const [current, setCurrent] = useState<AccountMode>(mode),
    [pending, setPending] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (open) {
      setCurrent(mode);
      setMessage("");
    }
  }, [open, mode]);
  const changeMode = (next: AccountMode) => {
    setCurrent(next);
    setMessage("");
    onModeChange?.(next);
  };
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const data = new FormData(event.currentTarget),
      email = String(data.get("email")),
      password = String(data.get("password") || "");
    setPending(true);
    try {
      const result =
        current === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : current === "signup"
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
              });
      setMessage(
        result.error
          ? result.error.message
          : current === "login"
            ? "Você entrou na sua conta. Seus estudos continuam salvos neste dispositivo."
            : current === "signup"
              ? "Conta criada. Verifique seu e-mail para confirmar o cadastro."
              : "Enviamos um link de recuperação para seu e-mail.",
      );
    } catch {
      setMessage("Não foi possível conectar agora. Tente novamente.");
    } finally {
      setPending(false);
    }
  }
  return (
    <GlassModal
      id={`${idPrefix}-access-modal`}
      title={
        current === "login"
          ? "Entrar na conta"
          : current === "signup"
            ? "Criar sua conta"
            : "Recuperar acesso"
      }
      description="Acesse sua conta no Espaço de Estudo Lufano."
      open={open}
      onClose={onClose}
    >
      {!supabase ? (
        <div className="empty-state">
          <HardDrive size={28} />
          <strong>Conta online não configurada</strong>
          <p>
            Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente para
            habilitar login e cadastro. Seus estudos seguem salvos neste
            dispositivo.
          </p>
        </div>
      ) : loading ? (
        <p className="form-hint" role="status">
          Verificando sua conta…
        </p>
      ) : session ? (
        <div id={`${idPrefix}-signed-in`} className={styles.accountState}>
          <div className={styles.accountIdentity}>
            <span>
              <LogIn size={18} />
            </span>
            <div>
              <strong>Conta conectada</strong>
              <small>{session.user.email}</small>
            </div>
          </div>
          <p>
            A sincronização e a separação dos estudos por conta ainda não foram
            ativadas. Seus dados permanecem neste dispositivo.
          </p>
          <GlassButton
            id={`${idPrefix}-sign-out`}
            onClick={async () => {
              setPending(true);
              const { error } = await supabase!.auth.signOut();
              setMessage(
                error ? error.message : "Você saiu da conta neste dispositivo.",
              );
              setPending(false);
            }}
            disabled={pending}
          >
            <LogOut size={15} />
            {pending ? "Saindo…" : "Sair da conta"}
          </GlassButton>
          {message && (
            <p role="status" className="form-hint">
              {message}
            </p>
          )}
        </div>
      ) : (
        <form
          id={`${idPrefix}-auth-form`}
          className="form-stack"
          onSubmit={submit}
        >
          <label>
            E-mail
            <input
              id={`${idPrefix}-auth-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          {current !== "reset" && (
            <label>
              Senha
              <input
                id={`${idPrefix}-auth-password`}
                name="password"
                type="password"
                autoComplete={
                  current === "signup" ? "new-password" : "current-password"
                }
                minLength={8}
                required
              />
            </label>
          )}
          <GlassButton
            id={`${idPrefix}-auth-submit`}
            type="submit"
            variant="primary"
            disabled={pending}
          >
            {pending
              ? "Aguarde…"
              : current === "login"
                ? "Entrar"
                : current === "signup"
                  ? "Criar conta"
                  : "Enviar link de recuperação"}
          </GlassButton>
          {current === "login" && (
            <GlassButton
              id={`${idPrefix}-auth-google`}
              type="button"
              onClick={() => {
                void supabase!.auth
                  .signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: window.location.origin },
                  })
                  .then(({ error }) =>
                    setMessage(
                      error?.message || "Redirecionando para o Google…",
                    ),
                  );
              }}
            >
              Continuar com Google
            </GlassButton>
          )}
          <div className={styles.accountLinks}>
            {current !== "reset" && (
              <button
                type="button"
                onClick={() =>
                  changeMode(current === "login" ? "signup" : "login")
                }
              >
                {current === "login" ? (
                  <>
                    <UserPlus size={14} /> Criar conta
                  </>
                ) : (
                  <>
                    <LogIn size={14} /> Já tenho conta
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                changeMode(current === "reset" ? "login" : "reset")
              }
            >
              {current === "reset" ? "Voltar ao login" : "Esqueci minha senha"}
            </button>
          </div>
          {message && (
            <p
              id={`${idPrefix}-auth-status`}
              role="status"
              className="form-hint"
            >
              {message}
            </p>
          )}
        </form>
      )}
    </GlassModal>
  );
}
