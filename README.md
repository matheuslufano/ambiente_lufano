# Espaço de Estudo Lufano

Aplicação React + Vite + TypeScript. Primeira entrega das fases de design system, dashboard e ilha dinâmica, com ferramentas locais adicionais. Não representa a conclusão das sete fases do produto.

## Executar

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

O dashboard é a rota `/`. Os painéis são trocados dentro da aplicação. O objetivo inicial reproduz os dados fornecidos pelo usuário: Polícia Civil do Tocantins, PC - TO 2027, cargo Polícia Civil, banca FGV e salário de R$ 7.917,97. São informações da referência, não uma confirmação de edital ou remuneração atual. O perfil e o objetivo são personalizáveis; todas as estatísticas começam em zero. A grade inicial contém as treze matérias da referência, nos três grupos solicitados. As metas são editáveis e não representam estudo realizado.

A primeira coluna contém três seções: **Objetivo** (brasão, instituição, concurso, cargo, banca e salário), **Matérias** (grupos expansíveis) e **Atalhos de estudo** no rodapé. O lápis abre o modal completo do objetivo. A data da prova continua editável no modal. O brasão dourado de PC-TO da imagem fornecida aparece como alternativa local quando nenhum resultado da API foi escolhido; não é apresentado como download validado de uma fonte externa.

## Marcadores dos cadernos

Antes de excluir uma folha, o modal informa seu título e número e oferece **Cancelar** e **Excluir folha**. Fechar o modal ou pressionar Escape cancela sem alterar as anotações; a animação só começa após confirmar.

Na barra de ferramentas, **Cadernos**, **Flashcards** e **Pet** são botões independentes, identificados por livro, cartões e pata. Cadernos abre a segunda coluna diretamente; Flashcards e Pet abrem a terceira coluna. O Pet mantém seu estado ao alternar as ferramentas e não possui mais um botão de abertura dentro da terceira coluna.

Cada folha de anotações possui uma lixeira no canto superior direito. Ao excluir, uma folha pautada fica visível por baixo, enquanto a folha removida se solta, dobra e se transforma em uma bolinha de papel com facetas e sombras. A bolinha cai para fora do caderno e desaparece; só então o conteúdo e o título são removidos, as folhas seguintes renumeradas e o sumário atualizado. `NotebookPageRemoval.tsx` e seu CSS Module concentram a bolinha vetorial e a queda. A navegação fica bloqueada durante esse efeito, que é reduzido para quem prefere menos movimento. O sumário é fixo e não pode ser excluído. Folhas em branco só entram no sumário após editar seu título ou conteúdo. A exclusão é salva automaticamente e não possui desfazer.

As folhas ficam acima dos marcadores na ordem de camadas, cobrindo qualquer parte que entre na área do papel. As pontas externas continuam visíveis e clicáveis, inclusive durante a expansão dos nomes.

O caderno aberto na segunda coluna tem um marcador vermelho do sumário à esquerda e uma aba colorida por matéria à direita. As abas ficam presas à borda externa das folhas, sem área de rolagem, e se expandem para fora da coluna ao passar o mouse ou receber foco pelo teclado. A largura expandida acompanha o nome completo do caderno, em uma linha, com espaço para a ponta da seta. `NotebooksPanel.module.css` concentra os estilos dos marcadores; `.centerToolPage`, em `App.module.css`, permite a sobreposição sobre as colunas vizinhas. As transições respeitam a preferência por movimento reduzido.

## Modal de configuração do objetivo

**Seu próximo objetivo** é uma janela ampla com menu lateral menor e área de configuração maior. O menu contém **Meu edital → Dados do objetivo / Grupos e matérias** e **Configuração → Perfil / Aparência / Seu ritmo**. Em telas pequenas, o menu vira uma faixa horizontal com rolagem e os campos ficam em uma coluna.

Os dados do objetivo e a grade permanecem em rascunho durante a navegação entre seções; **Salvar objetivo** aplica os dois juntos. Cancelar, Sair ou fechar descarta esse rascunho. Perfil, aparência e ritmo reutilizam os ajustes existentes e são salvos automaticamente, conforme o aviso exibido nessas páginas. Os campos/inputs reutilizados recebem prefixo `objective-settings` para não duplicar IDs com o painel de Configurações que eventualmente esteja aberto atrás do modal. Radix mantém foco, Escape e restauração do foco.

