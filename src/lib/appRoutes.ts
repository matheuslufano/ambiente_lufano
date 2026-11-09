export const appRoutes = [
  { id: "home", path: "/", label: "Início" },
  { id: "activities", path: "/atividades", label: "Atividades" },
  { id: "planning", path: "/planejamento", label: "Planejamento" },
  { id: "cycle", path: "/ciclo-de-estudos", label: "Ciclo de estudos" },
  { id: "tracking", path: "/acompanhamento", label: "Acompanhamento" },
  { id: "blog", path: "/blog", label: "Blog" },
] as const;
export type AppPage = (typeof appRoutes)[number]["id"];
export function pageFromHash(hash: string): AppPage | "not-found" {
  const path =
    (hash.replace(/^#/, "") || "/").split("?")[0].replace(/\/$/, "") || "/";
  return appRoutes.find((route) => route.path === path)?.id || "not-found";
}
