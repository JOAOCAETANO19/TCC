# Pratica.dev 2.0

Plataforma educacional gamificada para estudantes de desenvolvimento de sistemas. O aluno cria uma conta, responde a um quiz de nivelamento, estuda conteúdos, conclui exercícios e projetos e acompanha XP, certificados e portfólio. O Supabase fornece autenticação, persistência e as regras de segurança do backend.

## Acessos para avaliação

- **Repositório (Frontend + integração Backend):** [github.com/JOAOCAETANO19/TCC](https://github.com/JOAOCAETANO19/TCC)
- **Sistema publicado no GitHub Pages:** [joaocaetano19.github.io/TCC](https://joaocaetano19.github.io/TCC/)
- **Modelo do certificado visual:** na tela de login, use **Ver modelo do certificado visual** (não grava dados no banco)
- **Briefing dos projetos:** aba **Projetos** → botão **Ver briefing** em qualquer card
- **Menu mobile:** abra o sistema em uma tela de até 768px e use o botão de menu no topo
- **Portfólio público:** na aba **Portfólio**, use **Publicar portfólio** e compartilhe o link `https://joaocaetano19.github.io/TCC/#publico/<id>` — ele abre a visão pública do portfólio sem exigir login
- **Foto de perfil:** na aba **Perfil**, use **Alterar foto** (JPG ou PNG, até 2 MB), confira a prévia e salve; a foto aparece no topo, no portfólio e na visão pública — visitantes anônimos só a veem se o portfólio estiver público
- **Scripts do banco de dados:** [`database/schema.sql`](database/schema.sql)
- **Documentação técnica:** [`docs/documentacao-tecnica.md`](docs/documentacao-tecnica.md)

> A aplicação é uma SPA estática. O backend é consumido pelo cliente por meio do Supabase; por isso, não há um servidor Node separado neste repositório.

## Recursos da interface

- **Quiz de nivelamento com "Meu nivelamento":** no primeiro acesso o aluno responde 3 perguntas (nível atual, área de interesse e objetivo profissional); as respostas ficam visíveis no card **Meu nivelamento** da aba **Perfil**. Contas antigas seguem funcionando normalmente, sem repetir o quiz;
- **Centro de Estudos ampliado:** as 12 matérias ganham nível e tempo estimado, seção **Erros comuns**, **Para se aprofundar** (com links externos) e um **teste rápido de conhecimento** de 3 perguntas com correção na hora (só no cliente). O painel mostra o progresso com o contador **"X de 12"**, o selo **✓** nas matérias já estudadas e a **trilha recomendada** pela área do quiz, com o destaque **"Comece por aqui"** na próxima matéria da sequência;
- **Certificado visual:** diploma renderizado em canvas, com download em PNG e impressão em PDF;
- **Briefing de projetos:** cada um dos 9 projetos práticos abre um briefing no formato usado no mercado, com contexto do cliente, tecnologias sugeridas, requisitos funcionais, entregáveis e critérios de aceite;
- **Menu mobile:** em telas de até 768px a barra lateral vira uma gaveta acionada pelo botão de menu, com fundo escurecido, fechamento pelo `Esc`, por clique fora e ao escolher uma aba;
- **Portfólio digital:** reúne XP, projetos concluídos e certificados do aluno;
- **Portfólio público:** o aluno publica ou torna privado o portfólio na aba Portfólio e copia o link `#publico/<id>`, que abre uma visão pública sem login com apenas os dados autorizados;
- **Foto de perfil (avatar):** upload com validação de formato (JPG/PNG) e tamanho (máx. 2 MB), prévia antes de salvar e opção de remover; armazenada em bucket privado do Supabase Storage, exibida por URL assinada e protegida pelas mesmas regras de privacidade do portfólio — sem foto, a bolinha com a inicial do nome continua em uso.

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

O script é idempotente para uma instalação nova e inclui tabelas, dados iniciais, índices, RLS, triggers, funções RPC e o bucket de Storage utilizados pela aplicação. Para uma instalação existente, execute:

- [`database/correcao-xp.sql`](database/correcao-xp.sql), para corrigir as funções de premiação do XP;
- [`database/migracao-portfolio-avatar.sql`](database/migracao-portfolio-avatar.sql), para aplicar as colunas, políticas do portfólio público e o bucket privado `avatars`.

Os dois arquivos incrementais são idempotentes. Os mesmos blocos também estão no final de `database/schema.sql`, para instalações que preferirem reaplicar o script completo.

## Estrutura

```text
index.html       interface e telas da aplicação
style.css        estilos complementares, diploma visual, menu mobile e briefing
script.js        estado, renderização, certificado visual, briefing e regras de interação
supabase.js      cliente Supabase e chamadas ao backend
 database/
   schema.sql     esquema, políticas e funções PostgreSQL
 docs/
   documentacao-tecnica.md
```

## Testes

Os testes usam [jsdom](https://github.com/jsdom/jsdom) e não precisam de rede nem de um Supabase real — todas as integrações externas são substituídas por mocks.

```bash
npm install
node tests/regressao.js      # regressão (156 verificações)
node tests/smoke-completo.js # jornada completa do aluno (46 verificações)
```

## Publicação

O site é publicado pelo GitHub Pages a partir da raiz da branch `main`. Para publicar uma atualização, faça push para o repositório e aguarde a execução do workflow/configuração do Pages. O endereço público está listado acima.

## Segurança e limitações conhecidas

A chave publicável do Supabase pode aparecer no navegador; a proteção dos dados depende das políticas RLS e das funções `SECURITY DEFINER` do banco. A conta de login do Supabase Auth só pode ser removida com a Admin API e, portanto, a exclusão de aluno no painel remove os dados acadêmicos, não a identidade Auth.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
