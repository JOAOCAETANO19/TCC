# Pratica.dev 2.0

Plataforma educacional gamificada para estudantes de desenvolvimento de sistemas. O aluno cria uma conta, responde a um quiz de nivelamento, estuda conteúdos, conclui exercícios e projetos e acompanha XP, certificados e portfólio. O Supabase fornece autenticação, persistência e as regras de segurança do backend.

## Acessos para avaliação

- **Repositório (Frontend + integração Backend):** [github.com/JOAOCAETANO19/TCC](https://github.com/JOAOCAETANO19/TCC)
- **Sistema publicado no GitHub Pages:** [joaocaetano19.github.io/TCC](https://joaocaetano19.github.io/TCC/)
- **Modelo do certificado visual:** na tela de login, use **Ver modelo do certificado visual** (não grava dados no banco)
- **Briefing dos projetos:** aba **Projetos** → botão **Ver briefing** em qualquer card
- **Laboratórios:** aba **Projetos** → **Abrir laboratório** na Calculadora, Lista de Tarefas, Relógio Digital, Dashboard Analytics ou Quiz Interativo
- **Menu mobile:** abra o sistema em uma tela de até 768px e use o botão de menu no topo
- **Portfólio público:** na aba **Portfólio**, use **Publicar portfólio** e compartilhe o link `https://joaocaetano19.github.io/TCC/#publico/<id>` — ele abre a visão pública do portfólio sem exigir login
- **Foto de perfil:** na aba **Perfil**, use **Alterar foto** (JPG ou PNG, até 2 MB), confira a prévia e salve; a foto aparece no topo, no portfólio e na visão pública — visitantes anônimos só a veem se o portfólio estiver público
- **Personalização:** na aba **Perfil**, escolha um tema e uma moldura desbloqueados pelo seu XP
- **Desafios e ranking opcional:** acompanhe metas na aba **Desafios** e, se quiser, escolha um apelido para participar do ranking
- **Scripts do banco de dados:** [`database/schema.sql`](database/schema.sql)
- **Documentação técnica:** [`docs/documentacao-tecnica.md`](docs/documentacao-tecnica.md)

> A aplicação é uma SPA estática. O backend é consumido pelo cliente por meio do Supabase; por isso, não há um servidor Node separado neste repositório. Nesta versão, personalização, desafios e ranking exigem a migração específica abaixo; o site publicado pode estar em uma versão anterior.

## Recursos da interface

- **Diagnóstico inicial com "Meu nivelamento":** o aluno responde 4 perguntas sobre experiência, interesse, objetivo e disponibilidade e 6 desafios simples de fundamentos, sem precisar escrever código. Há progresso, navegação, a opção **Ainda não sei**, explicações e sugestões de matérias. O diagnóstico pode ser adiado, revisto ou refeito no **Perfil**; resultados anteriores continuam legíveis até serem substituídos ao refazer, e os 50 XP são concedidos apenas na primeira conclusão;
- **Centro de Estudos:** 12 cursos, cada um com 3 videoaulas em sequência, objetivos, pequenas práticas, exemplos, erros comuns, links externos e um teste de fixação opcional. O aluno acompanha as aulas concluídas e recebe uma trilha recomendada de acordo com sua área e os temas a revisar no diagnóstico;
- **Certificação por aproveitamento:** para emitir um novo certificado, é preciso marcar as 3 aulas, enviar uma resposta para a atividade prática (30 a 4.000 caracteres) e acertar ao menos **5 das 6 questões** da avaliação final (mínimo de 80%). A prova é corrigida no banco, pode ser refeita e apresenta feedback. A primeira aprovação emite o diploma e concede 30 XP; abrir uma matéria continua concedendo 10 XP uma vez. Progresso, atividade e tentativas são salvos por aluno. Certificados anteriores são preservados;
- **Certificado visual:** diploma renderizado em canvas, com download em PNG e impressão em PDF;
- **Briefing de projetos:** cada um dos 9 projetos práticos abre um briefing no formato usado no mercado, com contexto do cliente, tecnologias sugeridas, requisitos funcionais, entregáveis e critérios de aceite;
- **Laboratórios de projetos:** cinco projetos que funcionam no navegador têm editor HTML/CSS/JavaScript, prévia isolada, testes locais por requisito e rascunho salvo no dispositivo. Os outros quatro continuam com conclusão manual identificada na interface;
- **Personalização do perfil:** temas e molduras são liberados pelo XP acumulado, sem descontá-lo nem mudar o nível; aparecem no perfil e no portfólio, respeitando a visibilidade dele;
- **Desafios cumulativos:** seis metas acompanham aulas marcadas, projetos registrados e certificados já existentes; não há prazo nem XP extra;
- **Ranking voluntário:** a adesão exige apelido escolhido pelo aluno, pode ser desfeita e é independente do portfólio público. A lista é acessível apenas a participantes autenticados e ativos e mostra posição, apelido e XP;
- **Menu mobile:** em telas de até 768px a barra lateral vira uma gaveta acionada pelo botão de menu, com fundo escurecido, fechamento pelo `Esc`, por clique fora e ao escolher uma aba;
- **Portfólio digital:** reúne XP, projetos concluídos e certificados do aluno;
- **Portfólio público:** o aluno publica ou torna privado o portfólio na aba Portfólio e copia o link `#publico/<id>`, que abre uma visão pública sem login com apenas os dados autorizados;
- **Foto de perfil (avatar):** upload com validação de formato (JPG/PNG) e tamanho (máx. 2 MB), prévia antes de salvar e opção de remover; armazenada em bucket privado do Supabase Storage, exibida por URL assinada e protegida pelas mesmas regras de privacidade do portfólio — sem foto, a bolinha com a inicial do nome continua em uso;
- **Recuperação de senha:** o link **Esqueci minha senha** na tela de login envia um e-mail com o link de redefinição (Supabase Auth); ao abrir o link, o aluno cai direto na tela de nova senha, troca a senha e entra com ela;
- **Acessibilidade e desempenho:** os modais são diálogos acessíveis (`role="dialog"`, `aria-modal`, rótulo, foco que entra no modal e volta para o botão de origem, fechamento por `Esc` no modal mais acima), o CSS respeita `prefers-reduced-motion` para quem prefere menos animações e o `<head>` faz `preconnect`/`dns-prefetch` dos CDNs (Tailwind, jsDelivr e Google Fonts);
- **Feedback visível de falhas:** erros de gravação (quiz, progresso, foto, projeto, portfólio) aparecem como toast, não só no console.

## Como praticar nos laboratórios

1. Na aba **Projetos**, abra um dos cinco laboratórios. Cada um começa com HTML e CSS de apoio e JavaScript incompleto; leia os requisitos e mantenha os IDs e atributos indicados para que os testes encontrem os elementos.
2. Edite os arquivos nas abas e clique em **Executar projeto** para atualizar a prévia. Escreva o JavaScript na aba própria: scripts colocados no HTML e bibliotecas externas não são executados.
3. Clique em **Testar projeto** e corrija os itens indicados. Quando todos passarem, **Concluir projeto** registra a conclusão e a recompensa no Supabase. Alterar o código após o teste exige uma nova execução dos testes.
4. O código e os dados da prévia ficam apenas neste navegador e dispositivo, separados por conta e projeto; limpar os dados do navegador os apaga. Sair da conta não os remove, e outra pessoa com acesso ao dispositivo pode inspecioná-los. Não inclua senhas ou dados pessoais. **Restaurar código inicial** substitui o rascunho depois de uma confirmação, mas não apaga os dados da prévia.

A Lista de Tarefas e o Quiz usam `localStorage.getItem`/`setItem` virtualizados na prévia. O Dashboard usa `LAB.buscarDashboard(periodo)` com dados de exemplo, e o Quiz usa `LAB.perguntas` e `LAB.tempoPorPergunta`; não há consulta a uma API real. A prévia e os testes são ambientes separados: os testes não alteram os dados usados na prévia. Projetos concluídos anteriormente e XP existente são preservados; é possível abrir um projeto concluído para praticar novamente sem ganhar XP duplicado. Sistema de Login, E-commerce, Rede Social e Chat em Tempo Real mantêm **conclusão manual**.

Os testes são exercícios formativos feitos no próprio navegador e cobrem apenas os casos apresentados. Eles não comprovam autoria, qualidade integral ou segurança do projeto. A RPC de XP existente não avalia código e pode ser chamada diretamente por um usuário autenticado; a regra no banco impede recompensa duplicada, não manipulação da conclusão. Não é necessária migração de banco para os laboratórios.

## Personalização, desafios e ranking

No **Perfil**, selecione um tema e uma moldura já liberados. A escolha é salva na conta e usa o XP atual como requisito; não é compra e não muda XP ou nível.

| XP mínimo | Tema | Moldura |
|---|---|---|
| 0 | Original | Simples |
| 100 | Oceano | Menta |
| 250 | Aurora | — |
| 300 | — | Violeta |
| 500 | Cosmos | — |
| 600 | — | Solar |

Se um administrador reduzir o XP abaixo do requisito, o estilo indisponível volta ao original/simples até o requisito ser recuperado; recarregue a página ou entre novamente para atualizar a exibição. O tema e a moldura também são visíveis em portfólios publicados, mas não tornam um portfólio privado público.

Na aba **Desafios**, as seis metas são cumulativas: 1, 3 e 6 aulas marcadas; 1 e 3 projetos registrados; e 1 certificado. Contam registros antigos, projetos de conclusão manual e certificados anteriores. As metas não concedem XP extra; certificados continuam exigindo aulas, atividade e aprovação nas regras atuais.

O ranking começa **desativado**. Quem quiser participar informa um apelido de 2 a 24 caracteres, sem `@` ou caracteres de controle. Não use nome completo, e-mail ou outros dados pessoais. Apenas participantes autenticados e não bloqueados podem consultar a lista, que mostra **apelido, posição e XP total**, mesmo para portfólios privados; não mostra nome de cadastro, ID, foto, e-mail ou link. Qualquer pessoa que aderir poderá ver esses dados. A lista mostra até 50 participantes e inclui a própria pessoa se estiver fora desse grupo; empates compartilham posição. O apelido pode ser alterado, e **Sair do ranking** remove a participação das consultas seguintes sem afetar o XP. Informações já vistas, copiadas ou armazenadas por terceiros não podem ser recolhidas.

**Limite importante:** o XP pode ser manipulado. O ranking é formativo, não comprova aprendizado ou autoria e não deve fundamentar premiações. A marcação das aulas é manual e a RPC de projeto pode ser chamada sem passar pelos testes locais.

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
2. Antes de executar [`database/schema.sql`](database/schema.sql) no **SQL Editor**, revise e corrija a divergência de bloqueio descrita no aviso abaixo.
3. Copie a URL e a chave publicável em **Settings → API** para `SUPABASE_URL` e `SUPABASE_ANON` em `supabase.js`, se estiver usando outro projeto.
4. Em **Authentication → URL Configuration → Redirect URLs**, cadastre a URL do site (por exemplo `https://joaocaetano19.github.io/TCC/` e, para testar localmente, `http://localhost:8080/`). Sem isso, o link do e-mail de recuperação de senha não volta para a aplicação.
5. Cadastre o primeiro usuário pela tela de registro.
6. Para conceder acesso administrativo, execute no SQL Editor, substituindo o e-mail:

```sql
update public.profiles
set is_admin = true
where email = 'administrador@exemplo.com';
```

O script inclui tabelas, dados iniciais, índices, RLS, triggers, funções RPC e o bucket de Storage utilizados pela aplicação.

> **Atenção:** o esquema versionado ainda não reproduz integralmente as proteções de bloqueio de conta existentes na instância atual. Em teste local, uma conta bloqueada conseguiu alterar sua própria flag `is_blocked`. Reaplicar `schema.sql` ou o histórico `correcao-xp.sql` pode substituir proteções mais recentes. Revise e corrija essas diferenças antes de criar outro banco ou reaplicar scripts em uma instalação existente. Os laboratórios não exigem migração.

Para uma instalação existente, a sequência histórica de migrações é:

1. [`database/correcao-xp.sql`](database/correcao-xp.sql)
   - corrige as funções de premiação do XP;

2. [`database/migracao-portfolio-avatar.sql`](database/migracao-portfolio-avatar.sql)
   - aplica as colunas e políticas do portfólio público;
   - cria/configura o bucket privado `avatars`;

3. [`database/migracao-bloqueio-usuarios.sql`](database/migracao-bloqueio-usuarios.sql)
   - adiciona o bloqueio administrativo;
   - impede ações de contas bloqueadas.

4. [`database/migracao-permissoes-anon.sql`](database/migracao-permissoes-anon.sql) (reforço de segurança, recomendado)
   - revoga qualquer privilégio amplo do papel `anon` sobre `public.profiles`;
   - reconcede apenas as colunas expostas pelo portfólio público.

5. **Obrigatório:** [`database/migracao-cursos-certificados.sql`](database/migracao-cursos-certificados.sql)
   - execute no SQL Editor **depois das migrações anteriores e antes de publicar o frontend dos cursos**;
   - cria aulas concluídas, atividades, tentativas e as funções que corrigem a avaliação;
   - desativa a emissão direta e o INSERT de certificados pelo cliente, sem remover diplomas antigos.

6. **Obrigatório para o novo diagnóstico:** [`database/migracao-nivelamento.sql`](database/migracao-nivelamento.sql)
   - execute no SQL Editor **antes de publicar o frontend do diagnóstico**;
   - amplia o armazenamento para dez respostas e registra a recompensa de forma idempotente, sem excluir respostas antigas nem alterar o XP existente;
   - mantém compatibilidade com o formulário antigo de três perguntas.

7. **Obrigatório para personalização, desafios e ranking:** [`database/migracao-perfil-desafios-ranking.sql`](database/migracao-perfil-desafios-ranking.sql)
   - aplique primeiro em uma instância de teste e, após revisão e autorização, na instalação existente **antes de publicar o frontend correspondente**;
   - cria tabelas privadas e RPCs sem modificar os registros de XP, perfil, aulas, projetos, respostas ou certificados;
   - pressupõe as migrações anteriores e a proteção correta da coluna `is_blocked`; não corrige a divergência de bloqueio mencionada acima.

Os arquivos incrementais usam comandos idempotentes, mas uma versão histórica ainda pode substituir funções ou políticas mais recentes: não os reaplique sem a revisão de segurança mencionada acima. `database/schema.sql` inclui as migrações de cursos, nivelamento e gamificação, além da limitação de bloqueio já mencionada. Sem a migração dos cursos, o Centro de Estudos não permite salvar aulas ou iniciar a avaliação; sem a migração do nivelamento, o diagnóstico ampliado não conseguirá salvar todas as respostas. Sem a migração de gamificação, as novas telas mostram falha e permitem tentar novamente; o portfólio público continua no estilo original.

## Estrutura

```text
index.html                         interface e telas da aplicação
style.css                          estilos complementares, diploma visual, menu mobile e briefing
script.js                          estado, renderização e regras de interação
gamification.js                    personalização, metas e ranking voluntário
project-labs.js                    desafios, prévia isolada, testes e rascunhos locais
course-content.js                  videoaulas, objetivos e práticas dos 12 cursos
supabase.js                        cliente Supabase e chamadas ao backend
package.json / package-lock.json   dependências e comandos de teste
database/
  schema.sql                       esquema completo, políticas e funções PostgreSQL
  correcao-xp.sql                  correção incremental histórica de XP
  migracao-portfolio-avatar.sql    portfólio público e avatar
  migracao-bloqueio-usuarios.sql   bloqueio administrativo de contas
  migracao-permissoes-anon.sql     restrição por coluna do papel anon
  migracao-cursos-certificados.sql trilhas, avaliações e emissão de certificados
  migracao-nivelamento.sql         diagnóstico ampliado e recompensa sem duplicação
  migracao-perfil-desafios-ranking.sql  preferências, metas e ranking voluntário
docs/
  documentacao-tecnica.md          arquitetura, banco, segurança e fluxos
tests/
  regressao.js                     verificações de regressão
  smoke-completo.js                jornada completa do aluno
  verificacao-extra.js             menu, certificado visual, admin e acessibilidade
  cursos-interface.js              estados e falhas da interface de cursos
  cursos-banco.js                  regras, RLS e permissões em PostgreSQL (PGlite)
  cursos-integracao.js             jornada da interface com o schema real (PGlite)
  nivelamento-interface.js         navegação, feedback, falhas e sessões do diagnóstico
  nivelamento-banco.js             migração, legado, permissões e XP no PostgreSQL
  nivelamento-integracao.js        diagnóstico da interface ao banco local (PGlite)
  projetos-laboratorio.js          requisitos, rascunhos, sessões e feedback dos laboratórios
  projetos-integracao.js           fluxo de projetos e RPC de XP em banco local (PGlite)
  gamificacao-interface.js         estados, privacidade e concorrência nas telas
  gamificacao-banco.js             migração, autorização, bloqueio e ranking em PGlite
  gamificacao-integracao.js        jornada da interface às RPCs em banco local
  fixtures/projetos-solucoes.js    soluções de referência usadas nos testes
```

## Testes

Os testes exigem Node.js 22.19 ou superior e usam [jsdom](https://github.com/jsdom/jsdom) e [PGlite](https://github.com/electric-sql/pglite). Depois de instalar as dependências, não precisam de rede nem de um projeto Supabase: as suítes de banco e integração executam PostgreSQL local em WebAssembly.

```bash
npm ci
npm test
```

As suítes também podem ser executadas individualmente com `node tests/<nome-do-arquivo>.js`. A suíte dos laboratórios executa soluções de referência em DOMs separados, mas o jsdom não aplica as restrições reais de sandbox e CSP; valide também a prévia, os formulários e a responsividade em um navegador moderno.

## Publicação

O site é publicado pelo GitHub Pages a partir da raiz da branch `main`. Para publicar uma atualização, faça push para o repositório e aguarde a execução do workflow/configuração do Pages. O endereço público está listado acima.

## Segurança e limitações conhecidas

A chave publicável do Supabase pode aparecer no navegador; a proteção dos dados depende das políticas RLS e das funções `SECURITY DEFINER` do banco. A conta de login do Supabase Auth só pode ser removida com a Admin API e, portanto, a exclusão de aluno no painel remove os dados acadêmicos, não a identidade Auth.

O diagnóstico inicial é formativo: seus desafios verificam noções básicas e são corrigidos no navegador. O gabarito é público e o resultado não mede experiência prática ou conhecimento avançado, não emite certificado nem comprova domínio técnico. As respostas ficam armazenadas no banco para o aluno e administradores autorizados.

Os laboratórios usam iframes em sandbox e uma política que bloqueia chamadas de API, recursos externos e envio de formulários a destinos externos no documento da prévia. Links ou scripts ainda podem navegar o próprio quadro; código com loop pode travar a página. Não execute código desconhecido nem trate os testes ou a RPC de XP como proteção antifraude.

A marcação das aulas é **manual**: o sistema não verifica se o vídeo foi assistido, e a atividade escrita não é corrigida automaticamente. Os vídeos são de terceiros e podem ficar indisponíveis; há links para abri-los no YouTube. A avaliação dificulta a emissão casual, mas não é uma prova supervisionada ou antifraude: o projeto é público e o gabarito da carga inicial está no SQL versionado. Para certificação de maior rigor, seria necessário manter um banco privado de questões e adotar mecanismos adicionais de verificação.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
