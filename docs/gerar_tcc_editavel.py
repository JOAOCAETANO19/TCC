#!/usr/bin/env python3
"""Gera o TCC editável em DOCX a partir da documentação do Pratica.dev 2.0."""
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_BREAK

OUT = "docs/TCC-Pratica-dev-2.0-editavel.docx"
TITLE = "PRATICA.DEV 2.0: PLATAFORMA EDUCACIONAL GAMIFICADA PARA ESTUDANTES DE DESENVOLVIMENTO DE SISTEMAS"
AUTHORS = ["JOÃO CLEBERSON CAETANO", "RAMON OASKA DE FREITAS"]
ADVISOR = "Prof. Antonio Carlos Ramires Golçalves"
INSTITUTION = "COLÉGIO ESTADUAL PROFESSOR JÚLIO SZYMANSKI"
COURSE = "TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS"
CITY = "ARAUCÁRIA"
YEAR = "2026"

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.top_margin, sec.left_margin = Cm(3), Cm(3)
sec.bottom_margin, sec.right_margin = Cm(2), Cm(2)
sec.header_distance, sec.footer_distance = Cm(1.25), Cm(1.25)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Arial"
normal.font.size = Pt(12)
normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
normal.paragraph_format.line_spacing = 1.5
normal.paragraph_format.first_line_indent = Cm(1.25)
normal.paragraph_format.space_after = Pt(0)

for style_name, size in [("Title", 14), ("Heading 1", 12), ("Heading 2", 12), ("Heading 3", 12)]:
    st = styles[style_name]
    st.font.name = "Arial"; st.font.size = Pt(size); st.font.bold = True
    st._element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
    st.paragraph_format.first_line_indent = Cm(0)
    st.paragraph_format.space_before = Pt(12)
    st.paragraph_format.space_after = Pt(6)
    if style_name == "Heading 1":
        st.font.all_caps = True
        st.paragraph_format.page_break_before = True

if "Sem recuo" not in styles:
    st = styles.add_style("Sem recuo", WD_STYLE_TYPE.PARAGRAPH)
    st.base_style = styles["Normal"]
    st.paragraph_format.first_line_indent = Cm(0)
if "Citacao longa" not in styles:
    st = styles.add_style("Citacao longa", WD_STYLE_TYPE.PARAGRAPH)
    st.font.name = "Arial"; st.font.size = Pt(10)
    st.paragraph_format.left_indent = Cm(4)
    st.paragraph_format.first_line_indent = Cm(0)
    st.paragraph_format.line_spacing = 1.0
    st.paragraph_format.space_after = Pt(6)
if "Legenda" not in styles:
    st = styles.add_style("Legenda", WD_STYLE_TYPE.PARAGRAPH)
    st.font.name = "Arial"; st.font.size = Pt(10)
    st.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    st.paragraph_format.first_line_indent = Cm(0)
    st.paragraph_format.line_spacing = 1.0

# Metadados
doc.core_properties.title = TITLE.title()
doc.core_properties.author = "João Cleberson Caetano; Ramon Oaska de Freitas"
doc.core_properties.subject = "Trabalho de Conclusão de Curso — Técnico em Desenvolvimento de Sistemas"
doc.core_properties.keywords = "TCC, Pratica.dev, educação, gamificação, desenvolvimento de sistemas"


