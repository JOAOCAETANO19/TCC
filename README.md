# Pratica.dev 2.0

Plataforma educacional gamificada para estudantes de desenvolvimento de sistemas. O aluno cria uma conta, responde a um quiz de nivelamento, estuda conteúdos, conclui exercícios e projetos e acompanha XP, certificados e portfólio. O Supabase fornece autenticação, persistência e as regras de segurança do backend.

## Acessos para avaliação

- **Repositório (Frontend + integração Backend):** [github.com/JOAOCAETANO19/TCC](https://github.com/JOAOCAETANO19/TCC)
- **Sistema publicado no GitHub Pages:** [joaocaetano19.github.io/TCC](https://joaocaetano19.github.io/TCC/)
- **Scripts do banco de dados:** [`database/schema.sql`](database/schema.sql)
- **Documentação técnica:** [`docs/documentacao-tecnica.md`](docs/documentacao-tecnica.md)

> A aplicação é uma SPA estática. O backend é consumido pelo cliente por meio do Supabase; por isso, não há um servidor Node separado neste repositório.

## Tecnologias

- HTML5, CSS3 e JavaScript (ES2020+), sem etapa de build;
- Tailwind CSS via CDN e Lucide Icons;
- Supabase JS v2 via CDN (Auth, PostgreSQL, RLS e RPC);
- GitHub Pages para publicação.

## Execução local

### Pré-requisitos

- Git;
- um navegador moderno;
- Python 3 (ou outro servidor HTTP estático);
- um projeto Supabase configurado com o script `database/schema.sql`.

### Passo a passo

```bash
git clone https://github.com/JOAOCAETANO19/TCC.git
cd TCC
python3 -m http.server 8080
```

Abra `http://localhost:8080`. Não abra `index.html` diretamente com `file://`, pois o navegador pode bloquear requisições de autenticação.

As credenciais públicas do projeto Supabase ficam em `supabase.js`. A chave usada pelo frontend é a chave publicável/anon; ela não substitui as políticas RLS. Nunca coloque uma chave `service_role` no frontend.

## Configuração do banco

1. Crie um projeto no [Supabase](https://supabase.com).
2. Abra **SQL Editor** e execute [`database/schema.sql`](database/schema.sql) inteiro.
3. Copie a URL e a chave publicável em **Settings → API** para `SUPABASE_URL` e `SUPABASE_ANON` em `supabase.js`, se estiver usando outro projeto.
4. Cadastre o primeiro usuário pela tela de registro.
5. Para conceder acesso administrativo, execute no SQL Editor, substituindo o e-mail:

```sql
update public.profiles
set is_admin = true
where email = 'administrador@exemplo.com';
```

O script é idempotente para uma instalação nova e inclui tabelas, dados iniciais, índices, RLS, triggers e funções RPC utilizadas pela aplicação.

## Estrutura

```text
index.html       interface e telas da aplicação
style.css        estilos complementares
script.js        estado, renderização e regras de interação do frontend
supabase.js      cliente Supabase e chamadas ao backend
 database/
   schema.sql     esquema, políticas e funções PostgreSQL
 docs/
   documentacao-tecnica.md
```

## Publicação

O site é publicado pelo GitHub Pages a partir da raiz da branch `main`. Para publicar uma atualização, faça push para o repositório e aguarde a execução do workflow/configuração do Pages. O endereço público está listado acima.

## Segurança e limitações conhecidas

A chave publicável do Supabase pode aparecer no navegador; a proteção dos dados depende das políticas RLS e das funções `SECURITY DEFINER` do banco. A conta de login do Supabase Auth só pode ser removida com a Admin API e, portanto, a exclusão de aluno no painel remove os dados acadêmicos, não a identidade Auth.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
