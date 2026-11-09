## Atualização — esquema de banco pronto para Supabase

**6 arquivos envolvidos: 2 criados e 4 alterados; nenhum removido.** A migração foi substituída antes de ser aplicada remotamente; ela agora representa entidades atuais, RLS por usuário, chaves estrangeiras compostas e armazenamento privado. Não configurei um projeto nem transmiti dados.

- [Migração PostgreSQL](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/supabase/migrations/202611080001_initial.sql:1>): grupos, matérias, tópicos, objetivo, sessões/cronômetro, agenda, simulados, metas/ciclo, notas, flashcards, gravações, textos, atalhos, perfil, PET, índices, RLS e bucket privado.
- [README Supabase](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/supabase/README.md:1>): configuração da CLI, associação de projeto, aplicação segura e limites de sync.
- [Configuração CLI](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/supabase/config.toml:1>): identificador local do projeto para Supabase CLI.
- [.env.example](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/.env.example:1>): variáveis públicas de URL/chave anon, sem segredos.
- [README principal](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md:137>): novo fluxo de configuração e aviso de que aplicação do schema não sincroniza o armazenamento local.

### Organização, segurança e validação

SQL separado em `supabase/migrations`, instruções operacionais em `supabase/README.md`; sem novas dependências ou classes CSS. RLS usa `auth.uid()` para cada tabela do usuário, relações compostas garantem que matérias e sessões não atravessem contas, e os arquivos ficam em bucket privado sob pasta UUID. A trigger cria o perfil quando Auth cadastra usuário. Backups locais continuam necessários: Auth e banco agora podem ser hospedados, mas o cliente ainda não migra nem sincroniza o estado Zustand/IndexedDB.

