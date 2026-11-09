// Três aulas guiadas para cada matéria. Os vídeos são materiais externos do
// YouTube; a marcação de aula assistida é uma declaração do próprio aluno.
// Os IDs das aulas (1, 2 e 3) correspondem aos IDs aceitos pelo banco.
const courseLessons = {
  html: [
    { title: 'Estrutura de uma página', videoId: 'bCFTv8a59PE', focus: 'Entenda o papel do HTML e organize um documento com doctype, head e body.', practice: 'Monte uma página com título, parágrafo e lista. Abra o arquivo no navegador.' },
    { title: 'Semântica e organização', videoId: 'NYSnFwlzUfE', focus: 'Use elementos semânticos para explicar a função de cada parte da página.', practice: 'Separe a página em header, nav, main e footer e confira a ordem do conteúdo.' },
    { title: 'Formulários acessíveis', videoId: '2toG1P7JrJE', focus: 'Conheça form, input e label para coletar informações de forma clara.', practice: 'Crie um formulário de contato com rótulos associados e campos obrigatórios.' }
  ],
  css: [
    { title: 'O modelo de caixas', videoId: 'W_HppbRhl3g', focus: 'Diferencie conteúdo, padding, borda e margem para controlar o espaço dos elementos.', practice: 'Inspecione um card no navegador e altere margin, padding e border.' },
    { title: 'Layouts com Flexbox', videoId: 'NQTU9hEStD8', focus: 'Distribua e alinhe elementos em um contêiner flexível.', practice: 'Crie uma linha de cards e experimente justify-content e align-items.' },
    { title: 'Layout responsivo', videoId: 'ywSFn4MPWds', focus: 'Combine Grid, Flexbox e media queries para adaptar a página a diferentes telas.', practice: 'Faça o layout passar de várias colunas no computador para uma coluna no celular.' }
  ],
  js: [
    { title: 'Variáveis e tipos', videoId: 'LiNYvhZ1u5c', focus: 'Declare dados com let e const e observe a diferença entre valores e referências.', practice: 'Crie variáveis para nome e nota e imprima uma mensagem no console.' },
    { title: 'Funções e escopo', videoId: 'TWmlIbvTjRo', focus: 'Separe comportamentos em funções e entenda parâmetros, retorno e escopo.', practice: 'Escreva uma função que recebe duas notas e retorna a média.' },
    { title: 'DOM e eventos', videoId: 'XqvoOnlfiBc', focus: 'Reaja às ações do usuário e atualize elementos da página por meio do DOM.', practice: 'Associe um clique a um botão que altera um contador visível.' }
  ],
  sql: [
    { title: 'Consultas e filtros', videoId: '27VIJMx9hlg', focus: 'Selecione colunas, filtre linhas com WHERE e organize resultados com ORDER BY.', practice: 'Liste os alunos maiores de 16 anos em ordem alfabética.' },
    { title: 'Relacionando tabelas', videoId: '3IdKyi-KezU', focus: 'Compare junções internas e externas ao consultar tabelas relacionadas.', practice: 'Combine alunos e cursos e compare o resultado de INNER JOIN e LEFT JOIN.' },
    { title: 'Agrupamentos e contagens', videoId: '9k33SPk1X28', focus: 'Agrupe linhas e calcule indicadores com funções como COUNT.', practice: 'Conte quantos alunos existem em cada curso usando GROUP BY.' }
  ],
  python: [
    { title: 'Primeiros passos', videoId: 'S9uPNppGsGo', focus: 'Conheça a linguagem e prepare-se para escrever seus primeiros programas.', practice: 'Crie um programa que receba seu nome e mostre uma saudação.' },
    { title: 'Listas e repetição', videoId: 'N1hTsbW50eM', focus: 'Armazene vários valores em listas e percorra seus elementos.', practice: 'Guarde três notas em uma lista e percorra seus valores com for.' },
    { title: 'Funções e retorno', videoId: 'ezfr9d7wd_k', focus: 'Organize instruções em funções e devolva resultados com return.', practice: 'Escreva uma função que recebe notas e retorna a média, tratando lista vazia.' }
  ],
  java: [
    { title: 'Variáveis em Java', videoId: 'c9fRxzmBQa4', focus: 'Declare e atribua variáveis respeitando os tipos da linguagem.', practice: 'Declare nome, idade e nota com tipos apropriados e exiba os valores.' },
    { title: 'Classes e objetos', videoId: 'NXYvEotojdc', focus: 'Modele uma classe com atributos e métodos e crie instâncias dela.', practice: 'Crie a classe Carro, instancie um objeto e apresente seus dados.' },
    { title: 'Tratamento de exceções', videoId: '0DQWd9PJkeU', focus: 'Entenda como try e catch ajudam a lidar com falhas durante a execução.', practice: 'Trate uma entrada numérica inválida sem encerrar o programa abruptamente.' }
  ],
  poo: [
    { title: 'Objetos e classes', videoId: 'QY0Kdg83orY', focus: 'Entenda como classes descrevem dados e comportamentos de objetos.', practice: 'Descreva uma classe Conta e identifique seus atributos e métodos.' },
    { title: 'Os pilares da orientação a objetos', videoId: 'Buw_y89ssNU', focus: 'Compare abstração, encapsulamento, herança e polimorfismo.', practice: 'Identifique um exemplo de cada pilar em um sistema de biblioteca.' },
    { title: 'Herança na prática', videoId: 'no4CkfsbYpo', focus: 'Reutilize comportamentos por herança e avalie quando ela faz sentido.', practice: 'Modele uma classe base Forma e especializações para Retângulo e Círculo.' }
  ],
  git: [
    { title: 'Repositório e primeiro commit', videoId: 'hxMCusk1xXY', focus: 'Diferencie Git de GitHub e registre alterações no histórico local.', practice: 'Inicialize um repositório, adicione um arquivo e faça seu primeiro commit.' },
    { title: 'Branches e merge', videoId: 'iRs6sQOPcvg', focus: 'Isole mudanças em branches, faça merge e entenda como resolver conflitos.', practice: 'Crie uma branch, altere um arquivo e integre o trabalho à branch principal.' },
    { title: 'Colaboração com pull requests', videoId: 'xM-bZSDGjzA', focus: 'Envie uma proposta de alteração para revisão antes de integrá-la.', practice: 'Envie a branch ao GitHub e descreva uma alteração em um pull request.' }
  ],
  redes: [
    { title: 'Introdução às redes', videoId: 'FOuM6Okju7U', focus: 'Conheça os elementos que permitem a comunicação entre dispositivos.', practice: 'Desenhe uma rede simples com computador, roteador e acesso à internet.' },
    { title: 'Nomes e endereços', videoId: 'YdoLa_ONO6c', focus: 'Entenda como DNS relaciona nomes de domínio a endereços IP.', practice: 'Descreva o caminho de uma consulta DNS ao acessar um site.' },
    { title: 'HTTP e TCP/IP', videoId: 'V4XZ81vRGtM', focus: 'Diferencie protocolos de transporte e de aplicação em uma requisição web.', practice: 'Explique os papéis de TCP, IP e HTTP quando você abre uma página.' }
  ],
  apis: [
    { title: 'O que é uma API?', videoId: 'vGuqKIRWosk', focus: 'Entenda como uma interface permite a comunicação entre sistemas.', practice: 'Identifique uma API usada em um aplicativo que você conhece.' },
    { title: 'Recursos, métodos e JSON', videoId: 'i6Vkl8VPjhM', focus: 'Relacione recursos, verbos HTTP, respostas JSON e códigos de status.', practice: 'Planeje rotas GET e POST para um catálogo de livros.' },
    { title: 'Consumindo uma API', videoId: '78lFNv4USoU', focus: 'Busque dados no navegador com fetch e apresente o resultado.', practice: 'Consuma uma API pública e trate tanto a resposta quanto possíveis erros.' }
  ],
  banco: [
    { title: 'Modelagem conceitual', videoId: 'jJx9xj3cwiw', focus: 'Identifique entidades, atributos e relacionamentos antes de criar tabelas.', practice: 'Desenhe as entidades de uma biblioteca e suas relações.' },
    { title: 'Chaves e cardinalidade', videoId: 'rfR3dUumo0U', focus: 'Use chaves primárias e estrangeiras para ligar dados com integridade.', practice: 'Defina as chaves e a cardinalidade entre livros, autores e empréstimos.' },
    { title: 'Normalização', videoId: '3kJKJNKiaD4', focus: 'Organize dados para reduzir repetição e evitar inconsistências.', practice: 'Separe uma tabela com dados repetidos em tabelas relacionadas.' }
  ],
  logica: [
    { title: 'Pensando em algoritmos', videoId: '8mei6uVttho', focus: 'Transforme um problema em uma sequência clara e finita de passos.', practice: 'Descreva em pseudocódigo os passos para calcular a média de duas notas.' },
    { title: 'Decisões com condicionais', videoId: 'tRjYfqfjrFM', focus: 'Use condições para escolher caminhos diferentes em um algoritmo.', practice: 'Verifique se uma nota é suficiente para aprovação usando se/senão.' },
    { title: 'Repetição e contadores', videoId: 'nz6hwcWVPI4', focus: 'Use laços e contadores para executar uma tarefa várias vezes.', practice: 'Leia cinco números e acompanhe o maior e o menor encontrados.' }
  ]
};