def set_cell_shading(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd"); shd.set(qn("w:fill"), fill); tcPr.append(shd)


def page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run()
    fld = OxmlElement("w:fldSimple"); fld.set(qn("w:instr"), "PAGE")
    run._r.append(fld)

page_number(sec.footer.paragraphs[0])


def p(text="", align=None, bold=False, italic=False, style=None, first=True, before=0, after=0):
    par = doc.add_paragraph(style=style)
    if align is not None: par.alignment = align
    if not first: par.paragraph_format.first_line_indent = Cm(0)
    par.paragraph_format.space_before = Pt(before)
    par.paragraph_format.space_after = Pt(after)
    run = par.add_run(text); run.bold = bold; run.italic = italic
    return par


def centered(text, bold=False, size=12, before=0, after=0):
    par = p("", WD_ALIGN_PARAGRAPH.CENTER, first=False, before=before, after=after)
    r = par.add_run(text); r.bold = bold; r.font.size = Pt(size); r.font.name = "Arial"
    return par


def spacer(lines=1):
    for _ in range(lines): p("", first=False)


def new_page(): doc.add_page_break()


def heading(text, level=1): doc.add_heading(text, level=level)


def bullets(items):
    for item in items:
        par = doc.add_paragraph(style="Sem recuo")
        par.paragraph_format.left_indent = Cm(.75)
        par.paragraph_format.first_line_indent = Cm(-.5)
        par.add_run("• ")
        par.add_run(item)


def numbered(items):
    for i, item in enumerate(items, 1):
        par = doc.add_paragraph(style="Sem recuo")
        par.paragraph_format.left_indent = Cm(.75)
        par.paragraph_format.first_line_indent = Cm(-.75)
        par.add_run(f"{i}. ").bold = True
        par.add_run(item)


def table(headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.style = "Table Grid"
    for i, h in enumerate(headers):
        c=t.rows[0].cells[i]; c.text=h; set_cell_shading(c,"D9EAF7")
        c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for r in c.paragraphs[0].runs: r.bold=True; r.font.name="Arial"; r.font.size=Pt(10)
        c.paragraphs[0].alignment=WD_ALIGN_PARAGRAPH.CENTER
    for row in rows:
        cells=t.add_row().cells
        for i,val in enumerate(row):
            cells[i].text=str(val); cells[i].vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            for par in cells[i].paragraphs:
                par.paragraph_format.first_line_indent=Cm(0); par.paragraph_format.line_spacing=1.0
                par.paragraph_format.space_after=Pt(2)
                for r in par.runs: r.font.name="Arial"; r.font.size=Pt(10)
    if widths:
        for row in t.rows:
            for i,w in enumerate(widths): row.cells[i].width=Cm(w)
    p("Fonte: Elaborado pelos autores (2026).", style="Legenda", first=False, after=6)
    return t


def placeholder(text):
    par=p("", first=False, before=6, after=6)
    par.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=par.add_run(f"[CAMPO EDITÁVEL — {text}]")
    r.bold=True; r.font.color.rgb=RGBColor(192,0,0)
    return par

# CAPA — reproduz a organização do modelo enviado
centered(INSTITUTION, size=12, before=18)
centered(COURSE, size=12)
spacer(5)
for a in AUTHORS: centered(a, size=12)
spacer(7)
centered("PRATICA.DEV 2.0:", bold=True, size=12)
centered("PLATAFORMA EDUCACIONAL GAMIFICADA PARA ESTUDANTES DE DESENVOLVIMENTO DE SISTEMAS", bold=True, size=12)
spacer(10)
centered(CITY, size=12)
centered("3º TRIMESTRE", size=12)
centered(YEAR, size=12)

# FOLHA DE ROSTO
new_page()
for a in AUTHORS: centered(a, size=12, before=6 if a==AUTHORS[0] else 0)
spacer(6)
centered("PRATICA.DEV 2.0:", bold=True)
centered("PLATAFORMA EDUCACIONAL GAMIFICADA PARA ESTUDANTES DE DESENVOLVIMENTO DE SISTEMAS", bold=True)
spacer(3)
par=p("Trabalho de Conclusão de Curso apresentado ao Curso Técnico em Desenvolvimento de Sistemas do Colégio Estadual Professor Júlio Szymanski, como requisito parcial para conclusão do curso.", first=False)
par.paragraph_format.left_indent=Cm(8); par.paragraph_format.line_spacing=1.0
par=p(f"Orientador: {ADVISOR}.", first=False)
par.paragraph_format.left_indent=Cm(8); par.paragraph_format.line_spacing=1.0
spacer(8)
centered(CITY); centered(YEAR)

# FOLHA DE APROVAÇÃO
new_page()
centered("; ".join([a.title() for a in AUTHORS]), size=12)
spacer(2)
centered("PRATICA.DEV 2.0:", bold=True)
centered("PLATAFORMA EDUCACIONAL GAMIFICADA PARA ESTUDANTES DE DESENVOLVIMENTO DE SISTEMAS", bold=True)
spacer(2)
p("Este Trabalho de Conclusão de Curso foi julgado adequado para obtenção do título de Técnico em Desenvolvimento de Sistemas e aprovado em sua forma final pelo curso.", align=WD_ALIGN_PARAGRAPH.CENTER, first=False)
placeholder("Araucária, ____ de __________________ de 2026. Conceito: ______")
spacer(2)
centered("________________________________________")
centered("Prof. __________________________________")
centered("Coordenador(a) do Curso")
spacer(2)
centered("BANCA EXAMINADORA", bold=True)
spacer(1)
centered("________________________________________")
centered(ADVISOR)
centered("Orientador")
spacer(1)
centered("________________________________________")
centered("Prof.(a) __________________________________")
spacer(1)
centered("________________________________________")
centered("Prof.(a) __________________________________")

# RESUMO
heading("RESUMO",1)
p("Este trabalho apresenta o desenvolvimento do Pratica.dev 2.0, uma plataforma web educacional gamificada destinada a estudantes de cursos técnicos de Desenvolvimento de Sistemas. O problema abordado é a dispersão de conteúdos, atividades práticas e evidências de aprendizagem em diferentes ferramentas, situação que dificulta ao estudante visualizar sua evolução e organizar uma trilha de estudos. Como solução, foi construída uma aplicação de página única que reúne cadastro e autenticação, quiz de nivelamento, centro de estudos com doze matérias, testes rápidos, projetos com briefing, sistema de experiência, certificados e portfólio público. O frontend utiliza HTML5, CSS3 e JavaScript, enquanto autenticação, persistência, armazenamento e controle de acesso são fornecidos pelo Supabase, com PostgreSQL, Row Level Security e funções RPC. O desenvolvimento adotou abordagem aplicada, incremental e orientada a protótipos, com requisitos extraídos da jornada do estudante e validação por testes automatizados. Foram executadas 259 verificações distribuídas entre testes de regressão, jornada completa e verificações adicionais; todas foram aprovadas no ambiente de desenvolvimento em 1º de outubro de 2026. Os resultados indicam que a solução implementa os fluxos essenciais propostos e mantém controles de privacidade para dados pessoais, portfólios e imagens de perfil. Conclui-se que o produto funciona como apoio à organização do aprendizado e à apresentação das competências desenvolvidas, permanecendo como possibilidades futuras a ampliação do conteúdo, métricas de aprendizagem, acessibilidade e avaliação com usuários reais.")
p("Palavras-chave: educação tecnológica; gamificação; desenvolvimento de sistemas; aplicação web; portfólio digital.", bold=True, first=False, before=12)

# ABSTRACT
heading("ABSTRACT",1)
p("This work presents the development of Pratica.dev 2.0, a gamified educational web platform aimed at students enrolled in technical Systems Development programs. The addressed problem is the fragmentation of learning content, practical activities and evidence of achievement across different tools, which makes it difficult for students to understand their progress and organize a study path. The proposed solution is a single-page application that combines registration and authentication, a placement quiz, a study center with twelve subjects, quick knowledge tests, projects with professional-style briefs, an experience system, certificates and a public portfolio. The frontend was built with HTML5, CSS3 and JavaScript, while authentication, persistence, storage and access control are provided by Supabase using PostgreSQL, Row Level Security and RPC functions. The project followed an applied, incremental and prototype-oriented approach, with requirements derived from the student journey and validation through automated tests. A total of 259 checks were executed across regression, end-to-end journey and additional verification suites; all checks passed in the development environment on October 1, 2026. Results show that the solution implements the proposed core workflows and includes privacy controls for personal data, portfolios and profile images. It is concluded that the product can support learning organization and the presentation of acquired skills, while future work may include more content, learning analytics, accessibility improvements and evaluations with real users.")
p("Keywords: technology education; gamification; systems development; web application; digital portfolio.", bold=True, first=False, before=12)

# LISTAS
heading("LISTA DE FIGURAS",1)
for x in ["Figura 1 — Visão geral da arquitetura do sistema", "Figura 2 — Fluxo principal do estudante", "Figura 3 — Relacionamento lógico entre as entidades", "Figura 4 — Fluxo de publicação do portfólio"]: p(x, first=False)
p("Observação: os números de página podem ser atualizados automaticamente após a inserção das capturas de tela.", italic=True, first=False, before=12)
heading("LISTA DE QUADROS",1)
for x in ["Quadro 1 — Requisitos funcionais", "Quadro 2 — Requisitos não funcionais", "Quadro 3 — Tecnologias empregadas", "Quadro 4 — Entidades do banco de dados", "Quadro 5 — Resultado dos testes automatizados", "Quadro 6 — Cronograma de execução"]: p(x, first=False)
heading("LISTA DE ABREVIATURAS E SIGLAS",1)
table(["Sigla","Significado"],[("API","Application Programming Interface"),("CDN","Content Delivery Network"),("CSS","Cascading Style Sheets"),("HTML","HyperText Markup Language"),("HTTP","Hypertext Transfer Protocol"),("JS","JavaScript"),("RLS","Row Level Security"),("RPC","Remote Procedure Call"),("SPA","Single-Page Application"),("SQL","Structured Query Language"),("TCC","Trabalho de Conclusão de Curso"),("UX","User Experience"),("XP","Experience Points")],[3,13])

# SUMÁRIO dinâmico
heading("SUMÁRIO",1)
par=p("",first=False)
fld=OxmlElement("w:fldSimple"); fld.set(qn("w:instr"), 'TOC \\o "1-3" \\h \\z \\u')
par._p.append(fld)
p("No Microsoft Word: clique com o botão direito sobre o sumário e escolha “Atualizar Campo” > “Atualizar o índice inteiro”. No LibreOffice Writer: Ferramentas > Atualizar > Atualizar tudo.", italic=True, first=False, before=12)

# 1 INTRODUÇÃO
heading("1 INTRODUÇÃO",1)
p("A formação em Desenvolvimento de Sistemas exige que o estudante articule fundamentos de programação, banco de dados, versionamento, desenvolvimento web, segurança e construção de projetos. Apesar da disponibilidade de materiais na internet, a aprendizagem pode ficar fragmentada entre vídeos, anotações, ambientes de código e plataformas distintas. Essa fragmentação dificulta a definição do próximo conteúdo, o acompanhamento do progresso e a organização das evidências produzidas ao longo do curso.")
p("O Pratica.dev 2.0 foi concebido para centralizar parte dessa jornada em uma aplicação web. A plataforma oferece um quiz inicial para identificar área de interesse e objetivo profissional, recomenda uma sequência de matérias, apresenta conteúdos e testes rápidos, propõe projetos contextualizados, concede pontos de experiência e emite certificados. Os resultados podem ser reunidos em um portfólio digital que o próprio estudante decide publicar ou manter privado.")
p("A versão desenvolvida é uma aplicação de página única hospedável como conteúdo estático. O navegador executa a interface, e o Supabase fornece autenticação, banco PostgreSQL, funções de negócio, políticas de segurança e armazenamento de imagens. Essa arquitetura reduz a necessidade de manter um servidor próprio, sem retirar a necessidade de validações no banco de dados e de controle de acesso.")
heading("1.1 PROBLEMA DE PESQUISA",2)
p("Como uma plataforma web gamificada pode apoiar estudantes de Desenvolvimento de Sistemas na organização dos estudos, na prática de conteúdos e na apresentação de sua evolução acadêmica e técnica?")
heading("1.2 HIPÓTESE",2)
p("Parte-se da hipótese de que a reunião de trilhas, conteúdos, exercícios, projetos, recompensas e portfólio em uma única interface torna a evolução mais visível e oferece ao estudante referências objetivas sobre o que estudar e produzir em seguida. A gamificação não substitui a orientação docente, mas pode funcionar como elemento complementar de engajamento e registro.")
heading("1.3 OBJETIVO GERAL",2)
p("Desenvolver uma plataforma web educacional gamificada que centralize materiais de estudo, atividades práticas, acompanhamento de progresso, certificados e portfólio para estudantes de Desenvolvimento de Sistemas.")
heading("1.4 OBJETIVOS ESPECÍFICOS",2)
bullets(["implementar cadastro, autenticação e recuperação da sessão do estudante;","aplicar um quiz de nivelamento e registrar área de interesse e objetivo profissional;","organizar conteúdos em um centro de estudos com sequência recomendada;","disponibilizar exercícios, testes rápidos e projetos com critérios de aceite;","registrar progresso e pontuação sem permitir premiação duplicada;","gerar certificados visuais a partir dos registros de conclusão;","permitir a publicação controlada de um portfólio digital;","proteger dados pessoais por meio de políticas de acesso no banco e no armazenamento;","validar os fluxos principais com testes automatizados."])
heading("1.5 JUSTIFICATIVA",2)
p("A escolha do tema decorre da necessidade observada de transformar conteúdos isolados em uma experiência de aprendizagem mais organizada. Para o estudante, visualizar matérias concluídas, projetos e certificados pode facilitar o planejamento individual. Para o curso, um sistema desse tipo demonstra a integração de conhecimentos de interface, lógica de programação, banco de dados, segurança e publicação de software.")
p("O projeto também é pertinente como TCC por exigir decisões que ultrapassam a aparência da interface. Pontuação, privacidade, autorização, consistência de dados e tratamento de erros foram implementados como regras verificáveis. Assim, o produto serve simultaneamente como ferramenta educacional e como demonstração prática das competências desenvolvidas no Curso Técnico em Desenvolvimento de Sistemas.")
heading("1.6 DELIMITAÇÃO",2)
p("O trabalho limita-se a uma aplicação web responsiva para navegadores modernos. Não foram desenvolvidos aplicativos nativos para Android ou iOS, videoconferência, correção automática de código-fonte, integração com sistemas oficiais da instituição ou emissão de certificado com validade jurídica. Os testes automatizados verificam o comportamento do software em ambiente simulado; uma pesquisa com amostra de estudantes e professores permanece como etapa futura.")
heading("1.7 ESTRUTURA DO TRABALHO",2)
p("Além desta introdução, o capítulo 2 apresenta a fundamentação teórica. O capítulo 3 descreve a metodologia. O capítulo 4 registra requisitos e planejamento. O capítulo 5 detalha o desenvolvimento e a arquitetura. O capítulo 6 reúne testes e resultados. O capítulo 7 discute limitações e possibilidades de evolução. Por fim, o capítulo 8 apresenta as considerações finais.")

# 2 FUNDAMENTAÇÃO
heading("2 FUNDAMENTAÇÃO TEÓRICA",1)
heading("2.1 EDUCAÇÃO TECNOLÓGICA E APRENDIZAGEM PRÁTICA",2)
p("O ensino de desenvolvimento de software envolve conceitos abstratos e aplicação contínua. A leitura de um conteúdo ganha significado quando o estudante transforma conceitos em páginas, algoritmos, consultas, modelos de dados e decisões de projeto. Por esse motivo, o Pratica.dev associa cada área de estudo a exercícios e projetos, procurando aproximar a explicação da produção de um resultado observável.")
p("A plataforma não pretende substituir professor, laboratório ou documentação oficial. Seu papel é organizar uma sequência complementar e registrar realizações. Os briefings dos projetos apresentam contexto do cliente, tecnologias sugeridas, requisitos, entregáveis e critérios de aceite, aproximando a atividade escolar da forma como demandas são comunicadas em equipes de tecnologia.")
heading("2.2 GAMIFICAÇÃO",2)
p("Gamificação corresponde ao uso de elementos comuns aos jogos em contextos que não são jogos. Pontos, níveis, progresso visível, desafios e recompensas podem tornar objetivos intermediários mais claros. Kapp (2012) destaca que a gamificação educacional deve estar relacionada à aprendizagem, e não apenas à distribuição de recompensas. No Pratica.dev, o XP está associado a ações acadêmicas específicas: conclusão do quiz, primeira visualização de matéria, exercício e projeto.")
p("Para evitar que a recompensa se torne o único objetivo, a plataforma registra cada premiação apenas uma vez e mantém critérios distintos para exploração e conclusão. Abrir uma matéria concede XP de exploração, porém a matéria somente é exibida como concluída quando há certificado emitido. Essa diferença procura preservar o significado do indicador de progresso.")
heading("2.3 EXPERIÊNCIA DO USUÁRIO E RESPONSIVIDADE",2)
p("A experiência do usuário compreende clareza, retorno das ações, prevenção de erros e compatibilidade com diferentes dispositivos. Nielsen (1994) propõe princípios como visibilidade do estado do sistema, consistência e prevenção de erros. Esses princípios aparecem na solução por meio de mensagens de sucesso e falha, confirmação de ações destrutivas, estados de carregamento, correção imediata dos testes rápidos e manutenção do padrão visual entre as telas.")
p("O layout responsivo transforma a navegação lateral em uma gaveta em telas de até 768 pixels. A gaveta pode ser fechada por botão, seleção de aba, clique fora ou tecla Escape. Também foram empregados formulários semânticos, textos alternativos e indicação visível de foco. Esses recursos não encerram todo o trabalho de acessibilidade, mas constituem uma base técnica para evolução.")
heading("2.4 APLICAÇÕES WEB DE PÁGINA ÚNICA",2)
p("Uma Single-Page Application atualiza áreas da interface sem recarregar um novo documento HTML a cada ação. No projeto, as telas são seções do mesmo documento e o JavaScript controla visibilidade, estado e renderização. Essa abordagem simplifica a hospedagem estática e permite navegação rápida após o carregamento inicial. Como contrapartida, exige cuidado com inicialização, restauração de sessão, rotas por hash e manipulação segura do HTML.")
heading("2.5 BANCO DE DADOS, AUTENTICAÇÃO E AUTORIZAÇÃO",2)
p("Autenticação confirma a identidade do usuário; autorização define quais dados e ações essa identidade pode acessar. O Supabase Auth realiza cadastro e login, enquanto o PostgreSQL mantém os dados acadêmicos. Políticas de Row Level Security são aplicadas às tabelas públicas para restringir linhas de acordo com a identidade autenticada e o papel administrativo.")
p("Regras de negócio sensíveis, como a atribuição de XP, foram implementadas em funções PostgreSQL. A interface solicita a operação, porém o cálculo e a prevenção de duplicidade ocorrem no banco. Dessa forma, alterar variáveis do navegador não é suficiente para aumentar a pontuação persistida. A separação entre chave publicável e credenciais administrativas também é essencial: apenas a chave destinada ao cliente aparece no frontend.")
heading("2.6 PORTFÓLIO DIGITAL E PRIVACIDADE",2)
p("O portfólio digital organiza evidências de aprendizagem, como projetos concluídos, certificados e competências. Na solução, ele começa privado e somente se torna público após uma escolha explícita do estudante. A rota pública não apresenta e-mail, idade nem papel administrativo, e um perfil privado produz a mesma resposta de um identificador inexistente, reduzindo a exposição de informações.")
p("A imagem de perfil é armazenada em bucket privado. O navegador recebe uma URL assinada com validade limitada, e a leitura anônima é permitida somente quando o portfólio do proprietário está publicado. Assim, a decisão de publicação abrange tanto os dados acadêmicos selecionados quanto a foto, sem transformar o arquivo em um endereço público permanente.")

# 3 METODOLOGIA
heading("3 METODOLOGIA",1)
heading("3.1 NATUREZA DA PESQUISA",2)
p("A pesquisa é de natureza aplicada, pois busca produzir uma solução para um problema concreto de organização da aprendizagem. Quanto aos objetivos, possui caráter exploratório e descritivo: explora possibilidades de uma plataforma educacional gamificada e descreve a implementação e os resultados técnicos. A abordagem predominante é qualitativa, apoiada por dados quantitativos dos testes automatizados.")
heading("3.2 PROCESSO DE DESENVOLVIMENTO",2)
p("O software foi construído de maneira incremental. Primeiramente foram definidos a jornada do aluno e os módulos essenciais. Em seguida, protótipos de interface foram transformados em páginas funcionais e integrados ao banco. Recursos posteriores — como portfólio público, fotografia de perfil, bloqueio administrativo, conteúdo ampliado e testes rápidos — foram acrescentados sem substituir os fluxos existentes.")
numbered(["levantamento do problema, público e funcionalidades desejadas;","modelagem das entidades e das regras de segurança;","construção da interface responsiva;","integração com autenticação, banco e armazenamento;","implementação das regras de XP e administração;","criação de testes de regressão e de jornada;","correções, documentação e publicação."])
heading("3.3 COLETA E ANÁLISE DE DADOS",2)
p("Os dados analisados nesta etapa foram produzidos pela própria execução do sistema: resultado das suítes automatizadas, comportamento dos fluxos e inspeção dos registros esperados. Não foram coletados dados pessoais de participantes para esta documentação. A avaliação com usuários reais deve ser precedida por planejamento, consentimento e definição de critérios como facilidade de uso, compreensão da trilha e utilidade percebida.")
heading("3.4 FERRAMENTAS",2)
table(["Tecnologia","Uso no projeto"],[("HTML5","Estrutura semântica das telas e formulários."),("CSS3 / Tailwind CSS","Estilos, responsividade, estados visuais e componentes."),("JavaScript ES2020+","Estado da interface, eventos, renderização e integração."),("Supabase JS v2","Acesso a Auth, banco, RPC e Storage."),("PostgreSQL","Persistência, integridade, políticas e funções de negócio."),("Git e GitHub","Versionamento, repositório e publicação no GitHub Pages."),("Node.js, jsdom","Execução dos testes automatizados em DOM simulado.")],[5,11])
heading("3.5 CRITÉRIOS DE VALIDAÇÃO",2)
p("Considerou-se o fluxo aprovado quando cadastro e login funcionavam no ambiente simulado; o quiz registrava respostas; matérias, exercícios e projetos atualizavam o estado somente após confirmação; o portfólio respeitava a opção de privacidade; e entradas maliciosas não eram interpretadas como HTML. A regressão também deveria confirmar a presença das políticas, funções e restrições no esquema SQL.")

# 4 REQUISITOS
heading("4 LEVANTAMENTO DE REQUISITOS E PLANEJAMENTO",1)
heading("4.1 PÚBLICO-ALVO",2)
p("O público principal é formado por estudantes de cursos técnicos ou introdutórios de Desenvolvimento de Sistemas. O usuário precisa de uma visão organizada do conteúdo, oportunidades de prática e um meio simples de apresentar sua evolução. Professores e avaliadores constituem público secundário, pois podem consultar o produto e acompanhar dados por meio do painel administrativo, quando autorizados.")
heading("4.2 REQUISITOS FUNCIONAIS",2)
table(["ID","Requisito"],[("RF01","Cadastrar estudante e autenticar com e-mail e senha."),("RF02","Restaurar sessão e permitir logout."),("RF03","Aplicar quiz inicial com três perguntas e salvar as respostas."),("RF04","Recomendar trilha de matérias de acordo com a área escolhida."),("RF05","Exibir 12 matérias, conteúdo, erros comuns, links e teste rápido."),("RF06","Registrar visualização e conclusão sem duplicar XP."),("RF07","Exibir nove projetos e respectivos briefings."),("RF08","Emitir e apresentar certificado visual."),("RF09","Reunir progresso no portfólio e permitir publicação/privacidade."),("RF10","Enviar, exibir e remover foto de perfil."),("RF11","Permitir ao administrador consultar, bloquear e gerenciar alunos."),("RF12","Exibir mensagens compreensíveis em falhas de gravação.")],[2,14])
heading("4.3 REQUISITOS NÃO FUNCIONAIS",2)
table(["ID","Requisito"],[("RNF01","Interface responsiva para computador e celular."),("RNF02","Proteção dos dados por RLS e privilégios mínimos."),("RNF03","Validação e escape de conteúdo inserido na interface."),("RNF04","Operações de XP atômicas e idempotentes."),("RNF05","Upload restrito a JPG/PNG de até 2 MB."),("RNF06","Aplicação publicável como site estático."),("RNF07","Compatibilidade com navegadores modernos."),("RNF08","Código versionado e testes reproduzíveis.")],[2,14])
heading("4.4 REGRAS DE NEGÓCIO",2)
bullets(["cada estudante possui um perfil ligado à identidade de autenticação;","o quiz inicial concede XP uma única vez;","a primeira visualização de cada matéria pode conceder XP de exploração;","uma matéria só conta como concluída após a emissão do certificado;","a recompensa de projeto vem do catálogo persistido;","XP e nível são calculados no banco, não pelo JavaScript do navegador;","o portfólio é privado por padrão;","visitantes anônimos acessam apenas colunas explicitamente autorizadas;","contas bloqueadas não realizam ações acadêmicas nem aparecem publicamente;","o administrador não pode bloquear a própria conta pela operação prevista."])
heading("4.5 CRONOGRAMA",2)
table(["Etapa","1º trim.","2º trim.","3º trim."],[("Pesquisa e definição do tema","X","",""),("Requisitos e prototipação","X","X",""),("Frontend e conteúdos","","X",""),("Banco e integração","","X","X"),("Segurança e testes","","","X"),("Documentação e apresentação","","","X")],[8,2.5,2.5,2.5])

# 5 DESENVOLVIMENTO
heading("5 DESENVOLVIMENTO DA SOLUÇÃO",1)
heading("5.1 VISÃO GERAL DA ARQUITETURA",2)
p("A aplicação adota arquitetura cliente-serviço. O cliente é composto por index.html, style.css, script.js e supabase.js, publicados no GitHub Pages. Bibliotecas externas são carregadas por CDN. O cliente se comunica por HTTPS com os serviços do Supabase. Não existe servidor Node.js de produção neste repositório.")
table(["Camada","Componentes","Responsabilidade"],[("Apresentação","HTML, CSS, Tailwind, Lucide","Telas, formulários, layout e feedback."),("Aplicação no cliente","JavaScript","Estado, eventos, navegação e montagem de dados."),("Integração","Supabase JS","Auth, consultas, RPC e Storage."),("Dados e regras","PostgreSQL","Persistência, integridade, XP e autorização."),("Publicação","GitHub Pages","Entrega dos arquivos estáticos por HTTPS.")],[3.5,5,8])
p("Figura 1 — Visão geral da arquitetura do sistema", style="Legenda", first=False)
par=p("NAVEGADOR  →  HTTPS / SUPABASE JS  →  AUTH + POSTGRESQL/RLS/RPC + STORAGE", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, first=False)
p("Fonte: Elaborado pelos autores (2026).", style="Legenda", first=False)
heading("5.2 ORGANIZAÇÃO DO FRONTEND",2)
p("O arquivo index.html reúne landing page, autenticação, aplicação principal, modais e visão pública. O style.css complementa o Tailwind com estilos próprios para navegação móvel, diploma, briefing e elementos específicos. O script.js mantém o estado da sessão, os conteúdos das matérias, os briefings, a renderização e os eventos. O supabase.js concentra a criação do cliente e as funções de acesso ao backend.")
p("A inicialização consulta a sessão existente. Sem sessão, a landing page é exibida; com sessão válida, perfil e dados essenciais são carregados antes da aplicação. Dados secundários são carregados depois para reduzir o bloqueio inicial. A rota por hash #publico/<id> é tratada separadamente e pode ser aberta sem autenticação.")
heading("5.3 JORNADA DO ESTUDANTE",2)
numbered(["o visitante conhece a proposta na página inicial e escolhe entrar ou cadastrar;","após o cadastro, responde ao quiz sobre nível, área e objetivo;","o painel apresenta XP, nível e acesso aos módulos;","o Centro de Estudos destaca a próxima matéria recomendada;","o estudante lê o conteúdo, realiza o teste rápido e conclui o exercício;","projetos práticos podem ser abertos em formato de briefing;","certificados e projetos concluídos compõem o portfólio;","quando desejar, o estudante publica um link público e pode torná-lo privado novamente."])
p("Figura 2 — Fluxo principal do estudante", style="Legenda", first=False)
p("VISITANTE → CADASTRO → QUIZ → ESTUDOS → EXERCÍCIOS/PROJETOS → CERTIFICADOS → PORTFÓLIO", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, first=False)
p("Fonte: Elaborado pelos autores (2026).", style="Legenda", first=False)
heading("5.4 CENTRO DE ESTUDOS",2)
p("O Centro de Estudos contém doze matérias. Cada item informa nível e tempo estimado, apresenta conceitos, exemplo, erros comuns, referências externas e teste de três questões com correção imediata. A trilha recomendada deriva da área selecionada no quiz. O destaque “Comece por aqui” avança para a primeira matéria da sequência que ainda não possui certificado.")
placeholder("Inserir captura de tela do Centro de Estudos e adicionar legenda como Figura")
heading("5.5 PROJETOS, CERTIFICADOS E PORTFÓLIO",2)
p("O catálogo oferece nove projetos organizados por dificuldade. Cada briefing informa cenário, tecnologias, requisitos funcionais, entregáveis e critérios de aceite. Ao concluir, a aplicação chama a operação persistente e atualiza a interface somente após resposta positiva, evitando que uma falha seja mostrada como sucesso.")
p("O certificado é renderizado em canvas com nome do aluno, módulo, data, trilha, nível, XP e código de verificação determinístico. A imagem pode ser baixada em PNG ou impressa para PDF. O registro persistido em certificates, e não o desenho do canvas, é a fonte da verdade sobre a conclusão.")
p("O portfólio reúne perfil, projetos e certificados. Publicá-lo altera portfolio_public e produz um link contendo o identificador do perfil. A visualização pública solicita apenas os campos autorizados e não exige login. A retirada da publicação impede novas leituras anônimas.")
placeholder("Inserir capturas do certificado e do portfólio; atualizar a Lista de Figuras")
heading("5.6 MODELO DE DADOS",2)
table(["Entidade","Finalidade","Relacionamento principal"],[("profiles","Perfil, XP, nível, trilha, privacidade e avatar.","id referencia auth.users"),("quiz_answers","Respostas do nivelamento.","N:1 com profiles"),("projects","Catálogo dos nove projetos.","Referenciado por user_projects"),("subject_progress","Primeira visualização das matérias.","N:1 com profiles"),("user_projects","Projetos concluídos pelo estudante.","N:1 com profiles e projects"),("certificates","Conclusões e certificados emitidos.","N:1 com profiles")],[4,7.5,5])
p("Figura 3 — Relacionamento lógico entre as entidades", style="Legenda", first=False)
p("auth.users 1—1 profiles 1—N {quiz_answers, subject_progress, certificates, user_projects} N—1 projects", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, first=False)
p("Fonte: Elaborado pelos autores (2026).", style="Legenda", first=False)
heading("5.7 REGRAS DE XP E CONSISTÊNCIA",2)
p("Quatro funções principais controlam as recompensas: award_quiz_xp, award_subject_view_xp, award_exercise_xp e award_project_xp. Restrições únicas registram se a atividade já ocorreu. A atualização e o recálculo do nível fazem parte da operação no banco, reduzindo condições de corrida e divergências entre interface e persistência.")
p("As funções privilegiadas fixam o search_path e revalidam a identidade. Triggers impedem que um cliente comum altere diretamente XP, nível ou papel administrativo. Operações administrativas permanecem condicionadas à verificação do papel no banco.")
heading("5.8 SEGURANÇA E PRIVACIDADE",2)
bullets(["RLS habilitado nas tabelas públicas;","privilégio anônimo limitado às colunas necessárias do portfólio;","consultas públicas sem select(*) e sem exposição de e-mail, idade ou is_admin;","escape de nomes e conteúdos antes da inserção em HTML;","bucket de avatar privado e uso de URL assinada;","validação de tipo e tamanho da imagem no cliente e no Storage;","mensagem idêntica para perfil privado e inexistente;","confirmação antes de bloqueio, exclusão e outras ações críticas;","ausência de chave service_role no frontend."])
heading("5.9 PAINEL ADMINISTRATIVO",2)
p("O painel administrativo lista estudantes e permite consultar detalhes de nivelamento, projetos e certificados. Também contém ações para reiniciar XP, promover, bloquear, desbloquear ou remover os dados acadêmicos. A ocultação dos botões no frontend melhora a experiência, porém a autorização real é repetida no banco. A exclusão implementada não remove a identidade do Supabase Auth, pois isso exigiria uma API administrativa executada em ambiente seguro.")
heading("5.10 PUBLICAÇÃO",2)
p("O repositório é publicado pelo GitHub Pages e pode ser acessado em https://joaocaetano19.github.io/TCC/. Como não há compilação, os arquivos estáticos são entregues diretamente. A implantação do banco exige executar database/schema.sql em um projeto Supabase e configurar a URL e a chave publicável em supabase.js. As URLs autorizadas de autenticação também precisam corresponder ao ambiente publicado.")

# 6 TESTES
heading("6 TESTES E RESULTADOS",1)
heading("6.1 ESTRATÉGIA DE TESTES",2)
p("Os testes utilizam Node.js e jsdom para simular o DOM e substituir serviços externos por mocks. Essa estratégia permite verificar o comportamento da interface sem criar usuários reais ou depender de rede. Foram organizadas três suítes: regressão ampla, jornada completa do estudante e verificações adicionais de navegação móvel, certificado e administração.")
heading("6.2 RESULTADOS AUTOMATIZADOS",2)
table(["Suíte","Escopo","Verificações","Resultado"],[("regressao.js","Autenticação, segurança, portfólio, avatar, conteúdo e SQL","157","Aprovadas"),("smoke-completo.js","Jornada do cadastro ao portfólio","47","Aprovadas"),("verificacao-extra.js","Menu móvel, certificado, projetos e administração","55","Aprovadas"),("TOTAL","—","259","Aprovadas")],[4,7,3,3])
p("As três suítes foram executadas novamente em 1º de outubro de 2026 no ambiente de desenvolvimento deste trabalho, após a instalação das dependências com npm ci. O resultado foi de 259 verificações aprovadas e nenhuma falha funcional nas suítes.")
heading("6.3 CENÁRIOS REPRESENTATIVOS",2)
bullets(["cadastro válido abre o quiz e registra as três respostas;","conclusão de exercício emite certificado e atualiza o contador;","falha ao concluir projeto não altera o estado como se houvesse sucesso;","conteúdo malicioso em nome e URL não cria elementos executáveis;","visitante não recebe e-mail, idade ou papel administrativo;","foto acima de 2 MB ou em formato inválido é recusada;","perfil privado não é exibido na rota pública;","conta bloqueada perde acesso e deixa de aparecer publicamente;","menu móvel fecha por Escape, mudança de aba e redimensionamento;","ações administrativas exigem confirmação e tratam falhas."])
heading("6.4 ANÁLISE DOS RESULTADOS",2)
p("Os resultados demonstram consistência entre os requisitos documentados e os comportamentos automatizados. A quantidade de verificações não garante ausência total de defeitos, porém reduz o risco de regressões nos fluxos cobertos. A suíte também inspeciona o esquema SQL, o que é relevante porque parte importante da segurança está no banco, não somente na interface.")
p("A jornada completa confirma que módulos independentes funcionam em sequência: cadastro, nivelamento, estudos, exercício, certificado, projeto e portfólio. Essa integração é mais significativa do que testar apenas funções isoladas, pois reproduz a experiência esperada do estudante.")
heading("6.5 VALIDAÇÃO MANUAL RECOMENDADA",2)
p("Antes da apresentação final, recomenda-se validar em computador e celular reais: criação de conta em um Supabase de teste; recebimento de confirmação de e-mail, se habilitada; upload e remoção de JPG e PNG; abertura do link público em janela anônima; impressão do certificado em PDF; bloqueio por um segundo usuário administrador; e navegação por teclado. Os resultados podem ser anotados no apêndice B.")

# 7 DISCUSSÃO
heading("7 DISCUSSÃO, LIMITAÇÕES E TRABALHOS FUTUROS",1)
heading("7.1 CONTRIBUIÇÕES",2)
p("A principal contribuição é a integração de vários resultados de aprendizagem em um único produto funcional. O sistema demonstra desenvolvimento de interface, programação, modelagem relacional, autenticação, autorização, armazenamento, testes e publicação. Para o estudante usuário, a contribuição está na visualização do próximo passo e no agrupamento de evidências em um portfólio compartilhável.")
heading("7.2 LIMITAÇÕES",2)
bullets(["o conteúdo das matérias é introdutório e necessita revisão pedagógica contínua;","os testes rápidos são corrigidos no cliente e não substituem avaliação formal;","não há correção automática de projetos ou análise do código entregue;","o certificado visual não possui validade acadêmica oficial;","não foi conduzido estudo de usabilidade com amostra de estudantes;","a aplicação depende da disponibilidade do GitHub Pages, CDN e Supabase;","a exclusão acadêmica não remove automaticamente a identidade do Auth;","a acessibilidade precisa de auditoria específica baseada nas WCAG."])
heading("7.3 POSSIBILIDADES DE EVOLUÇÃO",2)
bullets(["painel docente com turmas, atividades e devolutivas;","editor e avaliador de código em ambiente isolado;","métricas de aprendizagem e recomendações baseadas em dificuldades;","notificações e calendário de metas;","modo offline por Progressive Web App;","internacionalização e temas de alto contraste;","integração com repositórios para apresentar projetos reais;","testes de usabilidade e acessibilidade com participantes;","backend seguro para exclusão completa da identidade quando autorizada."])

# 8 CONSIDERAÇÕES
heading("8 CONSIDERAÇÕES FINAIS",1)
p("O objetivo geral deste trabalho foi desenvolver uma plataforma web educacional gamificada para centralizar estudo, prática, progresso e portfólio de estudantes de Desenvolvimento de Sistemas. A solução resultante implementa autenticação, quiz de nivelamento, doze matérias, testes rápidos, nove projetos, XP, níveis, certificados, portfólio público opcional, fotografia de perfil e administração.")
p("A arquitetura escolhida combinou frontend estático com serviços do Supabase. Essa decisão tornou a publicação simples, ao mesmo tempo em que exigiu políticas rigorosas no banco. As regras de XP, os privilégios mínimos, o bucket privado e a leitura pública restrita mostram que segurança e privacidade foram tratadas como parte da funcionalidade, e não como etapa separada.")
p("A execução de 259 verificações automatizadas, todas aprovadas, oferece evidências de que os principais requisitos funcionam de maneira integrada no ambiente testado. Ainda assim, a qualidade educacional e a facilidade de uso devem ser avaliadas com usuários reais. Portanto, considera-se que o Pratica.dev 2.0 atingiu o escopo técnico estabelecido e constitui uma base viável para futuras melhorias pedagógicas e tecnológicas.")

# REFERÊNCIAS
heading("REFERÊNCIAS",1)
refs=[
"ABNT — ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 14724: informação e documentação — trabalhos acadêmicos — apresentação. Rio de Janeiro: ABNT, 2011.",
"GITHUB. GitHub Pages documentation. Disponível em: https://docs.github.com/pages. Acesso em: 1 out. 2026.",
"KAPP, Karl M. The gamification of learning and instruction: game-based methods and strategies for training and education. San Francisco: Pfeiffer, 2012.",
"MDN WEB DOCS. JavaScript. Disponível em: https://developer.mozilla.org/docs/Web/JavaScript. Acesso em: 1 out. 2026.",
"NIELSEN, Jakob. Usability engineering. San Francisco: Morgan Kaufmann, 1994.",
"OWASP FOUNDATION. OWASP Top 10: the ten most critical web application security risks. Disponível em: https://owasp.org/www-project-top-ten/. Acesso em: 1 out. 2026.",
"POSTGRESQL GLOBAL DEVELOPMENT GROUP. PostgreSQL documentation. Disponível em: https://www.postgresql.org/docs/. Acesso em: 1 out. 2026.",
"PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.",
"SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson, 2019.",
"SUPABASE. Supabase documentation. Disponível em: https://supabase.com/docs. Acesso em: 1 out. 2026.",
"W3C — WORLD WIDE WEB CONSORTIUM. Web Content Accessibility Guidelines (WCAG) 2.2. Disponível em: https://www.w3.org/TR/WCAG22/. Acesso em: 1 out. 2026."
]
for ref in refs: p(ref, first=False, after=8)

# APÊNDICES
heading("APÊNDICE A — GUIA DE INSTALAÇÃO E EXECUÇÃO",1)
heading("A.1 PRÉ-REQUISITOS",2)
bullets(["Git e navegador moderno;","Python 3 ou outro servidor HTTP estático;","projeto Supabase;","Node.js e npm para executar os testes."])
heading("A.2 EXECUÇÃO LOCAL",2)
p("Execute os comandos abaixo em um terminal:", first=False)
for cmd in ["git clone https://github.com/JOAOCAETANO19/TCC.git","cd TCC","python3 -m http.server 8080"]:
    par=p(cmd, style="Citacao longa", first=False); par.runs[0].font.name="Courier New"
p("Abra http://localhost:8080. O arquivo não deve ser aberto diretamente pelo protocolo file://, pois o navegador pode bloquear recursos necessários.")
heading("A.3 CONFIGURAÇÃO DO BANCO",2)
numbered(["crie um projeto no Supabase;","abra o SQL Editor e execute database/schema.sql;","copie a URL e a chave publicável do projeto;","configure SUPABASE_URL e SUPABASE_ANON em supabase.js;","cadastre um usuário e, se necessário, promova-o a administrador conforme o README."])
heading("A.4 TESTES",2)
for cmd in ["npm ci","node tests/regressao.js","node tests/smoke-completo.js","node tests/verificacao-extra.js"]:
    par=p(cmd, style="Citacao longa", first=False); par.runs[0].font.name="Courier New"

heading("APÊNDICE B — ROTEIRO DE VALIDAÇÃO MANUAL",1)
table(["Item","Procedimento","Resultado/Data"],[("1","Criar uma nova conta e concluir o quiz.","________________"),("2","Abrir uma matéria, responder ao teste e emitir certificado.","________________"),("3","Concluir um projeto e conferir XP/portfólio.","________________"),("4","Publicar o portfólio e abrir o link sem login.","________________"),("5","Enviar e remover JPG/PNG; testar arquivo inválido.","________________"),("6","Validar menu e formulários em celular.","________________"),("7","Imprimir certificado em PDF.","________________"),("8","Testar bloqueio com conta administrativa.","________________")],[1.5,11,4])

heading("APÊNDICE C — CAMPOS A CONFERIR ANTES DA ENTREGA",1)
bullets(["confirmar a grafia de “Antonio Carlos Ramires Golçalves”;","preencher data, conceito, coordenação e demais integrantes da banca;","inserir capturas de tela nos campos destacados;","atualizar o sumário e a lista de figuras no editor de texto;","confirmar se a instituição exige dedicatória, agradecimentos ou ficha catalográfica;","revisar citações, ortografia e regras específicas do professor;","remover esta lista após concluir a conferência."])

# evita linhas órfãs em títulos e garante atualização de campos no Word
settings = doc.settings._element
update = OxmlElement("w:updateFields"); update.set(qn("w:val"), "true"); settings.append(update)
for par in doc.paragraphs:
    if par.style.name.startswith("Heading"):
        pPr=par._p.get_or_add_pPr(); keep=OxmlElement("w:keepNext"); pPr.append(keep)

# Bordas e fontes consistentes em tabelas
for t in doc.tables:
    for row in t.rows:
        for cell in row.cells:
            for par in cell.paragraphs:
                for run in par.runs:
                    run.font.name="Arial"

# Salva
doc.save(OUT)
print(OUT)