### Busca e download de brasões

Na seção **Dados do objetivo**, use **Buscar brasão via API**, confira os resultados e clique em **Usar este brasão**. A integração consulta a [API pública Imageinfo do Wikimedia Commons](https://www.mediawiki.org/wiki/API:Imageinfo) com busca de arquivos e [`origin=*` para CORS](https://www.mediawiki.org/wiki/API:Cross-site_requests), sem chave e sem cookies. `PC - TO` é expandido para `Polícia Civil Tocantins`. A busca é iniciada por ação explícita, não a cada tecla; TanStack Query mantém o resultado em cache por 15 minutos e não repete erros automaticamente.

Cada opção informa título, autor, licença e link da fonte. A API é um catálogo público, não uma garantia de identidade ou atualização do brasão; confirme a instituição e a versão antes de escolher. Documentos PDF/DjVu e URLs fora dos hosts Wikimedia esperados não entram nos resultados. As atribuições são exibidas como texto, sem executar HTML recebido.

Ao escolher uma imagem, o navegador tenta baixá-la. O blob permanece em rascunho até **Salvar objetivo**; então é salvo em `visualAssets/emblem` no IndexedDB, e os metadados ficam em `goal.emblem`. O resumo da primeira coluna passa a usar essa imagem. A cópia em cache é vinculada ao nome do arquivo para evitar mostrar o brasão de outro backup. Ao trocar o nome da instituição, a seleção anterior é limpa no rascunho.

Timeouts, falta de rede, resultados vazios e HTTP 429 são mostrados como erros, sem fingir que houve download. Não há garantia de cobertura para todas as instituições. Para PC-TO, o fallback local usa apenas um viewport/contorno SVG sobre a referência fornecida. Para outros órgãos sem imagem escolhida, aparece um placeholder identificado, sem brasão inventado. A consulta real da API retornou o arquivo `File:Pctocantins.jpg`; nesta sessão, a tentativa de download no servidor de imagens respondeu **429 Too Many Requests**. Por isso o download/cache de ponta a ponta ainda não foi validado.

### Atalhos personalizáveis

Os atalhos iniciais são Qconcursos, Gran Cursos, YouTube e Google Drive. O botão **+** abre a edição para adicionar, alterar nomes/endereços ou remover sites; salvar aplica a lista e cancelar preserva a anterior. Os endereços precisam usar HTTPS e abrem em outra aba. As alterações ficam no estado local e entram no backup JSON; a restauração valida os URLs e IDs antes de aplicar.

## Funcionalidades implementadas

- Material de vidro compartilhado, painéis neutros próximos da referência, temas claro/escuro/sistema, fundo de mesa de estudos e três fundos abstratos, redução de movimento e fallback sem backdrop-filter.
- Dashboard de três colunas; tablet em duas colunas; navegação entre painéis no celular, áreas seguras e Dock inferior.
- Objetivo editável, grupos expansíveis, matérias expansíveis com tópicos do edital, metas Q/H e indicadores derivados das sessões salvas.
- Calendário mensal, semanal e anual; planejamento por data, exclusão e reagendamento por arraste no desktop. O modo semanal mostra sete dias, sem grade horária.
- Cronômetro com pausas e persistência após recarga; conclusão exige resumo, questões e acertos válidos. Uma sessão concluída atualiza calendário, indicadores e gráficos.
- Pomodoro Three.js/R3F com corpo, folhas, escala e materiais, rotação vinculada ao tempo restante, ajuste por arraste e controle alternativo de duração acessível. Pausas de 5/15 minutos, quatro indicadores de ciclo e estado persistido. Não inicia ciclos automaticamente. A contagem Pomodoro não cria outra sessão; o registro estatístico usa exclusivamente a sessão de estudo. Ao acabar o foco, pausa a sessão ativa para não contar descanso. A geometria é uma aproximação inicial da referência, sem numeração 3D na escala.
- Cadernos por disciplina, editor TipTap com negrito, itálico e listas; gravação automática local. As capas têm perspectiva CSS.
- Flashcards com frente/verso em 3D, criação, exclusão e intervalos simples: Errei = 1 minuto; outras avaliações multiplicam o intervalo e agendam a próxima revisão. A fórmula é inicial, não FSRS/SM-2 completo.
- Biblioteca de áudio: permissão do microfone, gravar, pausar, retomar, salvar em IndexedDB, ouvir, renomear, pesquisar e excluir. Requer HTTPS ou localhost e MediaRecorder. Áudios são independentes das sessões nesta versão.
- Gráfico de distribuição de tempo/questões por disciplina, filtros dia/últimos sete dias/mês/ano, meta diária e sequência de dias. Simulados têm cadastro manual de resultados reais em Desempenho; o indicador usa a quantidade de registros, sem valores de demonstração.
- Reprodução de uma música local com play/pause e volume; exportação CSV de sessões; backup/restauração dos dados de estudo em JSON, sem arquivos de áudio.
- Cliente Supabase opcional para login/cadastro/e-mail, OAuth Google e solicitação de recuperação. Não há sincronização nem proteção de dados locais por conta nesta entrega.

## PET — companheira de estudos

A terceira coluna mantém foto, nome, questões, tempo e simulados acima do seletor de matérias e das abas **Pet / Tempo de estudo / Linha do tempo / Desempenho / Matérias**. O objetivo permanece na primeira coluna; uma edição concorrente que ocultou a linha do objetivo no perfil foi preservada. O minigame usa somente a área branca abaixo das abas, com cenário quadrado 1:1 e rolagem própria. As ferramentas do Dock, inclusive Pomodoro, abrem nessa mesma área e possuem botão de fechar. Depois de abertas, permanecem montadas quando ocultas para preservar seu estado; o cálculo do Pomodoro não foi alterado.

O pet começa como **Lufi, nível 1, zero moedas e zero XP**, com alimentação/felicidade/energia em 80. Clique/toque para fazer carinho. Os botões permitem iniciar estudo, alimentar, brincar, descansar e personalizar. O botão Estudar abre o seletor existente do Dock; nenhuma sessão fictícia é criada. Quando uma sessão real está em andamento, a lontrinha lê e acompanha o cronômetro principal; uma pausa interrompe a leitura. Encerrar a sessão continua exigindo o resumo e as questões do formulário original.

### Recompensas e créditos únicos

| Registro válido       | Moedas |  XP |
| --------------------- | -----: | --: |
| 10 minutos            |     10 |  10 |
| 25 minutos            |     30 |  30 |
| 50 minutos            |     65 |  65 |
| 60 minutos            |     80 |  80 |
| 10 questões           |     10 |   0 |
| Simulado registrado   |     50 |   0 |
| Meta diária alcançada |     40 |   0 |

O tempo usa uma **escada cumulativa por hora**, não a soma dos marcos sobrepostos. Aos 25 minutos, o total de tempo paga 30 moedas, não 10 + 30. Cada hora cheia vale 80; o restante usa os marcos 50/25 e blocos de 10 minutos. Minutos menores que um bloco acumulam para o próximo crédito. Questões também acumulam em blocos de dez. O tempo válido recupera 1 ponto de energia por dez minutos, limitado a 100.

Só sessões concluídas e simulados efetivamente registrados pelo usuário geram crédito. Deixar a aba aberta, carinho, café, brincadeira, compras e troca de ambiente não criam moedas ou XP. Ao abrir o app, registros antigos concluídos são conciliados uma vez; não há moeda de demonstração ou saldo inicial gratuito.

Novas sessões armazenam intervalos reais entre iniciar/retomar e pausar/encerrar. As recompensas unem os intervalos já pagos e consideram somente a parte inédita. Sessões antigas sem esses dados usam uma aproximação limitada ao tempo líquido salvo, pois as pausas antigas não podem ser reconstruídas. Questões de uma sessão parcialmente sobreposta são consideradas proporcionalmente à fração inédita do tempo; uma cópia totalmente sobreposta não paga questões novamente. A meta diária usa os segundos líquidos por data local, congela o alvo na primeira conciliação do dia e recebe um crédito único.

`petStates` e `petRewards` compartilham transações de leitura/validação/escrita no IndexedDB. Chaves únicas `study:{id}`, `mock:{id}` e `daily:{data}` impedem repetir a mesma origem após recarga ou chamadas concorrentes. Compras validam saldo dentro da transação; duas ações não podem gastar o mesmo saldo. Essa proteção vale para a origem/navegador local; não é um sistema antifraude de servidor ou sincronização entre dispositivos.

Em Personalizar, nome e regras de recompensa são editáveis. A tabela de tempo deve permanecer crescente; a alteração vale para créditos futuros, sem recalcular pagamentos passados. O nível depende exclusivamente de XP: nível 2 exige 100 XP, o próximo exige mais 200 e assim por diante. Comprar itens não aumenta o nível.

### Cuidados, cenas e inventário

- Alimentos: frutinha 10 moedas, peixe 20, sanduíche 35 (nível 2), especial 60 (nível 3). Recuperam alimentação/energia e são consumidos ao comprar.
- Brincar aumenta felicidade, custa oito de energia e tem intervalo de um minuto. Carinho aumenta um de felicidade, sem recompensa financeira. Café é uma reação visual gratuita, sem XP/moedas.
- Descansar recupera energia pelo tempo real decorrido; pause o estudo antes de usar. Alimentação diminui lentamente, felicidade tem piso de 20 e energia nunca fica negativa. A lontrinha nunca morre, desaparece nem impede estudar.
- Ambientes: quarto inicial; sala de estudos após 25 minutos válidos; biblioteca após duas horas válidas; jardim no nível 3. Setas e indicadores laterais permitem escolher ambientes e informam bloqueios.
- Acessórios: óculos (40 moedas, nível 1), fones (60, nível 2) e chapéu de formatura (100, nível 3). A compra é única; depois é possível equipar/remover sem novo gasto. São camadas separadas do corpo.

O registro de simulados fica em **Desempenho → Registrar simulado**, com nome, total e acertos. É entrada manual do usuário, não prova de realização emitida por um serviço externo. Esse módulo alimenta o contador e o crédito único de simulado; as questões dos simulados não são somadas novamente ao contador de questões das sessões.

### Arte, persistência e próximos passos

Os PNGs oficiais separados não foram fornecidos. A arte atual é um **substituto vetorial animado**, com lontrinha marrom/creme, quatro patas, duas orelhas e uma cauda; não é o PNG oficial da referência. Cenário, personagem, objeto segurado e acessórios ficam em camadas. O manifesto em `src/assets/pet/manifest.ts` detecta PNGs nas pastas pet/backgrounds/items/accessories, sem requisições quebradas quando os arquivos não existem. Os READMEs dessas pastas documentam nomes e âncoras. A arte oficial ainda precisa ser integrada e validada visualmente.

O progresso usa o mesmo banco local do app (`lufano-offline`, versão 3), com nome, XP, moedas, necessidades, cena, itens, equipamento, regras, intervalos pagos e histórico. O estado de estudos migra para a versão 7 e inclui planos, ciclos e textos pessoais. Recarregar não zera o pet. O backup JSON de estudos inclui sessões/simulados, mas **não** o progresso/ledger IndexedDB do pet; restaurar um backup não apaga o pet nem permite repetir os IDs já pagos. Limpar os dados do navegador remove esse progresso. Sincronização por usuário, exportação completa do pet e integração Supabase ficam para uma fase posterior.

O código usa SVG/CSS, IndexedDB e timestamps compatíveis com WebView/Capacitor. Não houve geração de APK, teste em dispositivo, revisão visual ou teste em duas abas reais; a concorrência foi exercitada com fake-indexeddb. Movimento reduzido usa as preferências globais existentes. Não foram adicionadas permissões nativas ou navegação Android antiga.

## Organização dos módulos

```text
src/
  components/
    Glass/         # primitivas de superfície, controles e modal Radix
    Goals/         # objetivo e disciplinas
    Calendar/      # visualizações e planejamento
    Performance/   # métricas, gráfico e música local
    Dock/          # sessão ativa e ilha de ferramentas
    Pomodoro/      # temporizador e cena 3D carregada sob demanda
    Tools/         # áudio, cadernos, flashcards e ajustes
  lib/             # tempo, IndexedDB e cliente Supabase
  store/           # estado Zustand persistido
  styles/          # tokens e regras base
  types.ts         # contratos de domínio
supabase/migrations/ # esquema PostgreSQL versionado com RLS
```

Cada componente tem CSS Module próprio. Notebooks/Flashcards/Audio compartilham `Tools.module.css`, com seletores distintos; os controles comuns usam `Glass.module.css`. Elementos estruturais e interativos relevantes têm IDs sem dados pessoais; o Radix gere os identificadores acessíveis do modal.

## Dados e privacidade

O estado de estudo usa `localStorage` (`lufano-study-v1`), o Pomodoro usa `lufano-pomodoro-v1` e os áudios usam Dexie/IndexedDB (`lufano-offline`). Evite usar o modo local em dispositivos compartilhados. Limpar dados do navegador remove os registros. Faça backups. Os dados não são enviados a um servidor por esta versão. O app não oferece ainda uma política LGPD completa nem exclusão de conta remota.

### Foto de perfil e plano de fundo

Abra a engrenagem do Dock. Em **Perfil**, use **Adicionar foto**; em **Aparência**, use **Adicionar plano de fundo**. São aceitos JPG, PNG e WebP de até 10 MB. Cada campo possui prévia, validação, mensagens de erro/sucesso e remoção. A foto é aplicada ao avatar circular, e o fundo cobre a janela com desfoque leve para manter os painéis legíveis. A substituição aparece nos componentes abertos sem recarregar a página.

As imagens são salvas como blobs em `visualAssets`, na versão 2 do IndexedDB `lufano-offline`; não ficam no localStorage nem são enviadas ao Supabase. A mesma tabela também guarda o brasão escolhido (`emblem`). A atualização preserva a tabela de gravações. Remover a foto restaura as iniciais; remover o fundo personalizado restaura o fundo selecionado. A imagem personalizada tem prioridade sobre as quatro opções padrão. O backup JSON/CSV não inclui os blobs de fotos, fundos, brasões ou áudios; mantenha os arquivos originais. Os metadados de origem do brasão entram no backup JSON e podem exigir novo acesso à internet após restauração.

O fundo inicial de mesa de estudos é uma [fotografia de Michelle Mac no Unsplash](https://unsplash.com/photos/a-pink-notebook-and-a-calculator-on-a-table-qUH8UyooT6c), salva em `public/images/study-desk-wallpaper.jpg`. É uma imagem de ambiente; a foto pessoal da referência não é usada como foto do usuário.

A composição foi simplificada para três painéis maiores, calendário com mês centralizado, botões anterior/próximo e Dock largo em cápsula. O gráfico de distribuição usa pizza com dados reais, ou um estado neutro quando não há registros. O layout desktop usa a altura da janela com rolagem nos painéis laterais; tablet/celular mantêm as adaptações de navegação e áreas seguras.

Persistência local não equivale a PWA offline: após carregar, as ferramentas não dependem de rede, mas ainda não há cache de assets para abrir o app offline pela primeira vez.

## Banco de dados Supabase

O esquema PostgreSQL versionado cobre objetivos, grupos, matérias, tópicos, sessões, agenda, metas, ciclo, cadernos, flashcards, áudio, perfil, atalhos e PET. A migração inicial ainda não foi aplicada remotamente. RLS e as políticas do bucket privado limitam o acesso ao usuário autenticado.

Para criar o banco, siga [supabase/README.md](supabase/README.md): crie o projeto, associe a CLI com `supabase link`, revise o destino e aplique `npx supabase db push`. Configure as duas variáveis de `.env.example` para habilitar Auth. Nunca exponha `service_role`/secret no cliente.

**Importante:** aplicar o esquema não migra os registros atuais do navegador. Estudos, imagens, áudios e PET ainda não sincronizam com as tabelas/bucket; continuam locais. Faça backup pelo app antes de qualquer transição. Não apliquei a migração nem enviei dados para um projeto remoto.
## Android

O Capacitor está configurado com `br.com.lufano.espacodeestudo` e `webDir: dist`. Com Android Studio/JDK/SDK instalados:

```powershell
npm.cmd run build
npx.cmd cap add android
npm.cmd run android:sync
npm.cmd run android:open
```

O projeto nativo, APK e AAB não foram gerados nesta entrega. As permissões nativas de microfone, notificações, arquivos, deep links OAuth e ciclo de vida precisam ser implementadas/testadas no dispositivo. O timer usa timestamps para compensar atrasos em segundo plano; isso não garante execução de alarmes com o app encerrado.

## Próximas fases

1. Múltiplos objetivos, OCR e backend de extração assistida para editais complexos, com revisão humana.
2. Onboarding completo, rotas protegidas, recuperação completa de senha e sincronização por usuário com fila offline e resolução de conflitos.
3. Histórico editável das sessões e associação de áudios, resumos e assuntos ao calendário.
4. Planejador automático revisável, simulados, relatórios PDF, períodos personalizados e demais gráficos.
5. Editor com imagens/tabelas/fórmulas, páginas de caderno, revisão espaçada com histórico detalhado.
6. Sons e notificações Pomodoro, numeração realista e refinamento do tomate, preferências avançadas de vidro/fundo personalizado.
7. Integração e validação Android, PWA, política de privacidade e fluxos LGPD.

Radix fornece o comportamento acessível dos modais. A camada Glass é própria, seguindo composição semelhante ao shadcn/ui; componentes shadcn não foram gerados por CLI. TanStack Query está preparado no provider, mas não simula consultas sem backend. PDF.js lê texto selecionável de arquivos fornecidos no editor do objetivo, inteiramente no navegador e sob demanda.

## Grupos, matérias e conteúdo do edital

A seção **Matérias** da primeira coluna contém **Disciplinas Básicas e Gerais**, **Noções de Direito** e **Conhecimentos Específicos e Locais**. Abra um grupo para consultar as matérias; abra uma matéria para consultar seus tópicos e indicadores reais. A coluna Dedicação mostra as metas configuradas de questões e horas, não resultados fictícios.

Em **Seu próximo objetivo**, é possível criar, renomear e remover grupos; criar, renomear, remover e mover matérias entre grupos; editar metas de questões/horas; e editar tópicos. A remoção de um grupo pede confirmação dentro do formulário. As remoções ficam em rascunho até salvar e não apagam os estudos anteriores. Uma matéria com sessão ativa só pode ser removida após o encerramento. Cancelar ou fechar descarta o rascunho. É necessário manter pelo menos um grupo e uma matéria; grupos não podem ter nomes vazios ou repetidos.

Cada matéria tem **Conteúdo programático do edital**, **Carregar texto do PDF**, **Extrair tópicos** e **Tópicos para revisar**. Cole o trecho da matéria ou carregue um PDF com texto selecionável (até 20 MB e 300 páginas). O leitor traz o texto do documento; mantenha apenas o trecho desejado no campo antes de extrair. Não há separação automática de todas as matérias de um edital completo nem OCR de arquivos escaneados. Nenhum documento é enviado a um servidor.

A extração identifica enumerações como `1.`, `2)` e `1.1`, junta quebras de linha dentro do item e preserva listas internas. Sem numeração, considera cada linha um tópico. Remova cabeçalhos/rodapés e revise o resultado; a extração é determinística, não um serviço de IA. Os tópicos podem ser corrigidos manualmente, um por linha, antes de salvar. O exemplo de Língua Portuguesa fornecido no pedido contém nove tópicos e está na grade inicial. Os tópicos salvos também ficam disponíveis no seletor de assunto da sessão de estudo.

A persistência de estudos está na versão 7. A versão 6 acrescentou textos e ciclos; a versão 7 adicionou metas semanais/mensais. A versão 2 agrupou matérias antigas sem trocar IDs; a versão 3 trocou o fundo padrão; a versão 4 adicionou atalhos, e a versão 5 acrescenta simulados e mantém compatibilidade com sessões sem intervalos detalhados. Conteúdos personalizados, IDs e históricos são preservados. Matérias não reconhecidas ficam em Outras matérias. Backups antigos são normalizados na restauração, sem apagar o progresso separado do pet.

## Estado de publicação

Há uma identidade privada registrada em `.openai/hosting.json`, ainda sem versão publicada. A sincronização do código para o repositório privado do Sites foi bloqueada pela revisão automática de permissões, que exige autorização explícita do usuário para enviar esse código ao serviço. Não há URL de produção validada. Isso não afeta o funcionamento local.

## Validação da entrega

`npm run lint` executa a checagem estrita de TypeScript, incluindo imports e parâmetros não utilizados; não é ESLint. A suíte tem 28 testes: inclui cronômetros, texto do edital, grupos, atalhos, API de brasões e as novas regras do pet. Os testes com fake-indexeddb cobrem créditos concorrentes, reabertura do banco, sobreposição, meta diária única, simulado único e compras sem gasto duplicado. fake-indexeddb foi acrescentado apenas como dependência de desenvolvimento. O build Vite passa com os avisos anteriores de tamanho de chunks; os testes não equivalem à validação visual ou a duas abas reais.

A página local respondeu HTTP 200. A revisão visual no Chrome foi interrompida porque a ferramenta de controle não conseguiu determinar a URL atual com segurança. Fluxos visuais, microfone real, arraste, larguras responsivas, autenticação remota, RLS no banco, sincronização e Android não foram validados de ponta a ponta. Consulte `docs/IMPLEMENTATION.md` para o relatório individual dos arquivos.

## Referências

- [Apple — linguagem Liquid Glass](https://www.apple.com/br/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)
- [FreeFrontend — controles de abas](https://freefrontend.com/css-tabs/)
- Imagens fornecidas no pedido: composição de três colunas e temporizador físico. Não são usadas como dados pessoais ou ativos extraídos da captura.

## Navegação e PET — atualização atual

O cabeçalho oferece Início, Atividades, Planejamento, Ciclo de estudos, Acompanhamento e Blog, com rotas hash compatíveis com hospedagem estática. Atividades e acompanhamento usam registros reais; planejamento compartilha o calendário. Ciclos editáveis e textos do Blog são persistidos localmente e incluídos no backup (estado versão 6). Salvar no Blog não publica na internet.

O botão de pata abre o PET em toda a terceira coluna, ocultando temporariamente perfil e indicadores. Fechar restaura o painel. Esta descrição substitui o comportamento anterior em que o PET ficava abaixo do perfil. A frase “Estudando para…” continua removida conforme preferência do usuário.

O primeiro ícone do Dock abre o formulário para iniciar estudo ou os controles da sessão em andamento, com pausa/retomada e encerramento explícito. Matérias sem tópicos permitem “Estudo geral”, sem criar conteúdo fictício de edital. A sessão permanece montada ao navegar entre páginas.

Validação: 31 testes, TypeScript e build aprovados; build mantém aviso de chunks grandes. Servidor local responde HTTP 200. Verificação visual pendente por indisponibilidade do host do navegador. Consulte `docs/IMPLEMENTATION.md` para o relatório por arquivo.

## Apresentação do painel — revisão visual

A barra inferior usa ícones escuros sobre fundo cinza: iniciar, microfone, tomate, livro e engrenagem. A terceira coluna inicia em Tempo de estudo, com pizza anual, agrupamento por matérias ou tópicos e navegação entre anos. Ausência de registros é indicada sem dados fictícios. O Pomodoro usa um tomate SVG com rosto, botão circular e tempo em vermelho; modos, reinício e duração ficam em Ajustar Pomodoro. Perfil é preservado acima da ferramenta, e o PET continua abrindo a coluna inteira.

## Acesso à conta no cabeçalho

O cabeçalho mostra Entrar e Criar conta quando não há sessão autenticada, ou o e-mail conectado e Sair quando existe uma sessão Supabase. O formulário compartilhado com Configurações oferece login por e-mail, cadastro, login do Google e recuperação de senha. Para ativar, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`; sem essa configuração, o modal explica que a conta online está indisponível. O login ainda não sincroniza nem separa os estudos locais por usuário.
# ambiente_lufano
