# Documentação técnica — Pratica.dev 2.0

## 1. Visão geral

O Pratica.dev é uma aplicação web de página única (SPA) voltada à formação técnica. A interface apresenta autenticação, trilhas de carreira, conteúdos, quiz de nivelamento, exercícios, projetos, certificados, portfólio e um painel administrativo.

O frontend é servido como arquivos estáticos pelo GitHub Pages. A camada de backend é o Supabase: Supabase Auth gerencia identidades e PostgreSQL armazena perfis e progresso. O navegador usa apenas a chave publicável e acessa o banco por REST/RPC; não existe chave secreta no repositório.

## 2. Arquitetura

```text
Navegador
  ├── index.html + style.css + script.js
  ├── Supabase JS v2 (CDN)
  └── HTTPS
        └── Supabase
             ├── Auth (auth.users)
             ├── PostgreSQL (public.*)
             ├── RLS (autorização por usuário/admin)
             ├── RPC PostgreSQL (regras de XP atômicas)
             └── Storage (bucket privado "avatars", com políticas próprias)
```

### Componentes do frontend

- `index.html`: marcação da página inicial (landing), login, dashboard, estudos, certificados, projetos, portfólio e administração.
- `style.css`: tema visual, diploma e componentes que não são cobertos pelo Tailwind.
- `script.js`: estado da sessão, eventos, renderização, certificado visual e chamadas de negócio.
- `supabase.js`: inicialização do cliente Supabase e funções de acesso ao backend.

Não há dependências locais nem transpiler. Os scripts são carregados na ordem: biblioteca Supabase, `supabase.js` e `script.js`.

## 3. Modelo de dados

| Tabela | Finalidade | Chave/relacionamentos |
|---|---|---|
| `profiles` | dados acadêmicos, XP, papel administrativo, visibilidade do portfólio (`portfolio_public`) e caminho da foto (`avatar_url`) | `id` referencia `auth.users` |
| `quiz_answers` | três respostas do nivelamento | `user_id` → `profiles`; único por pergunta |
| `projects` | catálogo dos nove projetos | `id` é a chave do catálogo |
| `subject_progress` | matérias visualizadas | chave composta `user_id + subject_id` |
| `user_projects` | projetos concluídos | `user_id + project_id` |
| `certificates` | exercícios concluídos e certificados emitidos | único por usuário e matéria |

Fora das tabelas, o Supabase Storage tem o bucket privado `avatars`, que guarda as fotos de perfil em `avatars/<id do usuário>/avatar.jpg|png`; `profiles.avatar_url` registra o caminho do arquivo de cada aluno.

O diagrama lógico é:

```text
auth.users 1──1 profiles 1──N quiz_answers
                         1──N subject_progress
                         1──N certificates
                         1──N user_projects N──1 projects
```

O script completo, incluindo carga inicial do catálogo, está em [`database/schema.sql`](../database/schema.sql).

## 4. Fluxos principais

### Cadastro e login

1. Quem chega sem sessão vê a página inicial (landing) apresentando a plataforma; os botões Entrar e Cadastrar abrem as telas de autenticação e o logout volta para a landing. A rota `#publico/<id>` não passa pela landing.
2. `supabaseRegister` chama `auth.signUp`.
3. O trigger `on_auth_user_created` cria um perfil mínimo.
4. O frontend faz `upsert` dos campos informados pelo aluno.
5. Login usa `signInWithPassword` e recupera o perfil por `fetchProfile`.
6. A sessão existente é restaurada por `getSession` durante a inicialização.

### XP e progresso

XP nunca é calculado pelo JavaScript. As ações chamam funções PostgreSQL:

- `award_quiz_xp`: registra respostas, trilha e objetivo e adiciona 50 XP;
- `award_subject_view_xp`: registra a primeira visualização e adiciona 10 XP;
- `award_exercise_xp`: emite um certificado e adiciona 30 XP apenas uma vez;
- `award_project_xp`: registra o projeto e usa a recompensa do catálogo.

Cada função usa uma chave única para impedir que a mesma atividade seja repetida para farmar XP. O nível é recalculado no servidor pela função `recalculate_level`.

### Certificado visual

O registro em `certificates` continua sendo a fonte da verdade. O frontend apenas desenha um diploma em canvas a partir desses dados: nome do aluno, módulo, data, trilha, nível, XP e um código de verificação determinístico. O diploma pode ser aberto no perfil, na aba Certificados, no portfólio, no painel administrativo e automaticamente após concluir um exercício. Há ações de baixar PNG e imprimir/salvar PDF. A tela de login oferece um modelo identificado como MODELO para avaliação, sem gravar nada no banco.

### Administração

`is_admin` controla a exibição do painel no cliente, mas não é a proteção real. As políticas RLS e as funções `admin_reset_xp` e `admin_delete_student` verificam o papel no banco. A lista de alunos permite consulta administrativa; detalhes combinam perfil, respostas, projetos e certificados.

### Portfólio público

Cada aluno pode publicar ou tornar privado o portfólio na aba Portfólio, alternando a coluna `profiles.portfolio_public` (só o dono do perfil consegue, via RLS). Publicado, a aba mostra o link no formato `https://joaocaetano19.github.io/TCC/#publico/<id>` com um botão de copiar.

A rota `#publico/<id>` abre uma visão pública que **não exige login**: o frontend usa a chave anon para ler apenas:

