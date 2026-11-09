# Banco Supabase do Espaço de Estudo Lufano

O esquema PostgreSQL fica versionado em `migrations/`. A migração inicial representa o modelo atual: objetivo, grupos, matérias e tópicos; sessões e pausas; agenda, metas e ciclo; cadernos, flashcards, gravações e textos; perfil, atalhos e estado do PET. A migração também cria o bucket privado `study-files`.

## Criar ou ligar um projeto Supabase

1. Crie um projeto no painel Supabase e guarde a senha do banco em um gerenciador de senhas.
2. Instale/execute a CLI Supabase com um método oficial compatível com seu sistema. O arquivo `supabase/config.toml` já está preparado; não rode `supabase init` sobre ele.
3. Na pasta `lufano`, autentique a CLI e associe o identificador do projeto:

   ```powershell
   npx supabase login
   npx supabase link --project-ref SEU_PROJECT_REF
   ```

4. Confira o projeto e as migrações vinculadas antes de alterar o banco. A migração `202611080001_initial.sql` deve ser aplicada somente em um projeto vazio. Para enviar:

   ```powershell
   npx supabase db push
   ```

5. No painel do projeto, configure e-mail e, se desejar, Google em **Authentication → Providers**. Cadastre também a URL publicada e `http://localhost:5173` em **Authentication → URL Configuration** (ajuste a URL local à porta que usar).
6. Copie `.env.example` para `.env.local` e preencha a URL e a chave pública `anon` do projeto. Reinicie o servidor Vite. Nunca coloque a chave `service_role`/secret no frontend.
7. Para gerar tipos depois de aplicar o esquema:

   ```powershell
   npx supabase gen types typescript --linked --schema public > src/lib/database.types.ts
   ```

   Revise o arquivo gerado e versiona-o junto das migrações quando o cliente começar a consultar diretamente as tabelas.

## Dados e limites atuais

RLS é habilitado nas tabelas expostas. Cada linha exige `auth.uid() = user_id` (ou `id` em `profiles`); chaves estrangeiras compostas impedem associar registros a matérias de outra conta. Arquivos usam bucket privado e pastas iniciadas pelo UUID do usuário.

A aplicação já oferece cadastro e login Supabase, mas os registros do Zustand/localStorage, imagens e áudio ainda não são enviados ou sincronizados pelo cliente. O esquema está pronto para hospedar os registros; aplicar a migração sozinho não migra nem sincroniza dados existentes. Use Backup dos dados de estudo para exportar antes de mudanças na máquina. O PET e os arquivos binários permanecem em IndexedDB até uma integração de armazenamento e sincronização ser construída.

Esta migração substitui o rascunho anterior, que estava documentado como não aplicado. Se você já a executou manualmente ou o projeto remoto contém tabelas, faça backup e compare o esquema/histórico antes de aplicar; não apague tabelas para resolver divergências.

Comandos oficiais e referências: [migrações de banco](https://supabase.com/docs/guides/deployment/database-migrations), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [geração de tipos](https://supabase.com/docs/guides/api/rest/generating-types).