Não apliquei banco, pois não há `project-ref`/credenciais no workspace. A CLI Supabase e `psql` não estão instalados, então a migração não foi executada contra PostgreSQL; revisão foi estática. Esta atualização não alterou TypeScript, por isso não rodei testes/build. Referências oficiais: [migrations](https://supabase.com/docs/guides/deployment/database-migrations) e [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

---
# Relatório de implementação — acesso à conta pelo cabeçalho

**7 arquivos envolvidos: 2 criados e 5 alterados; nenhum removido.** O cabeçalho oferece login/cadastro sem sessão e e-mail/Sair com sessão Supabase. A implementação usa ícones Lucide já instalados, CSS Modules locais, elementos HTML identificados e o modal compartilhado com Configurações. Não há dependências ou regras CSS duplicadas adicionadas. Supabase não está configurado nesta instalação e não foi criado usuário. O estado dos estudos segue local e não é sincronizado por conta.

### Arquivos

- [AccountAccess.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Account/AccountAccess.tsx:1>): fluxo compartilhado para entrar, criar conta, entrar com Google, recuperar senha e sair. Observa a sessão Supabase.
- [AccountAccess.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Account/AccountAccess.module.css:1>): apresentação do estado da conta e links de alternância de formulário.
- [WorkspaceHeader.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Header/WorkspaceHeader.tsx:1>): ações Entrar/Criar conta ou e-mail/Sair conforme sessão atual.
- [WorkspaceHeader.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Header/WorkspaceHeader.module.css:1>): posição, estados, responsividade e botões da conta no cabeçalho.
- [SettingsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/SettingsPanel.tsx:1>): reutiliza o modal de acesso existente nas configurações.
- [README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md:1>): requisitos de configuração e limite atual da sincronização.

### Validação

`npm.cmd run lint` passou. `npm.cmd run build` passou. Não foram executados testes nesta atualização. A autenticação real exige configurar as variáveis Supabase e os provedores no projeto correspondente.

---


## Atualização — barra de ferramentas, pizza inicial e Pomodoro conforme referência

**12 arquivos alterados, nenhum criado ou removido.** Ícones: iniciar triangular, microfone, tomate próprio em SVG, livro aberto, engrenagem e pata. Os ícones da biblioteca Lucide foram reaproveitados; tomate desenhado em código. Estrutura de diretórios preservada, sem novas dependências.

### Alterações por arquivo

- [src/components/Dock/StudyDock.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.tsx:1>): Tomate vetorial e engrenagem; preserva as cinco ações do Dock.
- [src/components/Dock/StudyDock.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.module.css:1>): Barra cinza compacta, cantos discretos e ícones escuros.
- [src/components/Performance/PerformancePanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.tsx:1>): Abas com ícones e ordem do modelo; Pomodoro substitui gráficos abaixo do perfil.
- [src/components/Performance/ProfileSummary.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/ProfileSummary.tsx:1>): Perfil simplificado com foto, nome e indicadores reais; preserva remoção anterior da frase do objetivo.
- [src/components/Performance/PerformancePanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.module.css:1>): Espaçamento compacto, indicador de tempo azul, agrupamento e seletor anual.
- [src/components/Performance/SidebarContent.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/SidebarContent.module.css:1>): Abas menores, conteúdo branco e botão de pata preenchido; título e fechar do Pomodoro.
- [src/components/Performance/StudyPerformance.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/StudyPerformance.tsx:1>): Pizza inicial anual sem espaços entre fatias; agrupa matérias ou tópicos, navega por ano e oferece período total. Música e meta preservadas em detalhes expansíveis.
- [src/components/Pomodoro/TomatoScene.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Pomodoro/TomatoScene.tsx:1>): Ilustração SVG própria do tomate com rosto e escala; dispensa WebGL para essa apresentação.
- [src/components/Pomodoro/PomodoroPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Pomodoro/PomodoroPanel.tsx:1>): Controles circulares, tempo compacto e ajustes recolhidos; mantém motor do temporizador e arraste.
- [src/components/Pomodoro/PomodoroPanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Pomodoro/PomodoroPanel.module.css:1>): Estilos do tomate, contador vermelho e controles compactos.
- [README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md:1>): Documenta o novo comportamento visual.
- [docs/IMPLEMENTATION.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/docs/IMPLEMENTATION.md:1>): Relatório individual desta atualização.

### CSS, identificação e validação

Classes existentes do Dock, perfil e conteúdo reaproveitadas; novas classes `chartGrouping`, `chartYear`, `chartDetails` e `options` organizam os controles. CSS permanece nos módulos dos respectivos componentes. O módulo do Pomodoro foi reescrito para substituir os estilos antigos, sem sucessivas regras de correção. IDs preservados e novos controles anuais com IDs específicos. Animações de hover discretas e transições existentes mantidas. Referência visual principal: imagens do usuário; inspiração de abas previamente consultada em https://freefrontend.com/css-tabs/.

TypeScript passou, 31 testes passaram e build de produção passou. Permanece aviso de chunks maiores que 500 kB. Não foi possível confirmar fidelidade visual ou cliques no navegador: host de automação indisponível na sessão. Dados e fotos são os reais do usuário; sem estudos registrados, a pizza informa ausência de registros, sem reproduzir números fictícios da imagem. A imagem do tomate é uma aproximação vetorial da referência. Não houve publicação.

---

## Atualização — cabeçalho, páginas e PET em toda a terceira coluna

**24 arquivos: 11 criados, 13 alterados, nenhum removido.** Contagem desta atualização, não do repositório inteiro (a base ainda está sem commit). O PET substitui temporariamente perfil e gráficos na terceira coluna, preservando seu estado ao voltar. A remoção anterior da frase do perfil foi preservada.

### Arquivos e organização

Os novos diretórios `src/components/Header` e `src/pages` separam navegação e páginas. Rotas ficam em `src/lib`, observação da URL em `src/hooks`; não foi adicionada dependência. Links abaixo apontam ao início de cada arquivo local; não há link remoto verificável para esta atualização.

- [src/lib/appRoutes.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/appRoutes.ts:1>): Rotas e resolução de URLs hash.
- [src/lib/appRoutes.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/appRoutes.test.ts:1>): Testes das seis rotas e endereço desconhecido.
- [src/hooks/useAppRoute.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/hooks/useAppRoute.ts:1>): Assinatura da navegação e histórico do navegador.
- [src/components/Header/WorkspaceHeader.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Header/WorkspaceHeader.tsx:1>): Cabeçalho com seis páginas, ícones Lucide e acesso à sessão ativa.
- [src/components/Header/WorkspaceHeader.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Header/WorkspaceHeader.module.css:1>): Estilos responsivos, foco, hover e indicação da página ativa.
- [src/pages/ActivitiesPage.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/pages/ActivitiesPage.tsx:1>): Histórico real de atividades e acesso ao estudo.
- [src/pages/PlanningPage.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/pages/PlanningPage.tsx:1>): Criação, reagendamento e remoção de atividades do calendário.
- [src/pages/StudyCyclePage.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/pages/StudyCyclePage.tsx:1>): Ciclo editável com ordem, matéria, duração e início do estudo.
- [src/pages/TrackingPage.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/pages/TrackingPage.tsx:1>): Indicadores reais, gráfico semanal e simulados.
- [src/pages/BlogPage.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/pages/BlogPage.tsx:1>): Criação e edição de textos pessoais locais, sem publicação online.
- [src/pages/WorkspacePages.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/pages/WorkspacePages.module.css:1>): Estilos compartilhados das novas páginas.
- [src/App.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/App.tsx:1>): Integração das páginas; mantém estudo e ferramentas montados durante navegação.
- [src/App.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/App.module.css:1>): Área do cabeçalho e terceira coluna com altura completa.
- [src/components/Performance/PerformancePanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.tsx:1>): Botão de pata abre o PET na coluna inteira; fechar restaura perfil e indicadores.
- [src/components/Performance/SidebarContent.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/SidebarContent.module.css:1>): Área expandida do PET, fechar e lançador; reaproveita superfície existente.
- [src/components/Performance/StudyHistory.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/StudyHistory.tsx:1>): Prefixos de identificação para reutilização sem IDs duplicados.
- [src/components/Dock/StudyDock.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.tsx:1>): Primeiro ícone abre início ou sessão ativa; pausa e encerramento explícitos; estudo geral quando não há tópicos.
- [src/components/Dock/StudyDock.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.module.css:1>): Formulário legível e controles da sessão.
- [src/types.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/types.ts:1>): Contratos de ciclo e textos pessoais.
- [src/store/useStudyStore.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.ts:1>): Persistência versão 6 de ciclo e textos com migração compatível.
- [src/store/useStudyStore.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.test.ts:1>): Proteção contra substituir sessão em andamento e estudo sem tópico.
- [src/components/Tools/SettingsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/SettingsPanel.tsx:1>): Restaura ciclo e textos no backup com validação de campos e IDs.
- [README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md:1>): Documentação das novas páginas e dos controles.
- [docs/IMPLEMENTATION.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/docs/IMPLEMENTATION.md:1>): Relatório individual desta atualização.

### Validação e limites

- `npm.cmd run lint`: passou (verificação TypeScript, conforme script existente).
- `npm.cmd test`: 31 testes passaram em 9 arquivos.
- `npm.cmd run build`: passou; permanece o aviso de chunks maiores que 500 kB.
- Inspeção estática: 149 IDs literais, nenhum duplicado; nenhuma classe CSS Module referenciada ausente. Essa inspeção não substitui a análise do DOM renderizado.
- Servidor local em `http://localhost:5174`: HTTP 200.
- Validação visual e cliques no navegador não realizados: o host de acesso ao navegador está indisponível. Nenhuma publicação foi feita.

### Identidade visual e CSS

Ícones Lucide já instalados, superfícies translúcidas, foco visível, transições de hover e navegação ativa. Referência consultada: [FreeFrontend CSS Tabs](https://freefrontend.com/css-tabs/), adaptada à identidade existente. Estilos do cabeçalho estão em seu CSS Module, páginas compartilham `WorkspacePages.module.css`, e painel/Dock mantêm seus próprios módulos. Foram criadas classes específicas para navegação, páginas e controles; estilos de botões e formulários existentes foram reaproveitados. Foi removida a regra especial da antiga aba PET, agora substituída pelo botão de pata. Não há conflitos conhecidos na revisão estática; responsividade e fidelidade à imagem ainda precisam de confirmação visual.

### Comportamentos e persistência

URLs: `#/`, `#/atividades`, `#/planejamento`, `#/ciclo-de-estudos`, `#/acompanhamento`, `#/blog`. O calendário usa as mesmas atividades da página Planejamento. O ciclo salva matérias, ordem e duração sugerida; iniciar abre o Dock para confirmação. Blog armazena textos pessoais neste dispositivo. Backup restaura os novos dados; backups antigos recebem listas vazias. Não foram alteradas regras de moedas, XP ou o motor do Pomodoro.

---

## Atualização — minigame PET e painel contextual preservando o perfil

**41 arquivos envolvidos: 27 criados, 14 alterados, nenhum removido.** Primeira versão local funcional do PET: lontrinha interativa, quatro cenários, necessidades, moedas/XP, alimentação, brincadeira, descanso, acessórios, histórico e integração com sessões reais. Foto e indicadores ficam acima das abas; PET e ferramentas ocupam somente a área branca. O cálculo interno do Pomodoro não foi alterado.

### Arquivos criados — domínio, persistência e hooks

- [types/pet.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/types/pet.ts:1>): tipos de personagem, ações, cenários, regras, intervalos e histórico de recompensas. Novo diretório `src/types` para contratos específicos, sem substituir `src/types.ts`.
- [rewardService.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/services/rewardService.ts:1>): aritmética pura, escada cumulativa, união de intervalos, limites de sessão, divisão por data, progressão de níveis e validação de regras. Novo diretório `src/services` separa negócio da interface.
- [petService.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/services/petService.ts:1>): transações de créditos, bônus diário, simulados, compras, cuidados, cenas, equipamentos e preferências; estado inicial sem moedas/XP fictícios.
- [rewardService.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/services/rewardService.test.ts:1>): quatro testes de marcos, sobreposição, tempo líquido/pausas e evolução/configuração.
- [petService.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/services/petService.test.ts:1>): seis testes com fake-indexeddb: chamadas concorrentes, reabertura, cópias sobrepostas, bônus diário, simulado único, compra concorrente e brincadeira sem geração de moeda.
- [usePet.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/hooks/usePet.ts:1>): observação reativa do estado e das últimas vinte recompensas; histórico completo permanece no banco.
- [usePetAnimation.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/hooks/usePetAnimation.ts:1>): estado visual derivado de estudo/descanso/fome e reações transitórias, sem lógica de crédito.
- [useStudyRewards.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/hooks/useStudyRewards.ts:1>): concilia somente registros concluídos; créditos únicos são garantidos pela transação/ledger, não pelo ciclo de vida React.

### Arquivos criados — interface do PET

- [PetGame.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/pet/PetGame.tsx:1>): composição, ações reais, mensagens, relógio sincronizado e painéis de loja/inventário. Novo diretório `components/pet` mantém a funcionalidade isolada.
- [PetGame.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/pet/PetGame.module.css:1>): cenário quadrado, camadas, indicadores, barra de ações, loja e animações suaves; usa a redução de movimento global.
- [PetCharacter.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/pet/PetCharacter.tsx:1>): personagem vetorial provisório com corpo marrom/creme, duas patas dianteiras, duas traseiras, duas orelhas e uma cauda. Aceita PNGs oficiais quando fornecidos. Livro, comida, café e expressões acompanham os estados.
- [PetAccessory.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/pet/PetAccessory.tsx:1>): óculos, fones e chapéu em camada reutilizável, sem duplicar ou alterar partes do corpo.
- [PetScene.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/pet/PetScene.tsx:1>): cenários independentes do personagem; quarto, sala de estudos, biblioteca e jardim, com substituição opcional por PNG.
- [PetStats.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/pet/PetStats.tsx:1>): alimentação, felicidade, energia e evolução, com progress acessível.
- [PetActions.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/pet/PetActions.tsx:1>): Estudar, Alimentar, Brincar, Descansar e Personalizar com ícones e rótulos.
- [PetShop.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/pet/PetShop.tsx:1>): alimentos com saldo/nível necessários e interação visual de café sem pagamento.
- [PetInventory.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/pet/PetInventory.tsx:1>): compra única, equipar/remover um acessório por vez, nome e regras configuráveis. Comprar não altera XP/nível.
- [PetRewards.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/pet/PetRewards.tsx:1>): histórico com origem, tempo válido, moedas e XP realmente registrados.

### Arquivos criados — preparação de assets e painel

- [manifest.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/assets/pet/manifest.ts:1>): detecta PNGs por pose/cenário/objeto/acessório no build; mantém fallback vetorial sem solicitar arquivos inexistentes.
- [assets/pet/README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/assets/pet/README.md:1>): nomes e proporções dos PNGs oficiais e delimitação da arte provisória.
- [assets/backgrounds/README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/assets/backgrounds/README.md:1>): cenários 1:1 sem personagem/UI.
- [assets/items/README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/assets/items/README.md:1>): livro, café, alimento e brinquedo transparentes, separados.
- [assets/accessories/README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/assets/accessories/README.md:1>): camadas opcionais de óculos, fones e chapéu e suas âncoras.
- [ProfileSummary.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/ProfileSummary.tsx:1>): foto, nome, constância e três indicadores reais, sem valores da imagem tratados como registros. Uma edição concorrente que removeu a linha do objetivo neste arquivo foi preservada; apenas a referência sem uso foi corrigida. O objetivo continua na primeira coluna.
- [StudyPerformance.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/StudyPerformance.tsx:1>): gráficos, aproveitamento, metas e música existentes, extraídos para as abas. O seletor filtra os gráficos, sem alterar os créditos globais do pet.
- [StudyHistory.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/StudyHistory.tsx:1>): linha do tempo real e cadastro manual de resultados de simulados com validação de total/acertos.
- [SidebarContent.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/SidebarContent.module.css:1>): abas, seletor, área branca rolável, histórico e abertura de ferramentas; classes `tabs`, `content`, `selector`, `toolHeading`, `toolPage`, `history` e `subjectList`.

### Arquivos alterados

- [App.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/App.tsx:1>): mantém o painel do perfil montado e entrega o contexto das ferramentas à sua área branca; solicitação de Estudar do pet abre o seletor do Dock existente.
- [App.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/App.module.css:1>): mantém a altura do painel e transfere a rolagem para o conteúdo interno; remove estilos obsoletos do antigo painel de ferramenta separado.
- [PerformancePanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.tsx:1>): perfil permanente, seletor, cinco abas funcionais e ferramentas contextuais com botão de fechar. Ferramentas abertas permanecem montadas quando ocultas, evitando reset do estado. O PET é carregado sob demanda.
- [PerformancePanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.module.css:1>): reutiliza os estilos de perfil, indicadores e gráficos; o conteúdo branco assume a rolagem sem deslocar o cabeçalho.
- [StudyDock.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.tsx:1>): aceita solicitação de estudo do pet, sem iniciar sessão falsa ou duplicar uma ativa. Pausa/finalização continuam no fluxo original.
- [types.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/types.ts:1>): intervalos válidos e encerramento nas sessões, segmentos na sessão ativa e contrato de simulado manual.
- [useStudyStore.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.ts:1>): salva intervalos entre iniciar/retomar/pausar/encerrar, mantém o tempo líquido original, adiciona simulados e migra para v5 preservando dados existentes.
- [useStudyStore.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.test.ts:1>): amplia a verificação de pausas para conferir os dois intervalos que totalizam os mesmos 180 segundos líquidos.
- [db.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/db.ts:1>): IndexedDB v3 com petStates e petRewards, preservando áudios e imagens.
- [SettingsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/SettingsPanel.tsx:1>): valida/restaura simulados no backup de estudos, mantendo o banco do pet separado e sem repetir origens já pagas.
- [package.json](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/package.json:1>): adiciona fake-indexeddb somente para testes de persistência/transações.
- [package-lock.json](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/package-lock.json:1>): registra a nova dependência de desenvolvimento; nenhuma biblioteca nova de runtime.
- [README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md:1>): regras, cuidados, evolução, persistência, assets, simulados, compatibilidade e limites desta primeira versão.
- [IMPLEMENTATION.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/docs/IMPLEMENTATION.md:1>): relatório individual desta atualização; os links abrem arquivos completos, não diffs remotos.

### Regras e garantias implementadas

- Tempo pago por escada cumulativa horária: 10/25/50/60 minutos válidos correspondem a totais 10/30/65/80 moedas e XP, sem somar os marcos sobrepostos. Valores são editáveis para créditos futuros.
- Intervalos são unidos antes do cálculo e limitados ao tempo líquido/encerramento. Registros antigos sem segmentos usam aproximação limitada ao tempo líquido existente; não há como reconstruir suas pausas antigas.
- Transações leem ledger e saldo antes de escrever; chaves study:{id}, mock:{id} e daily:{data} tornam o crédito idempotente. Compras também são transacionais. Questões sobrepostas são consideradas proporcionalmente ao tempo ainda não pago.
- Nenhuma moeda é criada por deixar a aba aberta, brincar, fazer carinho ou trocar cenário. Sessões antigas concluídas podem ser conciliadas uma vez ao abrir o app. Simulados são registros manuais do usuário, não validações de uma plataforma externa.
- Nível depende somente do XP; itens e cenas desbloqueiam por nível/tempo. O pet nunca morre/desaparece. Queda de necessidades não impede estudar.
- Progresso local inclui nome, XP, saldo, necessidades, regras, cena, inventário/equipamento, intervalos pagos, metas por dia e ledger. Recarregar preserva os dados. O JSON de estudos não exporta o banco do pet e não o apaga ao restaurar.
- A proteção é local à mesma origem do navegador. Não há sincronização entre dispositivos, proteção contra adulteração via DevTools, migração Supabase ou identidade remota do pet nesta versão.

### Validação e limitações reais

- TypeScript estrito, suíte com 28 testes em oito arquivos e build Vite executados. Os testes novos exercitam regras e transações no IndexedDB simulado, inclusive reabertura e chamadas concorrentes; não são testes com duas abas reais.
- A instalação da dependência de teste retornou zero vulnerabilidades; nenhuma dependência de runtime foi acrescentada. Avisos de chunks grandes de gráficos/Three.js/PDF.js continuam no build.
- A página e o módulo PetGame responderam HTTP 200 no servidor local existente (`localhost:5174`). Isso não comprova a aparência renderizada.
- Inspeção estática intermediária: 120 IDs literais, nenhum duplicado e nenhuma referência ausente aos CSS Modules. O DOM dinâmico/portais não foi inspecionado em navegador.
- Revisão visual tentada: `The browser access host is unavailable`. Touch, teclado real, animações renderizadas, duas abas reais, Android/APK e uso com os PNGs oficiais permanecem sem validação de ponta a ponta.
- Não foram fornecidos os PNGs oficiais independentes. A arte vetorial é provisória, não uma reprodução oficial validada. Não há imagem única contendo pet e cenário. A substituição futura deve preservar as âncoras para não desalinhá-los.
- Nenhuma publicação ou alteração no banco remoto. O servidor local já existente não foi encerrado.

### Identidade visual, CSS e identificação

O cenário quadrado é a área principal. Personagem, ambiente, acessórios e objeto segurado são camadas separadas; SVGs substituem os PNGs ausentes. O personagem mantém quatro patas e uma cauda entre estados. Animações incluem respiração, piscar, virar página, reação ao carinho, mastigação, café, brincadeira, descanso e comemoração discreta, respeitando a redução de movimento global.

Ícones Lucide profissionais (BookOpen, Fish, Gamepad2, Moon, Shirt, Coins, Lock, Battery, Heart, Sparkles e controles) identificam as ações. Não foram usados emojis como controles.

PetGame.module.css concentra os estilos dos componentes do mesmo minigame; SidebarContent.module.css cuida da navegação/contexto, e o módulo existente PerformancePanel conserva perfil/gráficos. Classes novas do pet: game, header, stats, scene, scenery, characterButton, character, spriteWrapper, accessoryLayer, heldItem, eyes, heldBook, turningPage, mouth, sceneLabel, sceneNavigation, studyMessage, actions, shop, history e footer. Estados visuais usam data-action/data-scene, evitando classes sucessivas de correção. Estilos obsoletos da antiga área de ferramenta foram removidos; não há conflitos conhecidos na análise estática.

IDs relevantes: pet-minigame, pet-vital-stats, pet-stat-{estado}, pet-square-scene, pet-touch-character, pet-action-bar, pet-action-{ação}, pet-scene-select-{ambiente}, pet-food-shop, pet-buy-food-{id}, pet-inventory, pet-accessory-{id}, pet-reward-history, sidebar-content-tabs, sidebar-tab-{aba}, sidebar-subject-filter, sidebar-white-content e sidebar-close-{ferramenta}. Todos usam chaves funcionais, não dados pessoais.

---

## Atualização — objetivo e atalhos restaurados, modal lateral e API de brasões

**27 arquivos envolvidos: 12 criados, 15 alterados e nenhum removido.** A primeira coluna volta a ter resumo do objetivo com brasão no topo, grupos de matérias no meio e atalhos de sites no rodapé. O editor do objetivo agora é um modal amplo com navegação lateral menor e conteúdo maior, conforme a referência. A busca real de imagens usa a API Wikimedia Commons; a seleção tenta baixar a imagem, que fica em rascunho e só é gravada localmente ao salvar.

### Novos arquivos e responsabilidades

Os links abrem individualmente os arquivos completos na linha 1; não são links de diff em um repositório remoto.

- [institutionEmblems.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/institutionEmblems.ts:1>): serviço da API Commons, CORS público, timeout/cancelamento, interpretação de resultados e download. Filtra MIME de imagem e hosts Wikimedia, mostra erros 429 e mantém título, autoria, licença e fonte.
- [institutionEmblems.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/institutionEmblems.test.ts:1>): cinco testes de metadados, fontes/hosts, erro dentro de HTTP 200, expansão de PC-TO/consulta sem cookies e erro 429 no download.
- [shortcuts.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/shortcuts.ts:1>): atalhos iniciais reais e validação HTTPS/identificadores únicos.
- [shortcuts.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/shortcuts.test.ts:1>): dois testes de URLs, listas vazias e IDs duplicados.
- [ObjectiveDetails.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/ObjectiveDetails.tsx:1>): campos do concurso, extraídos do editor para separar apresentação e navegação. Trocar a instituição limpa a seleção de brasão no rascunho.
- [CurriculumEditor.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/CurriculumEditor.tsx:1>): edição de grupos/matérias, metas e conteúdo do edital, preservando as funcionalidades anteriores.
- [InstitutionEmblem.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/InstitutionEmblem.tsx:1>): exibição reutilizável no resumo e no editor. Prioriza a prévia/cópia local correspondente ao arquivo selecionado. PC-TO tem fallback da referência; outros órgãos sem seleção usam placeholder identificado. Recortes SVG recebem IDs próprios por instância com React useId.
- [InstitutionEmblem.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/InstitutionEmblem.module.css:1>): tamanho, proporção e placeholder. Classes novas `emblem` e `placeholder`.
- [InstitutionEmblemPicker.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/InstitutionEmblemPicker.tsx:1>): busca explícita, prévia, escolha, remoção, fonte/licença e mensagens de rede. Usa TanStack Query com cache de 15 minutos e sem repetição automática de erros.
- [InstitutionEmblemPicker.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/InstitutionEmblemPicker.module.css:1>): painel de busca e lista de resultados, classes `picker`, `institution`, `results` e `source`.
- [StudyShortcuts.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/StudyShortcuts.tsx:1>): rodapé com links reais para Qconcursos, Gran Cursos, YouTube e Drive; botão + abre editor para adicionar, alterar ou remover sites. Edição em rascunho até salvar.
- [StudyShortcuts.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/StudyShortcuts.module.css:1>): barra de ícones e formulário de atalhos, classes `shortcuts`, `links` e `shortcutFields`.

### Arquivos alterados

- [GoalsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.tsx:1>): restaura Objetivo → Matérias → Atalhos, com lápis para edição e dados persistidos do concurso.
- [GoalsPanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.module.css:1>): restaura hierarquia do resumo e mantém os atalhos ao fim do painel; classes `overview` e `goalDetails`, reutilizando `panel`.
- [SubjectGroups.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/SubjectGroups.tsx:1>): restaura o título Matérias no card e seu identificador acessível.
- [SubjectGroups.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/SubjectGroups.module.css:1>): classe `curriculumTitle` para o título do card; mantém acordeões e metas.
- [GoalEditor.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalEditor.tsx:1>): orquestra navegação em Dados do objetivo, Grupos e matérias, Perfil, Aparência e Seu ritmo; mantém rascunhos de objetivo/grade entre abas; salva o blob do brasão antes de aplicar a seleção. Preferências usam autosave explicitamente informado. SettingsPanel é carregado sob demanda.
- [GoalEditor.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalEditor.module.css:1>): menu lateral, área rolável, duas colunas internas dos dados, rodapé de ações e navegação horizontal móvel. Classes novas `navigation`, `editorForm`, `content` e `objectiveLayout`; reaproveita estilos do formulário e concentra o footer em uma única regra.
- [Glass.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Glass/Glass.tsx:1>): permite navegação opcional no modal sem alterar o contrato dos demais diálogos; preserva o comportamento acessível Radix.
- [Glass.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Glass/Glass.module.css:1>): variante `[data-layout=settings]`, painel menor à esquerda, área maior à direita e adaptação móvel. Classes novas `modalNavigation` e `modalBody`.
- [SettingsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/SettingsPanel.tsx:1>): pode exibir uma categoria por vez dentro do modal, mantém o painel original completo e valida brasão/atalhos ao restaurar backups. Prefixos de IDs evitam conflito quando há configurações ao fundo e no modal.
- [ImageSettings.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/ImageSettings.tsx:1>): aceita prefixo de identificação para reutilização dos uploads em contextos independentes.
- [useVisualAsset.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/hooks/useVisualAsset.ts:1>): informa o nome do arquivo em cache para conferir correspondência do brasão com os metadados restaurados.
- [types.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/types.ts:1>): contratos InstitutionEmblem e StudyShortcut; campo opcional goal.emblem e tipo de asset local emblem.
- [useStudyStore.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.ts:1>): persistência v4 e atalhos; migração preserva a aparência escolhida por quem já estava na v3, além dos estudos/grupos existentes.
- [README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md:1>): documenta composição restaurada, modal, rascunho/autosave, API, limites de download, cache, atalhos e backups.
- [IMPLEMENTATION.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/docs/IMPLEMENTATION.md:1>): este registro de arquivos, qualidade e validação.

### API e verificação real

- Fonte técnica primária: [MediaWiki Imageinfo](https://www.mediawiki.org/wiki/API:Imageinfo) e [CORS](https://www.mediawiki.org/wiki/API:Cross-site_requests). A busca usa `commons.wikimedia.org/w/api.php`, sem chave ou cookies. Os resultados não são tratados como correspondência automática: o usuário confere órgão, versão e licença.
- A consulta real retornou os arquivos `File:Pctocantins.jpg` e `File:PCTO (8718392537).jpg`, entre outros resultados. Arquivos PDF/DjVu são filtrados pela implementação. Não foi inventado catálogo local de imagens de instituições.
- A tentativa de download de `Pctocantins.jpg` no servidor de imagens retornou **HTTP 429 Too Many Requests**. O arquivo não foi incluído como asset baixado com sucesso. A integração trata esse erro; o brasão PC-TO fornecido na referência permanece como fallback explícito. Outros órgãos sem seleção não recebem o brasão de PC-TO.
- Seleções baixadas ficam em rascunho até salvar; o blob é guardado no IndexedDB existente e os metadados no objetivo. Backups JSON incluem metadados/atalhos, mas não os blobs de imagens. Após restaurar, pode ser necessário novo acesso à rede.

### Validação e limites

- `npm run lint`: checagem TypeScript estrita aprovada, incluindo imports não utilizados; não executa ESLint.
- `npm test`: 18 testes aprovados em seis arquivos. Os sete testes novos cobrem API e atalhos com respostas controladas; não equivalem a teste visual ou download real bem-sucedido.
- `npm run build`: aprovado. Avisos de chunks grandes em bibliotecas de gráficos, Three.js e PDF.js permanecem. O aviso de importação simultânea estática/dinâmica de SettingsPanel foi corrigido com carregamento sob demanda.
- HTTP local: dashboard e módulo GoalEditor responderam 200 em `localhost:5174`; isso não comprova o resultado renderizado.
- Inspeção estática: 99 IDs literais, nenhum duplicado e nenhuma referência ausente a classes CSS Modules. Identificadores de preferências reutilizadas possuem prefixos separados; SVGs usam IDs específicos por instância. O DOM dinâmico não foi inspecionado em navegador.
- A tentativa de revisão visual retornou `The browser access host is unavailable`. Layout, teclado/foco real, navegação responsiva e cache IndexedDB de brasão não foram verificados de ponta a ponta nesta sessão.
- Nenhuma dependência adicionada, banco remoto alterado ou publicação realizada.

### CSS, ícones e organização

Os componentes de resumo, escolha de brasão e atalhos possuem folhas próprias. ObjectiveDetails e CurriculumEditor reutilizam o módulo do editor, pois compõem a mesma tela; uploads continuam no módulo existente. A variante do GlassModal isola o layout de configuração dos diálogos comuns. Não foram criadas classes sucessivas de correção nem propriedades duplicadas conhecidas na revisão estática.

Ícones profissionais Lucide: FileText, BookOpen, UserRound, Monitor, Sun, LogOut, Save, Search, ExternalLink, Shield, Globe, GraduationCap, HardDrive, Youtube, Plus e Trash2. Mantém hover, foco, transições e preferência de movimento reduzido existentes. O layout segue as referências enviadas e adapta o menu para telas pequenas. Aceite visual continua pendente.

---

## Atualização — composição da referência, foto e plano de fundo

**24 arquivos envolvidos: 5 criados, 19 alterados e nenhum removido.** A página passa a usar painéis maiores sobre uma fotografia de mesa de estudos, calendário com mês centralizado e Dock largo em cápsula. A primeira coluna mostra somente os grupos de matérias; as matérias e tópicos aparecem ao expandir os grupos. Os dados completos do concurso continuam no modal de edição, acessível pelo lápis. As telas de configurações passam a oferecer foto de perfil e imagem de fundo personalizadas, prévia e remoção.

### Arquivos criados e organização

- [study-desk-wallpaper.jpg](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/public/images/study-desk-wallpaper.jpg>): fundo inicial de mesa de estudos. Fonte: [Michelle Mac / Unsplash](https://unsplash.com/photos/a-pink-notebook-and-a-calculator-on-a-table-qUH8UyooT6c). Não é uma reprodução exata da foto de fundo da referência.
- [visualAssets.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/visualAssets.ts:1>): serviço local de validação e salvamento dos blobs; aceita JPG, PNG e WebP até 10 MB, verifica decodificação e libera a URL temporária.
- [useVisualAsset.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/hooks/useVisualAsset.ts:1>): novo diretório `src/hooks`, dedicado a hooks reutilizáveis; assinatura reativa Dexie para atualizar avatar, fundo e prévias, com liberação das URLs ao substituir/desmontar.
- [ImageSettings.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/ImageSettings.tsx:1>): componente compartilhado dos uploads, prévias, remoções e mensagens. IDs `settings-image-{avatar|wallpaper}`, `settings-upload-{avatar|wallpaper}` e `settings-remove-{avatar|wallpaper}`.
- [ImageSettings.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/ImageSettings.module.css:1>): estilos locais de prévia e controles de arquivo. Classes novas `imageSettings`, `preview`, `actions`, `upload` e `message`.

### Arquivos alterados

Os links abaixo abrem cada arquivo completo na linha 1; não representam links de diff remoto.

- [App.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/App.tsx:1>): integra fundo personalizado ou padrão, simplifica o topo retirando cabeçalho/saudação/rodapé e preserva a navegação responsiva. Usa `data-custom` e `data-desk` para controlar o tipo de fundo.
- [App.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/App.module.css:1>): reorganiza o grid, altura dos painéis, rolagem lateral, fundo com cover/desfoque e breakpoints. Reaproveita as classes dos painéis e remove as antigas de marca, saudação e rodapé; nova classe `wallpaperPhoto`.
- [types.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/types.ts:1>): opção de fundo `desk` e contratos VisualAsset/VisualAssetKind.
- [db.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/db.ts:1>): versão 2 do IndexedDB, adiciona `visualAssets` preservando a tabela `audioNotes`.
- [useStudyStore.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.ts:1>): persistência v3; fundo inicial de mesa e migração do antigo padrão sálvia, preservando areia/azul, estudos e demais preferências.
- [SettingsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/SettingsPanel.tsx:1>): upload de foto em Perfil e upload de fundo em Aparência; escolha de quatro fundos padrão e explicação da prioridade do personalizado.
- [PerformancePanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.tsx:1>): exibe foto real quando fornecida, fallback para iniciais, objetivo atual, gráfico de pizza maior com dados reais e estado neutro quando vazio. Nenhuma foto pessoal da referência é usada como avatar.
- [PerformancePanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.module.css:1>): amplia avatar/gráfico, ajusta recorte circular da foto, textos e três indicadores em cards claros. Remove regra antiga de separador que conflitaria com o novo card.
- [StudyCalendar.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Calendar/StudyCalendar.tsx:1>): substitui o título promocional pelo mês/ano centralizado com anterior/próximo nas laterais. Mantém semana/mês/ano, registros e planejamento. Novo ID `calendar-period-heading`.
- [StudyCalendar.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Calendar/StudyCalendar.module.css:1>): superfície neutra própria, tipografia maior, grade expansível, destaque azul do dia atual e controles adaptados ao celular. Remove estilos do cabeçalho antigo.
- [StudyDock.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.tsx:1>): retira a legenda decorativa abaixo do Dock, preservando as ferramentas e sessões.
- [StudyDock.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.module.css:1>): cápsula larga translúcida, ícones brancos maiores e distribuídos, formulário expansível ajustável e versão móvel. Remove estilos dos antigos ícones em blocos coloridos e da legenda.
- [tokens.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/styles/tokens.css:1>): superfícies cinza/branco, destaque azul, material do Dock e tokens `calendar-surface`/`dock-icon`; mantém tema escuro.
- [GoalsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.tsx:1>): apresenta somente os grupos e o botão de editar; resumo com brasão, salário e atalhos saem da coluna conforme a nova instrução. Os dados não são apagados.
- [GoalsPanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.module.css:1>): concentra o layout do painel de grupos e cabeçalho; remove classes obsoletas de brasão, resumo, atalhos e rodapé.
- [SubjectGroups.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/SubjectGroups.tsx:1>): evita título duplicado e mostra os cabeçalhos de matérias/dedicação somente dentro do grupo expandido; a apresentação inicial contém os nomes dos grupos.
- [SubjectGroups.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/SubjectGroups.module.css:1>): tipografia maior e remoção da classe de título interno que deixou de ser usada.
- [README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md:1>): instruções de foto/fundo, formatos e limites, armazenamento local, backup, migração e origem do fundo.
- [IMPLEMENTATION.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/docs/IMPLEMENTATION.md:1>): este relatório com arquivos, CSS, identificação e limites de validação.

### Validação e limites

- TypeScript estrito (`npm run lint`), 11 testes existentes e build Vite aprovados. O build continua com avisos de chunks grandes em gráficos, Three.js e PDF.js.
- A página local e o novo asset responderam HTTP 200 em `localhost:5174`. Isso confirma disponibilidade HTTP, não aparência renderizada.
- A inspeção estática intermediária encontrou 95 IDs literais sem duplicação e nenhuma referência ausente a classes dos CSS Modules. IDs de upload são derivados somente do tipo de imagem, sem dados pessoais.
- A revisão visual foi tentada: a ferramenta informou `The browser access host is unavailable`. Não foi possível validar o layout renderizado, o upload/remoção pela interface, o recarregamento real dos blobs, responsividade em navegador ou a migração IndexedDB em um dispositivo real.
- Nenhuma dependência adicionada, nenhuma mudança no banco remoto e nenhuma publicação. Imagens ficam em IndexedDB; não são enviadas ao Supabase nem incluídas nos backups JSON/CSV existentes. Limpar os dados do navegador remove as imagens; mantenha os arquivos originais.

### Identidade visual e qualidade do CSS

A referência fornecida orienta a composição de painéis, calendário e Dock. O fundo fotográfico é semelhante em tema, não a mesma fotografia; pode ser substituído em Configurações. Ícones Lucide existentes são reaproveitados; ImagePlus/Trash2/UserRound identificam os novos controles. Mantém hover, transições e redução de movimento já existentes.

As alterações corrigem os estilos responsáveis, sem classes de correção sucessivas. Glass e formulários continuam compartilhados; upload tem CSS Module próprio, e cada painel mantém seu módulo. Regras sem uso do cabeçalho, resumo, atalhos e Dock foram removidas. Não há conflitos conhecidos na revisão estática; a aceitação visual permanece pendente.

---

## Atualização — grupos, matérias e grade do edital

**Escopo desta atualização:** 17 arquivos envolvidos: 10 criados, 7 alterados, nenhum removido. A primeira coluna apresenta os grupos expansíveis Disciplinas Básicas e Gerais, Noções de Direito e Conhecimentos Específicos e Locais. Cada matéria também é expansível e mostra seus tópicos, indicadores e metas Q/H. O modal Seu próximo objetivo possui edição em rascunho de grupos e matérias, inclusão, remoção, movimentação entre grupos e metas. Cancelar descarta a edição; salvar aplica o objetivo e a grade juntos.

### Arquivos criados

- [SubjectGroups.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/SubjectGroups.tsx:1>): acordeões acessíveis de grupos e matérias, grade de dedicação e tópicos. IDs: `study-subject-groups`, `study-subject-groups-title`, `study-subject-group-{id}`, `study-subject-{id}` e `study-subject-topics-{id}`.
- [SubjectGroups.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/SubjectGroups.module.css:1>): estilos da grade e seus dois níveis. Classes novas: `curriculum`, `columns`, `group`, `groupSubjects`, `subject`, `subjectName`, `dedication`, `subjectContent`, `subjectProgress`, `topics`, `emptyTopics` e `emptyGroup`.
- [GoalEditor.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalEditor.tsx:1>): modal modular com dados do concurso, grupos, matérias e confirmação de remoção de grupos. IDs de campos e ações usam prefixos `goal-`, `goal-group-` e `goal-subject-`, seguidos de IDs persistidos. Uma sessão ativa impede remover a matéria associada. Históricos não são apagados.
- [GoalEditor.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalEditor.module.css:1>): estilos compartilhados pelo editor e seu campo de matéria. Classes novas: `goalFields`, `groupEditor`, `curriculumHeading`, `groupHeading`, `subjectEditor`, `subjectFields`, `syllabusActions`, `pdfUpload`, `extractionMessage`, `removeSubject`, `removalConfirmation` e `footer`.
- [SubjectSyllabusEditor.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/SubjectSyllabusEditor.tsx:1>): campos por matéria, metas, seleção de grupo, texto do edital, arquivo PDF, extração e revisão manual. IDs específicos: `goal-subject-editor-{id}`, `goal-subject-name-{id}`, `goal-subject-group-{id}`, `goal-subject-questions-{id}`, `goal-subject-hours-{id}`, `goal-subject-syllabus-{id}`, `goal-subject-pdf-{id}`, `goal-subject-extract-{id}`, `goal-subject-topics-{id}` e `goal-subject-remove-{id}`.
- [syllabus.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/syllabus.ts:1>): extração determinística de enumerações, remoção do título da matéria, união de linhas e preservação de listas internas. Sem chamadas de IA ou envio de texto a servidores.
- [syllabus.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/syllabus.test.ts:1>): três testes de extração, incluindo os nove tópicos fornecidos pelo usuário, listas internas, quebras de linha, subitens, tópicos duplicados e texto vazio.
- [curriculum.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/curriculum.ts:1>): três grupos e treze matérias iniciais conforme a referência, exemplo de Português e normalização de grades antigas. Metas iniciais são configuráveis; não representam registros realizados. Conteúdos sem texto de edital fornecido não recebem tópicos inventados.
- [curriculum.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/curriculum.test.ts:1>): três testes de compatibilidade, preservação de IDs/tópicos/metas, grupos personalizados/vazios e matérias desconhecidas.
- [pdfSyllabus.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/pdfSyllabus.ts:1>): PDF.js carregado sob demanda, worker local, leitura de texto selecionável e liberação dos recursos. Limites de 20 MB e 300 páginas. Não há OCR. O texto inteiro é carregado para que o usuário mantenha apenas o trecho da matéria antes de extrair.

### Arquivos alterados

- [GoalsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.tsx:1>): integra SubjectGroups e GoalEditor, retirando do painel a lista plana e o formulário anterior. O resumo do concurso e os atalhos permanecem.
- [GoalsPanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.module.css:1>): remove regras obsoletas da lista plana (`sectionTitle`, `subjects`, `subject`, `subjectIcon`, `subjectLabel`, `progress`, `subjectTime` e `topics`). Mantém os estilos do painel, resumo e atalhos.
- [types.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/types.ts:1>): define SubjectGroup e associa cada matéria a um grupo, uma meta de questões e texto opcional do edital.
- [useStudyStore.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.ts:1>): estado de grupos, salvamento conjunto e persistência v2; migra dados antigos sem trocar IDs. A lista inicial original é completada conforme a referência, e apenas os tópicos genéricos intactos de Português são substituídos pelo exemplo fornecido. Remove ações antigas sem consumidores.
- [SettingsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/SettingsPanel.tsx:1>): restauração de backups normaliza grupos e matérias, preservando compatibilidade com versões anteriores. O backup já serializa o estado completo, incluindo os novos campos.
- [README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md:1>): documenta criação/edição/remoção, extração e revisão, importação PDF local, limites, migração e testes.
- [IMPLEMENTATION.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/docs/IMPLEMENTATION.md:1>): relatório desta atualização com caminhos e links individuais.

### Validação, identidade visual e CSS

- `npm run lint`: TypeScript estrito aprovado; este script não é ESLint.
- `npm test`: 11 testes aprovados em quatro arquivos.
- `npm run build`: aprovado, com avisos de chunks grandes em gráficos/Three.js/PDF.js. O worker PDF foi emitido em `dist/assets`.
- Inspeção estática: 109 IDs literais, nenhum duplicado e nenhuma referência ausente a CSS Modules. IDs dinâmicos usam chaves locais persistidas, não dados sensíveis.
- Nenhuma biblioteca adicionada. Reutiliza PDF.js, Lucide, Radix e os controles Glass já instalados. Ícones novos no fluxo: ChevronRight, ListTree, FileText, ListChecks, Upload, FolderPlus, Plus, Save e Trash2. A rotação suave dos indicadores acompanha a expansão; respeita as preferências existentes de movimento reduzido.
- CSS das funcionalidades separado em SubjectGroups.module.css e GoalEditor.module.css. Controles Glass e formulários compartilhados são reaproveitados. As regras antigas da lista foram removidas; não foram acrescentadas classes de correção nem conflitos conhecidos na revisão estática.
- Limites: revisão visual no navegador e importação de um PDF real não executadas nesta alteração. Os testes validam a extração de texto fornecido, não OCR nem todas as diagramações possíveis de um edital. Os tópicos exigem revisão humana e ficam disponíveis no seletor de assunto após salvar. Banco remoto e publicação não foram alterados.

---

## Ajuste posterior — resumo do objetivo na primeira coluna

Seis arquivos envolvidos: um asset criado e cinco arquivos alterados; nenhum removido. O bloco superior agora segue a referência fornecida: brasão dourado centralizado, nome da instituição, concurso/ano, cargo e banca à esquerda e salário em destaque. As disciplinas e demais colunas mantêm seus componentes.

- [GoalsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.tsx:1>): estrutura identificada por `study-goal-overview`, `study-goal-emblem`, `study-goal-institution`, `study-goal-details` e `study-goal-salary`. O botão de edição foi mantido.
- [GoalsPanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.module.css:1>): reaproveita `emblem`, `institution` e `goalDetails`; adiciona `overview` e `salary`; remove `heading` e regras antigas de ícone e detalhes. Sem estilos de correção sobrepostos ou conflitos conhecidos na análise estática.
- [useStudyStore.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.ts:1>): dados iniciais conforme a imagem e migração da persistência v0 para v1, preservando objetivos personalizados e registros existentes.
- [study-dashboard-reference.png](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/public/images/study-dashboard-reference.png>): cópia integral da imagem fornecida, em `public/images`; o SVG exibe apenas a região do brasão, sem reconstruir sua arte ou alterar o arquivo raster.
- [README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md:1>): documenta origem dos dados e do brasão, apresentação e migração.
- [IMPLEMENTATION.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/docs/IMPLEMENTATION.md:1>): registra esta alteração.

Identidade visual: brasão da referência, sem novos ícones ou animações; Lucide Pencil permanece no botão de edição. A referência recebida orienta esta alteração específica; não foram adicionadas bibliotecas. Verificação de tipos e build executados. Revisão renderizada não realizada nesta alteração.

Entrega em 8 de novembro de 2026. Diretório inicialmente vazio; todos os arquivos abaixo são novos. Build, dependências, cache e metadados Git não entram na contagem.

## A. Resumo

- 45 arquivos criados; 0 arquivos preexistentes alterados; 0 removidos.
- Base visual de três colunas e ferramentas locais; não é a conclusão integral das sete fases.
- Estatísticas reais derivadas exclusivamente de sessões locais; sem números de demonstração apresentados como desempenho.

## B. Arquivos individuais

Os links apontam para caminhos locais absolutos, linha 1, pois cada arquivo foi criado integralmente. Não há repositório GitHub remoto verificável. O repositório privado do Sites ainda não recebeu o código.

| Arquivo                                                  | Finalidade da criação                                                                                     | Caminho completo e link                                                                                                                                                                                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.example`                                           | Variáveis públicas necessárias para habilitar Supabase.                                                   | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/.env.example](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/.env.example:1>)                                                                                     |
| `.gitignore`                                             | Exclui dependências, build, cache, arquivos locais e segredos do versionamento.                           | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/.gitignore](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/.gitignore:1>)                                                                                         |
| `.openai/hosting.json`                                   | Identidade privada do Sites e diretório estático; ainda não publicado.                                    | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/.openai/hosting.json](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/.openai/hosting.json:1>)                                                                     |
| `README.md`                                              | Execução, arquitetura, comportamentos implementados, limites, dados, Android e próximas fases.            | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/README.md:1>)                                                                                           |
| `capacitor.config.ts`                                    | Identificador Android, nome do aplicativo e diretório dos assets.                                         | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/capacitor.config.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/capacitor.config.ts:1>)                                                                       |
| `docs/IMPLEMENTATION.md`                                 | Este relatório de alterações, arquivos, identificação, CSS e validação.                                   | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/docs/IMPLEMENTATION.md](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/docs/IMPLEMENTATION.md:1>)                                                                 |
| `index.html`                                             | Documento em português, metadados, viewport mobile e ponto de entrada Vite.                               | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/index.html](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/index.html:1>)                                                                                         |
| `package-lock.json`                                      | Versões resolvidas e integridade das dependências; PDF.js e Vitest atualizados após auditoria.            | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/package-lock.json](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/package-lock.json:1>)                                                                           |
| `package.json`                                           | Dependências e comandos de desenvolvimento, tipos, testes, build e Capacitor.                             | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/package.json](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/package.json:1>)                                                                                     |
| `src/App.module.css`                                     | Layout de três colunas, wallpaper abstrato, cabeçalho, navegação móvel e breakpoints.                     | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/App.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/App.module.css:1>)                                                                         |
| `src/App.tsx`                                            | Composição do workspace, navegação responsiva, painéis contextuais e preferências de aparência/movimento. | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/App.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/App.tsx:1>)                                                                                       |
| `src/components/Calendar/StudyCalendar.module.css`       | Grade de datas, estados de progresso, navegação e linha do tempo.                                         | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Calendar/StudyCalendar.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Calendar/StudyCalendar.module.css:1>)             |
| `src/components/Calendar/StudyCalendar.tsx`              | Visões semana/mês/ano, criação e consulta de atividades e reagendamento por arraste.                      | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Calendar/StudyCalendar.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Calendar/StudyCalendar.tsx:1>)                           |
| `src/components/Dock/StudyDock.module.css`               | Dock, estados expandidos, tooltips, microinterações e ilha superior.                                      | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.module.css:1>)                             |
| `src/components/Dock/StudyDock.tsx`                      | Ilha dinâmica, seleção de matéria/assunto, sessão ativa e formulário de encerramento.                     | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Dock/StudyDock.tsx:1>)                                           |
| `src/components/Glass/Glass.module.css`                  | Material de vidro, controles, indicador segmentado, overlay e modal.                                      | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Glass/Glass.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Glass/Glass.module.css:1>)                                   |
| `src/components/Glass/Glass.tsx`                         | Primitivas reutilizáveis: painel, botão, botão de ícone, controle segmentado e modal Radix.               | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Glass/Glass.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Glass/Glass.tsx:1>)                                                 |
| `src/components/Goals/GoalsPanel.module.css`             | Painel de objetivo, emblema ilustrativo, listas, barras de progresso e atalhos.                           | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.module.css:1>)                         |
| `src/components/Goals/GoalsPanel.tsx`                    | Editor do objetivo, disciplinas expansíveis, progresso real e atalhos externos.                           | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Goals/GoalsPanel.tsx:1>)                                       |
| `src/components/Performance/PerformancePanel.module.css` | Perfil, indicadores, gráfico de rosca, legenda e player compacto.                                         | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.module.css:1>) |
| `src/components/Performance/PerformancePanel.tsx`        | Perfil, sequência de estudo, métricas reais, gráfico Recharts, metas e música local.                      | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Performance/PerformancePanel.tsx:1>)               |
| `src/components/Pomodoro/PomodoroPanel.module.css`       | Layout da ferramenta, timer, indicadores, controles e mensagens.                                          | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Pomodoro/PomodoroPanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Pomodoro/PomodoroPanel.module.css:1>)             |
| `src/components/Pomodoro/PomodoroPanel.tsx`              | Contagem regressiva persistida, modos de pausa, ciclos, ajuste por arraste/range e fallback WebGL.        | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Pomodoro/PomodoroPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Pomodoro/PomodoroPanel.tsx:1>)                           |
| `src/components/Pomodoro/TomatoScene.tsx`                | Cena R3F/Three.js com corpo vermelho, folhas, escala e rotação proporcional à contagem.                   | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Pomodoro/TomatoScene.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Pomodoro/TomatoScene.tsx:1>)                               |
| `src/components/Tools/AudioPanel.tsx`                    | Captura MediaRecorder com pausa/retomada, player, pesquisa, renomeação e exclusão local.                  | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/AudioPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/AudioPanel.tsx:1>)                                       |
| `src/components/Tools/FlashcardsPanel.tsx`               | Criação, exclusão, virada 3D e classificação de revisões.                                                 | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/FlashcardsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/FlashcardsPanel.tsx:1>)                             |
| `src/components/Tools/NotebooksPanel.tsx`                | Cadernos por disciplina e editor TipTap com salvamento automático.                                        | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/NotebooksPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/NotebooksPanel.tsx:1>)                               |
| `src/components/Tools/SettingsPanel.module.css`          | Grupos de ajustes, campos, opções de restauração e links de autenticação.                                 | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/SettingsPanel.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/SettingsPanel.module.css:1>)                   |
| `src/components/Tools/SettingsPanel.tsx`                 | Perfil, temas, metas, backup/restauração, CSV e formulário Supabase opcional.                             | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/SettingsPanel.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/SettingsPanel.tsx:1>)                                 |
| `src/components/Tools/Tools.module.css`                  | Estilos identificados de capas de caderno, editor, flashcards e biblioteca de áudio.                      | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/Tools.module.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/components/Tools/Tools.module.css:1>)                                   |
| `src/lib/db.ts`                                          | Banco IndexedDB/Dexie para blobs e metadados das gravações.                                               | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/db.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/db.ts:1>)                                                                                   |
| `src/lib/supabase.ts`                                    | Cliente Supabase opcional, ausente quando as variáveis não foram configuradas.                            | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/supabase.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/supabase.ts:1>)                                                                       |
| `src/lib/time.test.ts`                                   | Testes de snapshot, pausa, atraso em segundo plano e formatação do tempo.                                 | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/time.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/time.test.ts:1>)                                                                     |
| `src/lib/time.ts`                                        | Cálculos independentes do intervalo visual para cronômetro, contagem regressiva e datas locais.           | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/time.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/lib/time.ts:1>)                                                                               |
| `src/main.tsx`                                           | Inicialização React, StrictMode, provider TanStack Query e estilos base.                                  | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/main.tsx](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/main.tsx:1>)                                                                                     |
| `src/store/useStudyStore.test.ts`                        | Testes do ciclo de sessão, pausas, validação e proteção contra envio duplicado.                           | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.test.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.test.ts:1>)                                               |
| `src/store/useStudyStore.ts`                             | Domínio de estudos, persistência Zustand, pausas, encerramento e agendamento de revisões.                 | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/store/useStudyStore.ts:1>)                                                         |
| `src/styles/global.css`                                  | Reset Tailwind, foco acessível, formulários compartilhados e fallbacks de acessibilidade.                 | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/styles/global.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/styles/global.css:1>)                                                                   |
| `src/styles/tokens.css`                                  | Materiais, cores, sombras e tokens compartilhados dos temas e fundos.                                     | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/styles/tokens.css](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/styles/tokens.css:1>)                                                                   |
| `src/types.ts`                                           | Contratos de objetivo, matérias, sessões, planejamento, flashcards, áudio e preferências.                 | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/types.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/types.ts:1>)                                                                                     |
| `src/vite-env.d.ts`                                      | Tipos das variáveis e APIs disponibilizadas pelo Vite.                                                    | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/vite-env.d.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/src/vite-env.d.ts:1>)                                                                           |
| `supabase/migrations/202611080001_initial.sql`           | Vinte tabelas privadas, chaves compostas, RLS por proprietário e bucket privado; migração preparada, ainda não aplicada.     | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/supabase/migrations/202611080001_initial.sql](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/supabase/migrations/202611080001_initial.sql:1>)                     |
| `tsconfig.app.json`                                      | Tipos estritos, JSX e validação de imports e parâmetros não utilizados.                                   | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/tsconfig.app.json](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/tsconfig.app.json:1>)                                                                           |
| `tsconfig.json`                                          | Referência ao projeto TypeScript da aplicação.                                                            | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/tsconfig.json](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/tsconfig.json:1>)                                                                                   |
| `vite.config.ts`                                         | Plugins React e Tailwind CSS para desenvolvimento e produção.                                             | [D:/programas/Projetos de programação/Estudo - Lufano/lufano/vite.config.ts](<D:/programas/Projetos de programação/Estudo - Lufano/lufano/vite.config.ts:1>)                                                                                 |

## C. Organização

`src/components` agrupa a interface por responsabilidade com CSS Modules. `src/store` concentra o estado de domínio, `src/lib` as integrações e cálculos, `src/styles` os tokens e regras compartilhadas. `supabase/migrations` contém o esquema inicial revisável. `docs` contém apenas este relatório; o README mantém a documentação de uso e limitações.

## D. Documentação

README: comandos, arquitetura, funcionalidades existentes, persistência local, limitações de privacidade, Supabase, Android, publicação e próximas fases. Este relatório: caminhos e finalidade de cada arquivo, identificadores e estilos. `.env.example`: variáveis de configuração sem valores.

## E. Validação

- Tipos: `npm run lint` passou com TypeScript estrito e verificação de símbolos não utilizados. O script não executa ESLint.
- Testes: `npm test`, cinco testes em dois arquivos, todos aprovados.
- Build: `npm run build`, passou. Avisos de chunks acima de 500 kB em gráficos/Three.js continuam como ponto de otimização.
- Auditoria: `npm audit`, zero vulnerabilidades após atualização das dependências.
- HTTP: página local respondeu 200 em `http://localhost:5173/`. Isso não valida a renderização.
- Inspeção estática: 91 IDs literais; nenhum duplicado; nenhuma referência `styles.nome` ausente nos CSS Modules correspondentes. IDs gerados pelos componentes, Radix e dados precisam de inspeção do DOM renderizado.
- Revisão visual interrompida: a ferramenta de controle do Chrome não conseguiu determinar a URL com segurança. Não houve aceite visual, nem testes reais em tablet/celular.
- Não executados: autenticação real, aplicação de SQL/RLS remoto, gravação de microfone real, sincronização e Android/APK.
- Publicação bloqueada: o auto-review rejeitou a sincronização por envolver envio do código a um repositório externo privado sem autorização explícita para esse destino. Nenhuma versão foi publicada.

## F. Identidade visual

Paleta sálvia clara, vidro translúcido, tipografia do sistema, bordas iluminadas e wallpaper abstrato em camadas. Ícones profissionais Lucide. A composição segue as imagens fornecidas, sem extrair a foto pessoal ou o brasão como arquivos. O tomate é geometria 3D própria, ainda sem numeração tridimensional e acabamento fotorealista completo.

Referências consultadas: [Apple Liquid Glass](https://www.apple.com/br/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) e [FreeFrontend CSS Tabs](https://freefrontend.com/css-tabs/). Foram adaptados o agrupamento de controles, estados segmentados e transições.

Interações: mudança de painéis com Motion, expansão do Dock, hover com deslocamento/escala, tooltips, modal animado, capas em perspectiva e flashcards com giro de 180 graus. Preferência de movimento do sistema e opção manual são respeitadas; a rotação funcional do Pomodoro acompanha o tempo, não uma animação decorativa contínua.

## G. CSS e identificação

- Todas as classes são novas, pois não existia base anterior. Primitivas Glass e formulários são reutilizados pelas funcionalidades.
- Nenhuma classe preexistente foi removida. Não foram criadas sequências de classes de correção.
- Tokens ficam em `src/styles/tokens.css`. Regras globais se limitam a reset, formulários comuns, acessibilidade e fallbacks.
- Estilos visuais de componentes ficam nos módulos listados abaixo; sem conflitos conhecidos na revisão estática. Propriedades semelhantes em componentes independentes mantêm isolamento intencional. A inspeção renderizada continua pendente.
- O uso de `!important` se limita à redução de movimento, para sobrepor transições e animações de forma acessível.

### src/App.module.css

Classes: `workspace`, `wallpaper`, `header`, `brand`, `brandIcon`, `headerCenter`, `localStatus`, `intro`, `currentDate`, `dashboard`, `left`, `center`, `right`, `contextWrapper`, `toolPanel`, `toolHeader`, `footer`, `mobileTabs`.

### src/components/Calendar/StudyCalendar.module.css

Classes: `panel`, `header`, `eyebrow`, `calendarBadge`, `toolbar`, `monthNavigation`, `weekdays`, `grid`, `day`, `daySelect`, `dayRecords`, `activity`, `studied`, `more`, `footer`, `legend`, `todayStrip`, `sunIcon`, `dayTimeline`, `timelineRecord`, `completedDot`, `yearGrid`.

### src/components/Dock/StudyDock.module.css

Classes: `dockArea`, `dock`, `tools`, `dockButton`, `appIcon`, `activeDot`, `tooltip`, `caption`, `startForm`, `bookOptions`, `activeIsland`, `pulse`, `sessionSummary`.

### src/components/Glass/Glass.module.css

Classes: `panel`, `button`, `iconButton`, `segmented`, `overlay`, `modal`, `modalHeader`, `description`.

### src/components/Goals/GoalsPanel.module.css

Classes: `panel`, `heading`, `emblem`, `institution`, `goalDetails`, `sectionTitle`, `subjects`, `subject`, `subjectIcon`, `subjectLabel`, `progress`, `subjectTime`, `topics`, `shortcutTitle`, `shortcuts`, `orange`, `notion`, `goalFooter`, `statusDot`.

### src/components/Performance/PerformancePanel.module.css

Classes: `panel`, `topLine`, `profile`, `avatar`, `streak`, `metrics`, `chartHeading`, `chart`, `chartCenter`, `chartLegend`, `dailyGoal`, `music`, `album`, `trackInfo`, `upload`, `volume`.

### src/components/Pomodoro/PomodoroPanel.module.css

Classes: `panel`, `subtitle`, `tomato`, `fallbackTomato`, `dragHint`, `timer`, `cycleDots`, `cycleLabel`, `controls`, `durationLabel`, `integration`, `message`.

### src/components/Tools/SettingsPanel.module.css

Classes: `section`, `switch`, `restore`, `message`, `authLinks`.

### src/components/Tools/Tools.module.css

Classes: `notebooks`, `notebook`, `notebookTitle`, `editorToolbar`, `editor`, `tiptap`, `flashcardControls`, `flashcard`, `cardInner`, `cardFront`, `cardBack`, `cardNavigation`, `ratings`, `recordingControls`, `recordingStatus`, `audioSearch`, `audioList`, `audioItem`.

### src/styles/global.css

Classes: `form-stack`, `form-row`, `form-hint`, `empty-state`, `error-message`, `tool-eyebrow`, `tool-title`, `tool-description`.

### src/styles/tokens.css

Classes: somente tokens, sem classes novas.

### IDs literais por arquivo

- `src/App.tsx`: `lufano-workspace`, `workspace-header`, `workspace-local-status`, `mobile-panel-navigation`, `dashboard-three-columns`, `context-tool-panel`, `tool-back-to-performance`, `workspace-footer`.
- `src/components/Calendar/StudyCalendar.tsx`: `study-calendar-panel`, `calendar-previous`, `calendar-next`, `calendar-view`, `calendar-date-grid`, `calendar-today`, `calendar-add-activity`, `calendar-day-modal`, `day-add-activity`, `activity-save`.
- `src/components/Dock/StudyDock.tsx`: `active-study-island`, `session-pause`, `session-finish`, `dock-notebooks`, `dock-flashcards`, `study-dynamic-dock`, `dock-cancel-start`, `session-subject-select`, `session-topic-select`, `session-start-button`, `session-finish-modal`, `session-learning-summary`, `session-questions`, `session-correct`, `session-save-button`.
- `src/components/Goals/GoalsPanel.tsx`: `study-goals-panel`, `study-goal-edit`, `shortcut-questions`, `shortcut-youtube`, `shortcut-drive`, `shortcut-notion`, `shortcut-add`, `goal-editor-modal`, `goal-save-button`.
- `src/components/Performance/PerformancePanel.tsx`: `performance-panel`, `profile-settings`, `profile-avatar`, `chart-metric`, `chart-period`, `music-upload`, `music-play`, `music-volume`.
- `src/components/Pomodoro/PomodoroPanel.tsx`: `pomodoro-tool`, `pomodoro-mode`, `pomodoro-reset`, `pomodoro-toggle`, `pomodoro-duration`.
- `src/components/Tools/AudioPanel.tsx`: `audio-library-tool`, `audio-subject`, `audio-record`, `audio-pause`, `audio-stop`, `audio-search`.
- `src/components/Tools/FlashcardsPanel.tsx`: `flashcards-tool`, `flashcards-due-only`, `flashcard-add`, `flashcard-flip`, `flashcard-previous`, `flashcard-next`, `flashcard-delete`, `flashcard-create-empty`, `flashcard-create-modal`, `flashcard-question`, `flashcard-answer`, `flashcard-save`.
- `src/components/Tools/NotebooksPanel.tsx`: `notebooks-tool`, `notebook-back`.
- `src/components/Tools/SettingsPanel.tsx`: `settings-tool`, `settings-profile-name`, `settings-auth`, `settings-theme`, `settings-wallpaper`, `settings-reduce-motion`, `settings-daily-hours`, `settings-focus-minutes`, `settings-export-csv`, `settings-backup`, `settings-restore`, `auth-modal`, `auth-email`, `auth-password`, `auth-submit`, `auth-google`.

Os identificadores de datas, disciplinas, gravações e cartões incorporam IDs persistidos ou chaves locais; nenhum contém informações pessoais sensíveis.
