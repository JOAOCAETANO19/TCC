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
             └── RPC PostgreSQL (regras de XP atômicas)
```

### Componentes do frontend

- `index.html`: marcação das telas de login, dashboard, estudos, projetos, portfólio e administração.
- `style.css`: tema visual e componentes que não são cobertos pelo Tailwind.
- `script.js`: estado da sessão, eventos, renderização e chamadas de negócio.
- `supabase.js`: inicialização do cliente Supabase e funções de acesso ao backend.

Não há dependências locais nem transpiler. Os scripts são carregados na ordem: biblioteca Supabase, `supabase.js` e `script.js`.

## 3. Modelo de dados

| Tabela | Finalidade | Chave/relacionamentos |
|---|---|---|
| `profiles` | dados acadêmicos, XP e papel administrativo | `id` referencia `auth.users` |
| `quiz_answers` | três respostas do nivelamento | `user_id` → `profiles`; único por pergunta |
| `projects` | catálogo dos nove projetos | `id` é a chave do catálogo |
| `subject_progress` | matérias visualizadas | chave composta `user_id + subject_id` |
| `user_projects` | projetos concluídos | `user_id + project_id` |
| `certificates` | exercícios concluídos e certificados emitidos | único por usuário e matéria |

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

1. `supabaseRegister` chama `auth.signUp`.
2. O trigger `on_auth_user_created` cria um perfil mínimo.
3. O frontend faz `upsert` dos campos informados pelo aluno.
4. Login usa `signInWithPassword` e recupera o perfil por `fetchProfile`.
5. A sessão existente é restaurada por `getSession` durante a inicialização.

### XP e progresso

XP nunca é calculado pelo JavaScript. As ações chamam funções PostgreSQL:

- `award_quiz_xp`: registra respostas, trilha e objetivo e adiciona 50 XP;
- `award_subject_view_xp`: registra a primeira visualização e adiciona 10 XP;
- `award_exercise_xp`: emite um certificado e adiciona 30 XP apenas uma vez;
- `award_project_xp`: registra o projeto e usa a recompensa do catálogo.

Cada função usa uma chave única para impedir que a mesma atividade seja repetida para farmar XP. O nível é recalculado no servidor pela função `recalculate_level`.

### Administração

`is_admin` controla a exibição do painel no cliente, mas não é a proteção real. As políticas RLS e as funções `admin_reset_xp` e `admin_delete_student` verificam o papel no banco. A lista de alunos permite consulta administrativa; detalhes combinam perfil, respostas, projetos e certificados.

## 5. Segurança

- RLS está habilitado em todas as tabelas públicas.
- Um aluno só lê seu perfil, suas respostas, progresso, projetos e certificados.
- Catálogo de projetos pode ser lido publicamente.
- Alterações de XP, nível e papel administrativo são protegidas por trigger/RPC.
- Funções privilegiadas revalidam `auth.uid()` e `is_admin` no banco.
- A chave `service_role` não deve ser usada no frontend.
- Exclusão acadêmica não exclui a identidade em `auth.users`, porque isso exigiria a Admin API em um ambiente seguro.

## 6. Instalação e configuração

1. Crie um projeto Supabase.
2. Execute `database/schema.sql` no SQL Editor.
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