- `profiles` — somente as colunas `id, name, track, goal, level, xp, portfolio_public` (grant por coluna para o papel anon; `email`, `age` e `is_admin` não são concedidos nem solicitados);
- `user_projects` — projetos concluídos, com nome/nível/descrição vindos do catálogo `projects`;
- `certificates` — `subject_id, title, issued_at` para montar as habilidades e os diplomas visuais.

As políticas `profiles_public_read`, `user_projects_public_read` e `certificates_public_read` liberam a leitura anônima apenas de quem tem `portfolio_public = true`. Perfil inexistente e perfil privado aparecem como a mesma mensagem ("não existe ou está privado"), evitando vazar quais identificadores existem no banco. O bloco incremental aplicado no Supabase está documentado no final de `database/schema.sql`.

### Foto de perfil (avatar)

1. Na aba Perfil, **Alterar foto** abre o seletor de arquivos; o frontend aceita apenas JPG/PNG de até 2 MB e bloqueia o restante antes de qualquer envio.
2. Um arquivo válido abre uma **prévia** (URL temporária `blob:` gerada localmente) com botões de salvar ou cancelar — nada é enviado sem confirmação.
3. Ao salvar, `uploadAvatar` envia o arquivo para o bucket privado `avatars` no caminho `<id do usuário>/avatar.jpg|png` e grava esse caminho em `profiles.avatar_url`. **Remover foto** apaga o arquivo do Storage e limpa a coluna (com confirmação no modal do tema).
4. Toda exibição usa **URL assinada** (`createSignedUrl`, validade de 1h), renovada no boot, ao salvar/remover e ao carregar a visão pública. Se a assinatura falhar ou não houver foto, a interface cai no fallback da bolinha com a inicial — no topo (dashboard), na aba Perfil, na aba Portfólio e na rota `#publico/<id>`.
5. A privacidade é a mesma do portfólio: o bucket é privado (`public = false`, sem URL pública) e as políticas do Storage consultam `profiles.portfolio_public` — o papel `anon` só consegue assinar a URL da foto de quem publicou o portfólio; perfil privado nunca expõe a foto. O dono faz upload/update/delete apenas na própria pasta, conferido pelo primeiro segmento do caminho (`storage.foldername(name))[1] = auth.uid()`).

O bloco incremental correspondente (coluna `avatar_url`, grant da coluna ao `anon`, criação do bucket com limite de 2 MB e MIME restrito, e as cinco políticas de `storage.objects`) está no final de `database/schema.sql` e pode ser aplicado diretamente com [`database/migracao-portfolio-avatar.sql`](../database/migracao-portfolio-avatar.sql).

## 5. Segurança

- RLS está habilitado em todas as tabelas públicas.
- Um aluno só lê seu perfil, suas respostas, progresso, projetos e certificados.
- Catálogo de projetos pode ser lido publicamente.
- A leitura anônima do portfólio público libera só as linhas de quem publicou e só as colunas autorizadas — `email`, `age` e `is_admin` não são concedidas ao papel anon.
- O bucket `avatars` é privado: nenhuma foto tem URL pública e as políticas de `storage.objects` liberam a leitura anônima somente de fotos cujo dono publicou o portfólio (mesma regra de `portfolio_public`); a escrita é restrita à pasta do próprio usuário.
- O upload de avatar é validado duas vezes: tipo e tamanho no cliente e limite de 2 MB/MIME (JPG/PNG) na configuração do bucket. URLs assinadas nunca são concatenadas no HTML sem escape, e a expiração ou falha delas degrada para o avatar de inicial sem quebrar as telas.
- Alterações de XP, nível e papel administrativo são protegidas por trigger/RPC.
- Funções privilegiadas revalidam `auth.uid()` e `is_admin` no banco.
- A chave `service_role` não deve ser usada no frontend.
- Exclusão acadêmica não exclui a identidade em `auth.users`, porque isso exigiria a Admin API em um ambiente seguro.

## 6. Instalação e configuração

1. Crie um projeto Supabase.
2. Execute `database/schema.sql` no SQL Editor. Se o banco já existia, execute também `database/correcao-xp.sql` e `database/migracao-portfolio-avatar.sql`.
3. Ajuste `SUPABASE_URL` e `SUPABASE_ANON` em `supabase.js` quando necessário.
4. Sirva a raiz com `python3 -m http.server 8080`.
5. Abra `http://localhost:8080` e faça um cadastro.
6. Promova o usuário administrador via SQL, conforme o README.

Para testar o frontend sem um banco configurado, a tela inicial pode ser aberta, mas cadastro, login e conteúdo persistido exigem uma instância Supabase válida.

## 7. Publicação e operação

O GitHub Pages publica a raiz da branch `main` em:

<https://joaocaetano19.github.io/TCC/>

Após um push, aguarde a conclusão do build do Pages e valide login, cadastro, quiz e uma ação de XP. Em produção, revise também as URLs permitidas em **Authentication → URL Configuration** no Supabase.

## 8. Manutenção

- Alterações de banco devem ser feitas primeiro em uma instância de teste e depois refletidas em `database/schema.sql`.
- Mudanças de campos consumidos no JS devem atualizar o SQL e esta documentação na mesma alteração.
- Não versionar senhas, tokens privados, dumps de usuários ou a chave `service_role`.
- O catálogo inicial em `projects` é idempotente e pode ser reaplicado.
