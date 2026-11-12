import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useStudyStore } from "../store/useStudyStore";
import { mergeStudySnapshots, type StudySnapshot } from "./studySyncMerge";

interface SyncCache { state: StudySnapshot; base: StudySnapshot; revision: number }
export const useStudySyncStatus = create<{ message: string; busy: boolean }>(() => ({
  message: "Entre na conta para sincronizar seus estudos.", busy: false,
}));
const ownerKey = "lufano-sync-owner";
const cacheKey = (id: string) => `lufano-sync-cache:${id}`;
const snapshot = (): StudySnapshot => JSON.parse(JSON.stringify(useStudyStore.getState()));
const defaults: StudySnapshot = JSON.parse(JSON.stringify(useStudyStore.getInitialState()));
let owner: string | null = null;
let cache: SyncCache | null = null;
let applying = false;
let generation = 0;
let busyGeneration: number | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

function status(message: string, busy = false) {
  useStudySyncStatus.setState({ message, busy });
}
function persistCache() {
  if (owner && cache) localStorage.setItem(cacheKey(owner), JSON.stringify(cache));
}
function apply(state: StudySnapshot) {
  // Only known data keys may enter the store; remote JSON cannot replace actions.
  if (!Array.isArray(state.subjects) || !Array.isArray(state.sessions) || !state.preferences)
    throw new Error("Formato dos estudos na nuvem inválido. Dados locais preservados.");
  applying = true;
  try {
    useStudyStore.setState(Object.fromEntries(Object.keys(defaults).map(key => [key, state[key] ?? defaults[key]])));
  } finally { applying = false; }
}

/** Pull before pushing, then atomically save against the revision that was read. */
export async function syncStudyWorkspace() {
  if (!supabase || !owner || !cache || busyGeneration === generation) return;
  const currentGeneration = generation, userId = owner;
  busyGeneration = currentGeneration;
  status("Sincronizando estudos…", true);
  try {
    const { data, error } = await supabase.from("study_workspaces")
      .select("state,revision").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    if (currentGeneration !== generation) return;
    const remote = data?.state as StudySnapshot | undefined;
    let desired = cache.state;
    if (remote) {
      // First access on a new device restores the existing cloud workspace.
      desired = cache.revision === 0
        ? remote : mergeStudySnapshots(cache.base, cache.state, remote);
      if (cache.revision === 0) localStorage.setItem(`${cacheKey(userId)}:before-cloud`, JSON.stringify(cache.state));
    }
    apply(desired);
    cache = { state: snapshot(), base: remote ?? {}, revision: data?.revision ?? 0 };
    persistCache();
    if (remote && JSON.stringify(cache.state) === JSON.stringify(remote)) {
      status("Estudos sincronizados com o Supabase.");
      return;
    }
    const sent = cache.state;
    const result = await supabase.rpc("save_study_workspace", {
      expected_revision: cache.revision, workspace_state: sent,
    });
    if (result.error) throw result.error;
    if (currentGeneration !== generation) return;
    cache = { state: snapshot(), base: sent, revision: Number(result.data) };
    persistCache();
    status(JSON.stringify(cache.state) === JSON.stringify(sent)
      ? "Estudos sincronizados com o Supabase." : "Alterações locais aguardando envio…");
  } catch (error) {
    if (currentGeneration === generation) status(`Sincronização pendente: ${error instanceof Error ? error.message : (error as { message?: string }).message || "verifique sua conexão"}`);
  } finally {
    if (busyGeneration === currentGeneration) busyGeneration = null;
  }
}

/** Started once outside React so StrictMode does not duplicate subscriptions. */
export function startStudySync() {
  if (!supabase) return () => {};
  const unsubscribe = useStudyStore.subscribe(() => {
    if (applying || !owner || !cache) return;
    cache.state = snapshot();
    try { persistCache(); } catch { status("Sem espaço para manter a fila local. Exporte um backup dos estudos."); return; }
    clearTimeout(timer);
    timer = setTimeout(() => void syncStudyWorkspace(), 900);
  });
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    const nextOwner = session?.user.id ?? null;
    if (nextOwner === owner) {
      if (!nextOwner && localStorage.getItem(ownerKey)) apply(defaults);
      return;
    }
    generation++;
    clearTimeout(timer);
    try {
      persistCache();
      const previousOwner = localStorage.getItem(ownerKey);
      owner = nextOwner;
      cache = null;
      if (!owner) {
        apply(defaults);
        status("Você saiu. Os estudos da conta estão preservados no cache privado deste navegador.");
        return;
      }
      const saved = localStorage.getItem(cacheKey(owner));
      const initial = !previousOwner ? snapshot() : defaults;
      cache = saved ? JSON.parse(saved) as SyncCache : { state: initial, base: {}, revision: 0 };
      localStorage.setItem(ownerKey, owner);
      persistCache();
      apply(cache.state);
      // Never await Supabase operations within the auth callback.
      timer = setTimeout(() => void syncStudyWorkspace(), 0);
    } catch { status("Não foi possível preparar o cache de sincronização. Exporte um backup dos dados locais."); }
  });
  const retry = () => void syncStudyWorkspace();
  const interval = setInterval(retry, 30_000);
  window.addEventListener("online", retry);
  window.addEventListener("focus", retry);
  return () => {
    generation++;
    unsubscribe(); subscription.unsubscribe(); clearInterval(interval); clearTimeout(timer);
    window.removeEventListener("online", retry); window.removeEventListener("focus", retry);
  };
}
