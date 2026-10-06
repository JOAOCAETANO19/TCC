#!/usr/bin/env python3
"""Gera o TCC do Pratica.dev 2.0 em DOCX, formatado segundo normas ABNT vigentes.

Dependências: python-docx, Pillow e lxml.
Execução usada neste repositório:
  PYTHONPATH=/tmp/tcc-python-libs python3 scripts/gerar_tcc_abnt.py
"""
from __future__ import annotations

import os
import re
import shutil
from pathlib import Path
from typing import Iterable, Sequence

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_ROW_HEIGHT_RULE, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_COLOR_INDEX, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "TCC-Pratica.dev-2.0-ABNT.docx"
ASSETS = Path("/tmp/praticadev_tcc_assets")
ASSETS.mkdir(parents=True, exist_ok=True)

FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

AUTHOR = "JOÃO CAETANO"
INSTITUTION = "[NOME DA INSTITUIÇÃO]"
ADVISOR = "[NOME DO(A) ORIENTADOR(A)]"
CITY = "CURITIBA"
YEAR = "2026"
TITLE = "PRATICA.DEV 2.0: PLATAFORMA WEB GAMIFICADA PARA APOIO À FORMAÇÃO EM DESENVOLVIMENTO DE SISTEMAS"

FIGURES: list[tuple[str, str]] = []
TABLES: list[tuple[str, str]] = []
BOOKMARK_ID = 1


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_cant_split(row):
    tr_pr = row._tr.get_or_add_trPr()
    cant = OxmlElement("w:cantSplit")
    tr_pr.append(cant)


def set_cell_shading(cell, fill: str):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_width(cell, width_cm: float):
    cell.width = Cm(width_cm)
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_w = tc_pr.find(qn("w:tcW"))
    if tc_w is None:
        tc_w = OxmlElement("w:tcW")
        tc_pr.append(tc_w)
    tc_w.set(qn("w:w"), str(int(width_cm * 567)))
    tc_w.set(qn("w:type"), "dxa")


def set_cell_margins(cell, top=90, start=90, bottom=90, end=90):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color="808080", size="4"):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = OxmlElement(f"w:{edge}")
        tag.set(qn("w:val"), "single")
        tag.set(qn("w:sz"), size)
        tag.set(qn("w:space"), "0")
        tag.set(qn("w:color"), color)
        borders.append(tag)


def set_lang(run, lang="pt-BR"):
    r_pr = run._element.get_or_add_rPr()
    lang_el = r_pr.find(qn("w:lang"))
    if lang_el is None:
        lang_el = OxmlElement("w:lang")
        r_pr.append(lang_el)
    lang_el.set(qn("w:val"), lang)
    lang_el.set(qn("w:eastAsia"), lang)


def add_bookmark(paragraph, name: str):
    global BOOKMARK_ID
    safe = re.sub(r"[^A-Za-z0-9_]", "_", name)
    start = OxmlElement("w:bookmarkStart")
    start.set(qn("w:id"), str(BOOKMARK_ID))
    start.set(qn("w:name"), safe)
    end = OxmlElement("w:bookmarkEnd")
    end.set(qn("w:id"), str(BOOKMARK_ID))
    paragraph._p.insert(0, start)
    paragraph._p.append(end)
    BOOKMARK_ID += 1


def add_field(paragraph, instruction: str, placeholder: str = ""):
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    begin.set(qn("w:dirty"), "true")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = instruction
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    run._r.extend([begin, instr, separate])
    if placeholder:
        text_run = paragraph.add_run(placeholder)
        text_run.font.name = "Times New Roman"
        text_run.font.size = Pt(12)
    end_run = paragraph.add_run()
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    end_run._r.append(end)


def add_page_number(paragraph):
    add_field(paragraph, " PAGE ", "1")


def page_numbering(section, start: int | None = None):
    sect_pr = section._sectPr
    pg_num = sect_pr.find(qn("w:pgNumType"))
    if pg_num is None:
        pg_num = OxmlElement("w:pgNumType")
        sect_pr.append(pg_num)
    pg_num.set(qn("w:fmt"), "decimal")
    if start is None:
        pg_num.attrib.pop(qn("w:start"), None)
    else:
        pg_num.set(qn("w:start"), str(start))


def configure_section(section):
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(3)
    section.left_margin = Cm(3)
    section.right_margin = Cm(2)
    section.bottom_margin = Cm(2)
    section.header_distance = Cm(2)
    section.footer_distance = Cm(1.25)


def no_table_borders(table):
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:val"), "nil")
        borders.append(node)
    tbl_pr.append(borders)


def configure_styles(doc: Document):
    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Times New Roman"
    normal.font.size = Pt(12)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    p = normal.paragraph_format
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.first_line_indent = Cm(1.25)
    p.line_spacing = 1.5
    p.space_before = Pt(0)
    p.space_after = Pt(0)
    p.widow_control = True

    for level in (1, 2, 3):
        st = styles[f"Heading {level}"]
        st.font.name = "Times New Roman"
        st._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
        st.font.size = Pt(12)
        st.font.color.rgb = RGBColor(0, 0, 0)
        st.font.bold = True
        st.font.italic = level == 3
        pf = st.paragraph_format
        pf.alignment = WD_ALIGN_PARAGRAPH.LEFT
        pf.first_line_indent = Cm(0)
        pf.left_indent = Cm(0)
        pf.line_spacing = 1.5
        pf.space_before = Pt(18 if level == 1 else 12)
        pf.space_after = Pt(9 if level == 1 else 6)
        pf.keep_with_next = True
        pf.keep_together = True

    pre = styles.add_style("TituloPreTextual", WD_STYLE_TYPE.PARAGRAPH)
    pre.font.name = "Times New Roman"
    pre._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    pre.font.size = Pt(12)
    pre.font.bold = True
    pre.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pre.paragraph_format.first_line_indent = Cm(0)
    pre.paragraph_format.line_spacing = 1.5
    pre.paragraph_format.space_after = Pt(18)
    pre.paragraph_format.keep_with_next = True

    caption = styles["Caption"]
    caption.font.name = "Times New Roman"
    caption._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    caption.font.size = Pt(10)
    caption.font.color.rgb = RGBColor(0, 0, 0)
    caption.font.italic = False
    caption.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    caption.paragraph_format.first_line_indent = Cm(0)
    caption.paragraph_format.line_spacing = 1
    caption.paragraph_format.space_before = Pt(6)
    caption.paragraph_format.space_after = Pt(3)
    caption.paragraph_format.keep_with_next = True

    src = styles.add_style("FonteFigura", WD_STYLE_TYPE.PARAGRAPH)
    src.font.name = "Times New Roman"
    src._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    src.font.size = Pt(10)
    src.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    src.paragraph_format.first_line_indent = Cm(0)
    src.paragraph_format.line_spacing = 1
    src.paragraph_format.space_before = Pt(3)
    src.paragraph_format.space_after = Pt(6)

    ref = styles.add_style("Referencia", WD_STYLE_TYPE.PARAGRAPH)
    ref.font.name = "Times New Roman"
    ref._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    ref.font.size = Pt(12)
    ref.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    ref.paragraph_format.first_line_indent = Cm(0)
    ref.paragraph_format.line_spacing = 1
    ref.paragraph_format.space_before = Pt(0)
    ref.paragraph_format.space_after = Pt(12)

    code = styles.add_style("Codigo", WD_STYLE_TYPE.PARAGRAPH)
    code.font.name = "Courier New"
    code._element.rPr.rFonts.set(qn("w:eastAsia"), "Courier New")
    code.font.size = Pt(9)
    code.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    code.paragraph_format.first_line_indent = Cm(0)
    code.paragraph_format.left_indent = Cm(0.5)
    code.paragraph_format.right_indent = Cm(0.5)
    code.paragraph_format.line_spacing = 1
    code.paragraph_format.space_before = Pt(6)
    code.paragraph_format.space_after = Pt(6)

    list_style = styles["List Bullet"]
    list_style.font.name = "Times New Roman"
    list_style._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    list_style.font.size = Pt(12)
    list_style.paragraph_format.left_indent = Cm(1.25)
    list_style.paragraph_format.first_line_indent = Cm(-0.5)
    list_style.paragraph_format.line_spacing = 1.5
    list_style.paragraph_format.space_after = Pt(0)


def set_document_options(doc: Document):
    settings = doc.settings._element
    update = settings.find(qn("w:updateFields"))
    if update is None:
        update = OxmlElement("w:updateFields")
        settings.append(update)
    update.set(qn("w:val"), "true")
    compat = settings.find(qn("w:compat"))
    if compat is None:
        compat = OxmlElement("w:compat")
        settings.append(compat)
    setting = OxmlElement("w:compatSetting")
    setting.set(qn("w:name"), "compatibilityMode")
    setting.set(qn("w:uri"), "http://schemas.microsoft.com/office/word")
    setting.set(qn("w:val"), "15")
    compat.append(setting)


def add_body(doc: Document, text: str, *, no_indent=False, center=False, italic=False, bold=False):
    p = doc.add_paragraph(style="Normal")
    if no_indent:
        p.paragraph_format.first_line_indent = Cm(0)
    if center:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    r.bold = bold
    r.italic = italic
    set_lang(r)
    return p


def add_rich_body(doc: Document, parts: Sequence[tuple[str, dict]], *, no_indent=False, center=False):
    p = doc.add_paragraph(style="Normal")
    if no_indent:
        p.paragraph_format.first_line_indent = Cm(0)
    if center:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for text, fmt in parts:
        r = p.add_run(text)
        r.bold = fmt.get("bold", False)
        r.italic = fmt.get("italic", False)
        r.underline = fmt.get("underline", False)
        set_lang(r, fmt.get("lang", "pt-BR"))
    return p


def add_bullets(doc: Document, items: Iterable[str]):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.first_line_indent = Cm(-0.5)
        p.paragraph_format.left_indent = Cm(1.25)
        p.add_run(item)


def add_numbered(doc: Document, items: Iterable[str]):
    for idx, item in enumerate(items, 1):
        p = doc.add_paragraph(style="Normal")
        p.paragraph_format.left_indent = Cm(1.25)
        p.paragraph_format.first_line_indent = Cm(-1.25)
        p.add_run(f"{idx}. ").bold = True
        p.add_run(item)


def add_heading(doc: Document, text: str, level: int = 1, page_break=False):
    if page_break:
        doc.add_page_break()
    p = doc.add_paragraph(text, style=f"Heading {level}")
    return p


def add_pre_title(doc: Document, text: str):
    return doc.add_paragraph(text, style="TituloPreTextual")


def add_code(doc: Document, text: str):
    p = doc.add_paragraph(style="Codigo")
    p.paragraph_format.keep_together = True
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), "F2F2F2")
    p._p.get_or_add_pPr().append(shd)
    run = p.add_run(text)
    run.font.name = "Courier New"
    run.font.size = Pt(9)
    return p


def add_table(doc: Document, title: str, headers: Sequence[str], rows: Sequence[Sequence[str]], widths: Sequence[float] | None = None, font_size=9):
    number = len(TABLES) + 1
    bookmark = f"tab_{number}"
    cap = doc.add_paragraph(style="Caption")
    cap.add_run(f"Tabela {number} — {title}")
    add_bookmark(cap, bookmark)
    TABLES.append((f"Tabela {number} — {title}", bookmark))

    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table, "777777", "4")
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    set_cant_split(hdr)
    for i, value in enumerate(headers):
        cell = hdr.cells[i]
        set_cell_shading(cell, "D9EAF7")
        set_cell_margins(cell)
        if widths:
            set_cell_width(cell, widths[i])
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.first_line_indent = Cm(0)
        p.paragraph_format.line_spacing = 1
        r = p.add_run(str(value))
        r.bold = True
        r.font.name = "Times New Roman"
        r.font.size = Pt(font_size)
    for row_data in rows:
        cells = table.add_row().cells
        set_cant_split(table.rows[-1])
        for i, value in enumerate(row_data):
            cell = cells[i]
            set_cell_margins(cell)
            if widths:
                set_cell_width(cell, widths[i])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            p = cell.paragraphs[0]
            p.paragraph_format.first_line_indent = Cm(0)
            p.paragraph_format.line_spacing = 1
            p.paragraph_format.space_after = Pt(0)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(str(value))
            r.font.name = "Times New Roman"
            r.font.size = Pt(font_size)
    src = doc.add_paragraph("Fonte: elaborado pelo próprio autor (2026).", style="FonteFigura")
    return table


def add_figure(doc: Document, title: str, path: Path, width_cm=15.5, alt_text: str | None = None):
    number = len(FIGURES) + 1
    bookmark = f"fig_{number}"
    cap = doc.add_paragraph(style="Caption")
    cap.add_run(f"Figura {number} — {title}")
    add_bookmark(cap, bookmark)
    FIGURES.append((f"Figura {number} — {title}", bookmark))
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    run = p.add_run()
    inline = run.add_picture(str(path), width=Cm(width_cm))
    if alt_text:
        doc_pr = inline._inline.docPr
        doc_pr.set("descr", alt_text)
        doc_pr.set("title", title)
    doc.add_paragraph("Fonte: elaborado pelo próprio autor (2026).", style="FonteFigura")


def add_ref(doc: Document, prefix: str, title: str, suffix: str):
    p = doc.add_paragraph(style="Referencia")
    p.add_run(prefix)
    r = p.add_run(title)
    r.bold = True
    p.add_run(suffix)
    return p


def add_list_entry(doc: Document, label: str, bookmark: str):
    p = doc.add_paragraph(style="Normal")
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.tab_stops.add_tab_stop(Cm(15.5))
    p.add_run(label)
    p.add_run("\t")
    add_field(p, f" PAGEREF {bookmark} \\h ", "00")


def cover(doc: Document):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    r = p.add_run(INSTITUTION)
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.highlight_color = WD_COLOR_INDEX.YELLOW

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.space_before = Pt(60)
    r = p.add_run(AUTHOR)
    r.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.space_before = Pt(135)
    p.paragraph_format.line_spacing = 1.5
    r = p.add_run(TITLE)
    r.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.space_before = Pt(165)
    p.add_run(f"{CITY}\n{YEAR}").bold = True


def title_page(doc: Document):
    p = doc.add_paragraph(AUTHOR)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    p.runs[0].bold = True

    p = doc.add_paragraph(TITLE)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.space_before = Pt(120)
    p.paragraph_format.line_spacing = 1.5
    p.runs[0].bold = True

    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(8)
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.line_spacing = 1
    p.paragraph_format.space_before = Pt(90)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run("Trabalho de Conclusão de Curso apresentado ao Curso Técnico em Desenvolvimento de Sistemas da ")
    r = p.add_run(INSTITUTION)
    r.font.highlight_color = WD_COLOR_INDEX.YELLOW
    p.add_run(", como requisito parcial para obtenção do título de Técnico em Desenvolvimento de Sistemas.")
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(8)
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.line_spacing = 1
    r = p.add_run(f"Orientador(a): {ADVISOR}")
    r.font.highlight_color = WD_COLOR_INDEX.YELLOW

    p = doc.add_paragraph(f"{CITY}\n{YEAR}")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.space_before = Pt(115)
    p.runs[0].bold = True


def approval_page(doc: Document):
    add_pre_title(doc, "FOLHA DE APROVAÇÃO")
    p = add_body(doc, AUTHOR, no_indent=True, center=True, bold=True)
    p.paragraph_format.space_after = Pt(24)
    p = add_body(doc, TITLE, no_indent=True, center=True, bold=True)
    p.paragraph_format.space_after = Pt(36)
    p = doc.add_paragraph(style="Normal")
    p.paragraph_format.first_line_indent = Cm(0)
    p.add_run("Trabalho de Conclusão de Curso apresentado ao Curso Técnico em Desenvolvimento de Sistemas da ")
    r = p.add_run(INSTITUTION)
    r.font.highlight_color = WD_COLOR_INDEX.YELLOW
    p.add_run(", como requisito parcial para obtenção do título de Técnico em Desenvolvimento de Sistemas.")
    p = add_body(doc, "Aprovado em: ____ de __________________ de 2026.", no_indent=True, center=True)
    p.paragraph_format.space_before = Pt(24)
    p.paragraph_format.space_after = Pt(30)
    add_body(doc, "BANCA EXAMINADORA", no_indent=True, center=True, bold=True)
    for label in (
        f"{ADVISOR}\nOrientador(a) — {INSTITUTION}",
        f"[NOME DO(A) AVALIADOR(A) 1]\nAvaliador(a) — {INSTITUTION}",
        f"[NOME DO(A) AVALIADOR(A) 2]\nAvaliador(a) — {INSTITUTION}",
    ):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.first_line_indent = Cm(0)
        p.paragraph_format.space_before = Pt(30)
        p.add_run("____________________________________________\n")
        r = p.add_run(label)
        r.font.highlight_color = WD_COLOR_INDEX.YELLOW


def diagram_helpers():
    regular = ImageFont.truetype(FONT_REG, 27)
    small = ImageFont.truetype(FONT_REG, 23)
    bold = ImageFont.truetype(FONT_BOLD, 29)
    title_font = ImageFont.truetype(FONT_BOLD, 34)
    return regular, small, bold, title_font


def center_text(draw, box, text, font, fill="#172033", spacing=5):
    x1, y1, x2, y2 = box
    max_width = x2 - x1 - 30
    words = text.split()
    lines, current = [], ""
    for word in words:
        test = (current + " " + word).strip()
        if draw.textbbox((0, 0), test, font=font)[2] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    heights = [draw.textbbox((0, 0), line, font=font)[3] for line in lines]
    total = sum(heights) + spacing * max(0, len(lines) - 1)
    y = y1 + (y2 - y1 - total) / 2
    for line, h in zip(lines, heights):
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        draw.text((x1 + (x2 - x1 - w) / 2, y), line, font=font, fill=fill)
        y += h + spacing


def box(draw, coords, text, font, fill="#E8F1FA", outline="#315B7D", radius=18, width=3):
    draw.rounded_rectangle(coords, radius=radius, fill=fill, outline=outline, width=width)
    center_text(draw, coords, text, font)


def arrow(draw, start, end, fill="#315B7D", width=5):
    draw.line([start, end], fill=fill, width=width)
    x2, y2 = end
    x1, y1 = start
    import math
    angle = math.atan2(y2-y1, x2-x1)
    size = 16
    pts = [
        (x2, y2),
        (x2-size*math.cos(angle-0.55), y2-size*math.sin(angle-0.55)),
        (x2-size*math.cos(angle+0.55), y2-size*math.sin(angle+0.55)),
    ]
    draw.polygon(pts, fill=fill)


def canvas(title: str, size=(1600, 900)):
    img = Image.new("RGB", size, "white")
    draw = ImageDraw.Draw(img)
    _, _, _, title_font = diagram_helpers()
    draw.text((size[0]//2, 35), title, font=title_font, fill="#132238", anchor="ma")
    draw.line((90, 95, size[0]-90, 95), fill="#AFC7D8", width=3)
    return img, draw


def generate_diagrams():
    regular, small, bold, title_font = diagram_helpers()

    img, d = canvas("Arquitetura lógica da solução")
    box(d, (90, 200, 410, 500), "NAVEGADOR\nHTML + CSS + JavaScript\nSupabase JS v2", bold, "#E8F1FA")
    box(d, (640, 155, 970, 340), "GITHUB PAGES\nHospedagem estática\nHTTPS", bold, "#EAF6EC", "#347A48")
    box(d, (1120, 120, 1510, 700), "SUPABASE\n\nAuth\nPostgreSQL\nRLS + RPC\nStorage privado", bold, "#F0EBFA", "#674C91")
    arrow(d, (410, 310), (640, 250))
    arrow(d, (970, 250), (1120, 250))
    arrow(d, (1120, 480), (410, 430))
    box(d, (470, 570, 990, 760), "Dados e regras de negócio permanecem no servidor; o cliente recebe apenas o que as políticas autorizam.", regular, "#FFF4DD", "#9A6A17")
    p = ASSETS / "figura-arquitetura.png"; img.save(p)

    img, d = canvas("Etapas do desenvolvimento")
    labels = ["1. ESCOPO E\nREQUISITOS", "2. PROTÓTIPO\nDE INTERFACE", "3. MODELO\nDE DADOS", "4. IMPLEMENTAÇÃO\nINCREMENTAL", "5. TESTES E\nCORREÇÕES", "6. PUBLICAÇÃO E\nDOCUMENTAÇÃO"]
    xs = [50, 310, 570, 830, 1090, 1350]
    for i, (x, label) in enumerate(zip(xs, labels)):
        box(d, (x, 285, x+205, 545), label, small, "#E8F1FA" if i%2==0 else "#EAF6EC")
        if i < len(labels)-1:
            arrow(d, (x+205, 415), (xs[i+1], 415))
    box(d, (455, 660, 1145, 785), "Ciclo iterativo: falhas identificadas nos testes retornam à implementação e ao banco de dados.", regular, "#FFF4DD", "#9A6A17")
    p = ASSETS / "figura-processo.png"; img.save(p)

    img, d = canvas("Fluxo principal do estudante")
    coords = [(90,170,390,320),(650,170,950,320),(1210,170,1510,320),(1210,520,1510,690),(650,520,950,690),(90,520,390,690)]
    labels = ["VISITANTE\nLanding page", "CADASTRO OU LOGIN", "QUIZ DE NIVELAMENTO", "DASHBOARD E TRILHA", "ESTUDOS + PROJETOS", "CERTIFICADOS + PORTFÓLIO"]
    for c, label in zip(coords, labels): box(d, c, label, bold)
    for a,b in zip(coords[:3], coords[1:3]): arrow(d, (a[2],(a[1]+a[3])//2),(b[0],(b[1]+b[3])//2))
    arrow(d, (1360,320),(1360,520)); arrow(d,(1210,605),(950,605)); arrow(d,(650,605),(390,605))
    arrow(d,(240,520),(240,365)); d.text((260,405),"retorno",font=small,fill="#315B7D")
    p = ASSETS / "figura-fluxo.png"; img.save(p)

    img, d = canvas("Modelo lógico de dados")
    box(d, (610,320,990,540), "PROFILES\nPK/FK id → auth.users\nname, age, email\nxp, level, track\nquiz_done, is_admin\nis_blocked, portfolio_public", small, "#FFF4DD", "#9A6A17")
    nodes = [
        ((60,150,420,320), "QUIZ_ANSWERS\nN respostas por usuário"),
        ((60,600,420,770), "SUBJECT_PROGRESS\nN matérias visualizadas"),
        ((1180,120,1540,290), "CERTIFICATES\nN certificados"),
        ((1180,610,1540,780), "USER_PROJECTS\nN projetos concluídos"),
        ((610,650,990,820), "PROJECTS\nCatálogo de 9 projetos"),
        ((610,120,990,250), "AUTH.USERS\nIdentidade Supabase"),
    ]
    for c,t in nodes: box(d,c,t,small,"#E8F1FA")
    arrow(d,(800,250),(800,320)); arrow(d,(610,390),(420,270)); arrow(d,(610,470),(420,680)); arrow(d,(990,390),(1180,240)); arrow(d,(990,500),(1180,680)); arrow(d,(1180,720),(990,735))
    p = ASSETS / "figura-dados.png"; img.save(p)

    img, d = canvas("Regras de experiência e progressão")
    entries = [
        ("QUIZ", "+50 XP", "uma vez; 3 respostas válidas"),
        ("VISUALIZAR MATÉRIA", "+10 XP", "uma vez por matéria válida"),
        ("CONCLUIR EXERCÍCIO", "+30 XP", "certificado único por matéria"),
        ("CONCLUIR PROJETO", "+100 / +150 / +200 XP", "valor do catálogo; uma vez por projeto"),
    ]
    ys=[160,320,480,640]
    for (name,xp,rule),y in zip(entries,ys):
        box(d,(100,y,480,y+115),name,bold,"#E8F1FA"); arrow(d,(480,y+57),(610,y+57)); box(d,(610,y,950,y+115),xp,bold,"#EAF6EC","#347A48"); arrow(d,(950,y+57),(1060,y+57)); box(d,(1060,y,1510,y+115),rule,small,"#FFF4DD","#9A6A17")
    p = ASSETS / "figura-xp.png"; img.save(p)

    img, d = canvas("Publicação e operação")
    box(d,(80,260,390,520),"DESENVOLVEDOR\nGit + testes locais",bold)
    box(d,(610,180,990,360),"REPOSITÓRIO GITHUB\nbranch principal",bold,"#EAF6EC","#347A48")
    box(d,(1210,120,1520,320),"GITHUB PAGES\nfrontend estático",bold,"#F0EBFA","#674C91")
    box(d,(1210,540,1520,740),"SUPABASE\nbackend gerenciado",bold,"#FFF4DD","#9A6A17")
    box(d,(610,590,990,760),"SQL EDITOR\nschema + migrações",bold,"#E8F1FA")
    arrow(d,(390,340),(610,270)); arrow(d,(990,270),(1210,220)); arrow(d,(390,460),(610,670)); arrow(d,(990,670),(1210,640)); arrow(d,(1365,320),(1365,540))
    p = ASSETS / "figura-publicacao.png"; img.save(p)

    return {
        "arquitetura": ASSETS / "figura-arquitetura.png",
        "processo": ASSETS / "figura-processo.png",
        "fluxo": ASSETS / "figura-fluxo.png",
        "dados": ASSETS / "figura-dados.png",
        "xp": ASSETS / "figura-xp.png",
        "publicacao": ASSETS / "figura-publicacao.png",
    }


def build_document():
    diagrams = generate_diagrams()
    doc = Document()
    configure_styles(doc)
    set_document_options(doc)
    for section in doc.sections:
        configure_section(section)

    props = doc.core_properties
    props.title = "Pratica.dev 2.0 — Trabalho de Conclusão de Curso"
    props.subject = "Plataforma web gamificada para apoio à formação em Desenvolvimento de Sistemas"
    props.author = "João Caetano"
    props.keywords = "gamificação; educação tecnológica; aplicação web; Supabase; desenvolvimento de sistemas"
    props.comments = "Documento editável em conformidade geral com ABNT NBR 14724:2024, 10520:2023, 6023:2025 e 6028:2021."

    # Capa em seção própria: não é contada.
    cover(doc)

    # Pré-textuais: a contagem começa na folha de rosto, sem número visível.
    pre_section = doc.add_section(WD_SECTION.NEW_PAGE)
    configure_section(pre_section)
    page_numbering(pre_section, start=1)
    pre_section.header.is_linked_to_previous = False
    pre_section.header.paragraphs[0].clear()
    title_page(doc)

    doc.add_page_break()
    approval_page(doc)

    doc.add_page_break()
    add_pre_title(doc, "RESUMO")
    resumo = (
        "Este trabalho apresenta o desenvolvimento do Pratica.dev 2.0, uma plataforma web gamificada destinada a apoiar estudantes do curso Técnico em Desenvolvimento de Sistemas na organização dos estudos, na prática de projetos e na apresentação de suas conquistas. O problema abordado é a dispersão de conteúdos, exercícios, registros de progresso e evidências de aprendizagem em ferramentas distintas, condição que dificulta a percepção de evolução e a construção de portfólio. O objetivo geral consistiu em projetar, implementar e verificar uma aplicação web responsiva que centralizasse trilhas, doze matérias, exercícios, nove projetos, pontuação por experiência, níveis, certificados e portfólio público, com controle de acesso adequado. A pesquisa caracteriza-se como aplicada, exploratória e descritiva, com abordagem qualitativa, pesquisa bibliográfica e documental e desenvolvimento incremental de um artefato de software. A solução utiliza HTML5, CSS3 e JavaScript no cliente; Supabase Auth, PostgreSQL, funções remotas, segurança em nível de linha e armazenamento privado no backend; e GitHub Pages para publicação do frontend. As regras de pontuação são calculadas no banco, com validação dos identificadores e operações idempotentes para impedir recompensas duplicadas. A verificação automatizada, executada em 6 de outubro de 2026, totalizou 263 verificações aprovadas: 161 de regressão, 47 da jornada principal e 55 de funcionalidades complementares. Também foi realizada auditoria das dependências de desenvolvimento, sem vulnerabilidades conhecidas no nível configurado após a atualização do arquivo de bloqueio. Como resultado, obteve-se um protótipo funcional com autenticação, nivelamento, centro de estudos, certificados visuais, administração, bloqueio de contas, avatar privado e compartilhamento controlado do portfólio. Conclui-se que o artefato atende aos objetivos técnicos definidos e constitui base evolutiva para estudos de usabilidade e avaliação pedagógica com usuários reais."
    )
    p = add_body(doc, resumo, no_indent=True)
    p.paragraph_format.line_spacing = 1.5
    p = add_rich_body(doc, [("Palavras-chave: ", {"bold": True}), ("gamificação; educação tecnológica; aplicação web; Supabase; desenvolvimento de sistemas.", {})], no_indent=True)
    p.paragraph_format.space_before = Pt(12)

    doc.add_page_break()
    add_pre_title(doc, "ABSTRACT")
    abstract = (
        "This study presents the development of Pratica.dev 2.0, a gamified web platform designed to support students enrolled in a Technical Program in Systems Development in organizing study activities, practicing projects, and presenting their achievements. The addressed problem is the dispersion of content, exercises, progress records, and learning evidence across different tools, which hinders the perception of progress and portfolio building. The general objective was to design, implement, and verify a responsive web application that centralizes learning paths, twelve subjects, exercises, nine projects, experience points, levels, certificates, and a public portfolio with appropriate access control. The research is applied, exploratory, and descriptive, adopts a qualitative approach, and combines bibliographic and documentary research with the incremental development of a software artifact. The solution uses HTML5, CSS3, and JavaScript on the client side; Supabase Auth, PostgreSQL, remote procedures, row-level security, and private storage on the backend; and GitHub Pages for frontend publishing. Scoring rules are computed in the database, with identifier validation and idempotent operations to prevent duplicate rewards. Automated verification performed on October 6, 2026, comprised 263 successful checks: 161 regression checks, 47 main-journey checks, and 55 complementary-feature checks. A development-dependency audit was also completed, with no known vulnerabilities at the configured level after lockfile updates. The result is a functional prototype featuring authentication, placement assessment, a study center, visual certificates, administration, account blocking, private avatars, and controlled portfolio sharing. The artifact meets the defined technical objectives and provides an evolutionary foundation for future usability studies and pedagogical evaluation with real users."
    )
    p = add_body(doc, abstract, no_indent=True)
    p.paragraph_format.line_spacing = 1.5
    p = add_rich_body(doc, [("Keywords: ", {"bold": True, "lang": "en-US"}), ("gamification; technology education; web application; Supabase; systems development.", {"lang": "en-US"})], no_indent=True)
    p.paragraph_format.space_before = Pt(12)

    # Listas pré-textuais. PAGEREF é atualizado automaticamente no Word.
    doc.add_page_break()
    add_pre_title(doc, "LISTA DE ILUSTRAÇÕES")
    future_figures = [
        ("Figura 1 — Arquitetura lógica da solução", "fig_1"),
        ("Figura 2 — Etapas do desenvolvimento", "fig_2"),
        ("Figura 3 — Fluxo principal do estudante", "fig_3"),
        ("Figura 4 — Modelo lógico de dados", "fig_4"),
        ("Figura 5 — Regras de experiência e progressão", "fig_5"),
        ("Figura 6 — Publicação e operação", "fig_6"),
    ]
    for label, bookmark in future_figures:
        add_list_entry(doc, label, bookmark)

    doc.add_page_break()
    add_pre_title(doc, "LISTA DE TABELAS")
    future_tables = [
        "Etapas metodológicas", "Tecnologias e responsabilidades", "Requisitos funcionais", "Requisitos não funcionais",
        "Regras de negócio", "Entidades do banco de dados", "Regras de pontuação", "Matriz de controle de acesso",
        "Resultados dos testes automatizados", "Rastreabilidade entre objetivos e evidências", "Limitações e ações de evolução",
        "Dicionário de dados — profiles", "Dicionário de dados — quiz_answers e subject_progress", "Dicionário de dados — projetos e certificados",
        "Casos de teste manual recomendados", "Checklist de normalização e entrega",
    ]
    for idx, title in enumerate(future_tables, 1):
        add_list_entry(doc, f"Tabela {idx} — {title}", f"tab_{idx}")

    doc.add_page_break()
    add_pre_title(doc, "LISTA DE ABREVIATURAS E SIGLAS")
    acronyms = [
        ("ABNT", "Associação Brasileira de Normas Técnicas"), ("API", "Application Programming Interface"),
        ("BaaS", "Backend as a Service"), ("CSS", "Cascading Style Sheets"), ("DOM", "Document Object Model"),
        ("HTML", "HyperText Markup Language"), ("HTTP", "Hypertext Transfer Protocol"), ("HTTPS", "Hypertext Transfer Protocol Secure"),
        ("JWT", "JSON Web Token"), ("PNG", "Portable Network Graphics"), ("RLS", "Row-Level Security"),
        ("RPC", "Remote Procedure Call"), ("SPA", "Single-Page Application"), ("SQL", "Structured Query Language"),
        ("TCC", "Trabalho de Conclusão de Curso"), ("UI", "User Interface"), ("URL", "Uniform Resource Locator"),
        ("UX", "User Experience"), ("XP", "Experience Points"), ("XSS", "Cross-Site Scripting"),
    ]
    for sigla, desc in acronyms:
        p = doc.add_paragraph(style="Normal")
        p.paragraph_format.first_line_indent = Cm(0)
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.tab_stops.add_tab_stop(Cm(3))
        p.add_run(sigla).bold = True
        p.add_run(f"\t{desc}")

    doc.add_page_break()
    add_pre_title(doc, "SUMÁRIO")
    p = doc.add_paragraph()
    p.paragraph_format.first_line_indent = Cm(0)
    add_field(p, ' TOC \\o "1-3" \\h \\z \\u ', "Atualize o sumário no Microsoft Word (Ctrl+A e F9).")

    # Parte textual: nova seção, paginação arábica visível e contínua.
    text_section = doc.add_section(WD_SECTION.NEW_PAGE)
    configure_section(text_section)
    page_numbering(text_section, start=None)
    text_section.header.is_linked_to_previous = False
    header_p = text_section.header.paragraphs[0]
    header_p.clear()
    header_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    header_p.paragraph_format.first_line_indent = Cm(0)
    run = header_p.add_run()
    run.font.name = "Times New Roman"
    run.font.size = Pt(10)
    add_page_number(header_p)

    # 1 INTRODUÇÃO
    add_heading(doc, "1 INTRODUÇÃO", 1)
    add_heading(doc, "1.1 Contextualização", 2)
    add_body(doc, "A formação em Desenvolvimento de Sistemas exige articulação entre fundamentos, prática contínua, acompanhamento do progresso e demonstração concreta das competências adquiridas. Em cursos técnicos, o estudante precisa transitar entre linguagens, banco de dados, redes, controle de versão e integração de serviços, ao mesmo tempo que constrói projetos capazes de evidenciar sua evolução. Quando conteúdos, exercícios e resultados permanecem distribuídos em diferentes ferramentas, torna-se mais difícil reconhecer o próximo passo e organizar um portfólio coerente.")
    add_body(doc, "As metodologias ativas deslocam o estudante para uma posição de participação na aprendizagem e valorizam atividades nas quais ele toma decisões, produz e recebe retorno sobre suas ações (Bacich; Moran, 2018). Nesse contexto, elementos de gamificação, como desafios, pontos, níveis e feedback, podem funcionar como sinalizadores de progresso, desde que estejam vinculados a objetivos formativos e não sejam tratados como finalidade isolada.")
    add_body(doc, "O Pratica.dev 2.0 foi concebido como um ambiente web único para reunir nivelamento inicial, conteúdos de doze matérias, testes rápidos, exercícios, projetos com briefing, certificados visuais e um portfólio compartilhável. A proposta não substitui professor, currículo ou ambiente virtual institucional. Seu recorte é apoiar a organização da prática e dar visibilidade às conquistas do estudante por meio de uma experiência responsiva e acessível pelo navegador.")

    add_heading(doc, "1.2 Problema de pesquisa", 2)
    add_body(doc, "O problema que orienta este trabalho é a fragmentação da jornada de estudo: conteúdos, atividades, pontuação, certificados e evidências de projetos podem ficar dispersos, reduzindo a clareza sobre o progresso e aumentando o esforço necessário para apresentar as competências construídas.")
    p = add_body(doc, "Como uma aplicação web gamificada pode centralizar estudos, prática, progresso e portfólio de estudantes de Desenvolvimento de Sistemas, preservando integridade das recompensas, privacidade e facilidade de uso?", no_indent=True, italic=True)
    p.paragraph_format.left_indent = Cm(2)
    p.paragraph_format.right_indent = Cm(2)
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(12)

    add_heading(doc, "1.3 Objetivos", 2)
    add_heading(doc, "1.3.1 Objetivo geral", 3)
    add_body(doc, "Desenvolver e verificar uma plataforma web gamificada que centralize conteúdos, atividades práticas, registro de progresso, certificados e portfólio para estudantes do curso Técnico em Desenvolvimento de Sistemas.")
    add_heading(doc, "1.3.2 Objetivos específicos", 3)
    add_bullets(doc, [
        "levantar requisitos funcionais, não funcionais e regras de negócio para a jornada do estudante e para a administração da plataforma;",
        "implementar autenticação, perfil, quiz de nivelamento, trilhas recomendadas, centro de estudos, projetos, certificados e portfólio público;",
        "estruturar persistência relacional, políticas de segurança em nível de linha e funções de banco para operações sensíveis;",
        "aplicar gamificação por XP, níveis, progresso e recompensas com prevenção de duplicidade e validação no servidor;",
        "proteger dados acadêmicos, fotos de perfil e ações administrativas de acordo com o princípio do menor privilégio;",
        "verificar a jornada principal, regressões, comportamento responsivo e controles de segurança por testes automatizados;",
        "documentar arquitetura, implantação, operação, limitações e possibilidades de evolução do sistema."
    ])

    add_heading(doc, "1.4 Justificativa", 2)
    add_body(doc, "A relevância educacional da solução está na organização de uma sequência de ações observáveis: diagnosticar interesses, estudar, praticar, concluir e compartilhar. O feedback imediato ajuda o estudante a localizar-se no percurso, enquanto briefings de projetos aproximam a atividade escolar da forma como demandas são apresentadas em ambientes profissionais. O portfólio público cria uma ponte entre o processo formativo e a demonstração de resultados, sem expor automaticamente dados pessoais.")
    add_body(doc, "Do ponto de vista técnico, o projeto integra conhecimentos centrais do curso: estrutura semântica em HTML, responsividade em CSS, programação assíncrona em JavaScript, modelagem relacional, autenticação, autorização, armazenamento de arquivos, versionamento, testes e publicação. Assim, o próprio artefato constitui evidência de aplicação interdisciplinar.")
    add_body(doc, "A justificativa também envolve segurança. Aplicações educacionais mantêm perfis e registros individuais; portanto, ocultar botões no cliente não é suficiente. A autorização deve ocorrer no servidor e no banco. A arquitetura adotada utiliza concessões por papel, RLS e funções que revalidam identidade e estado da conta, alinhando-se ao entendimento de que autenticação confirma quem é o usuário e autorização define quais recursos ele pode acessar (Supabase, 2026a).")

    add_heading(doc, "1.5 Delimitação do trabalho", 2)
    add_body(doc, "O escopo compreende um protótipo funcional publicado como aplicação web de página única. O sistema oferece doze matérias introdutórias, nove projetos cadastrados, certificados visuais, portfólio e administração. Não fazem parte do recorte: aulas síncronas, correção automática do código produzido pelo estudante, emissão de certificado institucional com validade jurídica, recuperação de senha personalizada, pagamentos, comunicação em tempo real, aplicativo nativo ou estudo experimental de eficácia pedagógica.")
    add_body(doc, "Os testes automatizados usam simulações do navegador e substitutos das integrações externas. Eles verificam comportamento e contratos do cliente, mas não equivalem a ensaios de carga, auditoria profissional de segurança, teste completo de compatibilidade entre navegadores ou avaliação com estudantes reais. Essas fronteiras são retomadas na seção de limitações.")

    add_heading(doc, "1.6 Organização do trabalho", 2)
    add_body(doc, "Após esta introdução, a seção 2 apresenta os conceitos que fundamentam gamificação, aprendizagem ativa, desenvolvimento web, persistência, segurança e qualidade. A seção 3 descreve o método. A seção 4 organiza requisitos e regras de negócio. A seção 5 detalha o desenvolvimento. A seção 6 discute resultados e validação. A seção 7 reúne as conclusões. Referências e apêndices complementam a documentação com instalação, dicionário de dados, testes, manual de uso e checklist de entrega.")

    # 2 REFERENCIAL TEÓRICO
    add_heading(doc, "2 REFERENCIAL TEÓRICO", 1, page_break=True)
    add_heading(doc, "2.1 Aprendizagem ativa e tecnologia", 2)
    add_body(doc, "A adoção de tecnologia não garante, por si só, aprendizagem. Seu valor depende da relação entre objetivos, atividades e feedback. Bacich e Moran (2018) apresentam metodologias ativas como abordagens que envolvem participação, experimentação e reflexão, nas quais o estudante assume maior responsabilidade pelo percurso. Em uma plataforma de apoio, isso se traduz em permitir escolha de trilha, acesso a conteúdos, resolução de desafios, visualização de progresso e produção de projetos.")
    add_body(doc, "No Pratica.dev 2.0, o conteúdo teórico é acompanhado de exemplo, exercício e teste rápido. A matéria somente é considerada concluída quando o estudante aciona a conclusão e recebe o certificado; apenas abrir o conteúdo registra exploração. Essa separação evita confundir acesso com conclusão e torna o indicador de progresso mais compreensível.")

    add_heading(doc, "2.2 Gamificação aplicada ao contexto educacional", 2)
    add_body(doc, "Deterding et al. (2011) definem gamificação como o uso de elementos de design de jogos em contextos que não são jogos. Kapp (2012) amplia a discussão ao relacionar mecânicas, estética e pensamento de jogos ao engajamento, à motivação, à aprendizagem e à solução de problemas. A estratégia não consiste em transformar todo conteúdo em jogo, mas em empregar recursos como objetivos, desafios, pontos, níveis, retorno imediato e progressão para orientar ações.")
    add_body(doc, "A pontuação é um estímulo extrínseco e precisa manter correspondência com ações relevantes. Se a mesma chamada puder ser repetida indefinidamente, o indicador perde significado. Por esse motivo, o projeto calcula XP no banco, valida os identificadores aceitos e utiliza chaves únicas ou bloqueio de linha para tornar as operações idempotentes. O nível resulta de uma regra determinística: cada faixa de cem pontos acrescenta um nível, com nível mínimo igual a um.")
    add_body(doc, "Também se evitou um ranking público. A interface enfatiza a evolução individual por dashboard, contador de matérias, certificados e projetos. Essa escolha reduz competição desnecessária e mantém o foco na trajetória do próprio estudante.")

    add_heading(doc, "2.3 Aplicações web e experiência responsiva", 2)
    add_body(doc, "Aplicações web combinam HTML para estrutura, CSS para apresentação e JavaScript para comportamento. A documentação MDN organiza essas tecnologias como fundamentos do desenvolvimento para a Web e destaca o papel das interfaces, APIs e compatibilidade entre navegadores (MDN Web Docs, 2026). O modelo de página única adotado atualiza seções da interface sem recarregar documentos completos, mantendo estado de sessão e tornando a navegação entre abas mais direta.")
    add_body(doc, "Responsividade significa reorganizar conteúdo e controles conforme a largura disponível. No sistema, o menu lateral permanece fixo em telas amplas e se transforma em gaveta em telas de até 768 pixels. A gaveta informa seu estado por aria-expanded, fecha por tecla Esc, clique no fundo, escolha de aba ou mudança para o layout de desktop. Há foco visível para teclado, formulários semânticos e textos alternativos para fotos. Tais medidas são compatíveis com princípios de operabilidade e percepção da WCAG 2.2, embora o trabalho não reivindique conformidade formal sem auditoria completa (W3C, 2023).")

    add_heading(doc, "2.4 Backend como serviço, persistência e segurança em nível de linha", 2)
    add_body(doc, "O modelo Backend as a Service fornece componentes gerenciados de autenticação, banco, armazenamento e APIs. No projeto, o Supabase conecta o cliente ao PostgreSQL por biblioteca JavaScript. A autenticação emite tokens e integra a identidade às políticas do banco, permitindo que cada requisição seja avaliada segundo o usuário autenticado (Supabase, 2026a).")
    add_body(doc, "O PostgreSQL dispõe de Row-Level Security, mecanismo que filtra, por política, quais linhas podem ser lidas ou alteradas por um papel. Quando RLS está habilitada e nenhuma política aplicável existe, o comportamento padrão é negar o acesso (PostgreSQL Global Development Group, 2026). O Supabase recomenda combinar concessões de objeto com RLS, pois grants determinam se o papel alcança a tabela ou função, enquanto as políticas determinam quais linhas são permitidas (Supabase, 2026b).")
    add_body(doc, "Essa combinação é importante em uma aplicação cujo navegador possui uma chave publicável. A chave anon identifica o projeto e não deve ser confundida com segredo administrativo; a proteção depende das políticas. Já a chave service_role contorna RLS e não pode estar no frontend. No Pratica.dev 2.0, usuários autenticados acessam o próprio contexto, administradores são revalidados no banco e visitantes anônimos recebem somente colunas específicas de perfis voluntariamente publicados.")
    add_figure(doc, "Arquitetura lógica da solução", diagrams["arquitetura"], alt_text="Diagrama da arquitetura com navegador, GitHub Pages e Supabase Auth, PostgreSQL, RLS, RPC e Storage privado.")

    add_heading(doc, "2.5 Autenticação, autorização e princípio do menor privilégio", 2)
    add_body(doc, "A OWASP (2021) destaca falhas de identificação e autenticação entre riscos relevantes de aplicações web e recomenda gerenciamento seguro de sessão, ausência de credenciais padrão, proteção contra ataques automatizados e encerramento correto da sessão. Autenticação, entretanto, não substitui autorização. Uma conta autenticada não deve, por esse fato, ler registros de outro estudante ou conceder XP a si mesma por alteração direta.")
    add_body(doc, "O princípio do menor privilégio orientou três decisões: exposição pública por coluna, armazenamento privado de avatar com URL assinada e encapsulamento das recompensas em funções de banco. Campos sensíveis, como e-mail, idade e papel administrativo, não são concedidos ao visitante. Contas bloqueadas deixam de entrar, executar funções de XP e aparecer em portfólios públicos.")

    add_heading(doc, "2.6 Qualidade, testes e rastreabilidade", 2)
    add_body(doc, "Qualidade de software abrange correção funcional, segurança, usabilidade, compatibilidade, manutenibilidade e confiabilidade. Neste trabalho, essas características foram tratadas por requisitos verificáveis e suítes automatizadas. A rastreabilidade liga objetivos, requisitos, implementação e evidências de teste, reduzindo a possibilidade de declarar uma função sem demonstrar onde ela foi construída e como foi verificada.")
    add_body(doc, "Testes de regressão protegem comportamentos já existentes após alterações. Testes de jornada exercitam uma sequência próxima ao uso real, enquanto verificações complementares se concentram em recursos específicos, como menu móvel, certificado e painel administrativo. Como as integrações externas são simuladas, a estratégia privilegia determinismo e execução local rápida; testes integrados com um projeto Supabase isolado permanecem como evolução.")

    add_heading(doc, "2.7 Versionamento e publicação", 2)
    add_body(doc, "O Git registra o histórico e facilita revisão e reversão. O GitHub Pages é um serviço de hospedagem estática que publica arquivos HTML, CSS e JavaScript diretamente de um repositório (GitHub, 2026). Essa característica é compatível com o frontend do projeto, pois autenticação, persistência e regras de negócio são fornecidas pelo Supabase por HTTPS. A separação simplifica a publicação, mas cria dependência de serviços externos e de conectividade.")

    # 3 METODOLOGIA
    add_heading(doc, "3 METODOLOGIA", 1, page_break=True)
    add_heading(doc, "3.1 Caracterização da pesquisa", 2)
    add_body(doc, "O trabalho caracteriza-se, quanto à finalidade, como pesquisa aplicada, pois produz uma solução para um problema prático; quanto aos objetivos, como exploratória e descritiva, por investigar conceitos e descrever requisitos, arquitetura e comportamento do artefato; e, quanto à abordagem, como qualitativa, uma vez que analisa adequação funcional e técnica sem inferência estatística sobre uma população. A classificação toma como referência a organização metodológica de projetos de pesquisa apresentada por Gil (2022).")
    add_body(doc, "Os procedimentos incluem pesquisa bibliográfica sobre gamificação, aprendizagem, segurança e tecnologias web; pesquisa documental em documentação oficial; análise dos arquivos do repositório; desenvolvimento incremental; e testes automatizados. Não houve coleta de dados com participantes nem experimento educacional. Portanto, conclusões sobre motivação ou desempenho não são atribuídas ao sistema.")

    add_heading(doc, "3.2 Etapas do desenvolvimento", 2)
    add_figure(doc, "Etapas do desenvolvimento", diagrams["processo"], alt_text="Fluxo com seis etapas: escopo e requisitos, protótipo, modelo de dados, implementação, testes e publicação.")
    add_body(doc, "A Figura 2 sintetiza o processo. O trabalho não seguiu uma cascata rígida: resultados de teste motivaram ajustes no código, no esquema SQL e na documentação. Esse ciclo foi particularmente relevante nas regras de XP, nas permissões do portfólio público, no armazenamento de avatar e no bloqueio de contas.")
    add_table(doc, "Etapas metodológicas", ["Etapa", "Atividades", "Evidências"], [
        ("1. Definição", "Delimitação do problema, público, objetivos e escopo.", "Problema de pesquisa e objetivos."),
        ("2. Requisitos", "Identificação de atores, funções, restrições e regras.", "RF, RNF e regras de negócio."),
        ("3. Projeto", "Arquitetura, navegação, dados e segurança.", "Diagramas e schema.sql."),
        ("4. Implementação", "Construção incremental do frontend e integrações.", "HTML, CSS, JavaScript e SQL."),
        ("5. Verificação", "Regressão, jornada principal, verificações extras e auditoria de dependências.", "263 verificações aprovadas e auditoria sem vulnerabilidades conhecidas."),
        ("6. Publicação", "Hospedagem estática, configuração do backend e documentação.", "GitHub Pages, README, documentação técnica e TCC."),
    ], [2.1, 7.6, 6.3])

    add_heading(doc, "3.3 Levantamento e análise de requisitos", 2)
    add_body(doc, "Os requisitos foram derivados do propósito do produto e refinados pela inspeção das telas, fluxos e operações existentes no repositório do projeto (Caetano, 2026). Para cada função, buscou-se identificar a fonte da verdade, o ator autorizado, a persistência necessária e a evidência de teste. Requisitos de segurança foram formulados separadamente para evitar que aspectos como privacidade e autorização ficassem implícitos.")

    add_heading(doc, "3.4 Tecnologias e instrumentos", 2)
    add_table(doc, "Tecnologias e responsabilidades", ["Tecnologia", "Uso no projeto", "Justificativa"], [
        ("HTML5", "Estrutura das telas e formulários.", "Padrão aberto executado diretamente no navegador."),
        ("CSS3 + Tailwind CSS", "Tema, componentes, diploma e responsividade.", "Combina utilitários com estilos específicos do produto."),
        ("JavaScript ES2020+", "Estado, renderização, eventos, canvas e chamadas assíncronas.", "Dispensa etapa de compilação e atende ao escopo."),
        ("Supabase JS v2", "Sessão, consultas, RPC e Storage.", "Cliente oficial integrado aos serviços do backend."),
        ("PostgreSQL", "Persistência, integridade, políticas e funções.", "Suporta modelo relacional, transações e RLS."),
        ("Git e GitHub", "Versionamento, revisão e publicação.", "Histórico centralizado e integração com Pages."),
        ("jsdom", "Simulação do DOM nos testes.", "Permite testes locais determinísticos sem navegador real."),
        ("Node.js", "Execução das três suítes de teste.", "Automatiza verificação do cliente e de artefatos SQL."),
    ], [3.2, 6.3, 6.5])

    add_heading(doc, "3.5 Procedimento de verificação", 2)
    add_body(doc, "Em 6 de outubro de 2026, no estado do repositório utilizado para este documento, foi executado o comando npm test. Ele encadeou as suítes regressao.js, smoke-completo.js e verificacao-extra.js. As integrações com Supabase, clipboard, impressão e armazenamento foram substituídas por mocks quando necessário. Cada verificação encerra a execução em caso de falha, de forma que o resultado final somente é exibido quando todas passam.")
    add_body(doc, "Também foi executado npm audit --audit-level=high. Dependências transitivas vulneráveis do ambiente de teste foram atualizadas no arquivo package-lock.json, e a auditoria final informou zero vulnerabilidades conhecidas. Esse resultado é temporal: bases de vulnerabilidades evoluem e a auditoria deve ser repetida antes da entrega e de futuras publicações.")

    add_heading(doc, "3.6 Tratamento ético, privacidade e limites de validade", 2)
    add_body(doc, "O trabalho não utilizou dados pessoais exportados do ambiente de produção nem realizou pesquisa com seres humanos. Exemplos e testes empregam identidades fictícias. A aplicação, porém, processa nome, idade, e-mail, respostas de nivelamento e progresso; por isso, a publicação do portfólio é opcional e os campos expostos foram minimizados. A foto permanece em bucket privado e somente é entregue por URL temporária quando as políticas autorizam.")
    add_body(doc, "A validade dos resultados está restrita ao comportamento exercitado pelas suítes e à análise estática dos artefatos. Não se conclui que a aplicação melhora desempenho escolar, apenas que as funções técnicas definidas foram implementadas e verificadas no escopo indicado.")

    # 4 ANÁLISE E ESPECIFICAÇÃO
    add_heading(doc, "4 ANÁLISE E ESPECIFICAÇÃO DO SISTEMA", 1, page_break=True)
    add_heading(doc, "4.1 Visão do produto e público-alvo", 2)
    add_body(doc, "O produto é uma plataforma de apoio para estudantes em fase inicial ou intermediária de formação técnica. O usuário principal busca uma orientação simples sobre o que estudar, atividades para praticar e uma forma de reunir resultados. O ator administrador acompanha cadastros e progresso, consulta detalhes, redefine XP, promove papéis, bloqueia contas e remove dados acadêmicos. O visitante anônimo acessa somente a landing page e portfólios que tenham sido publicados pelo proprietário.")
    add_body(doc, "A proposta de valor é centralização com progressão visível. Após o cadastro, o estudante responde a três questões de nivelamento, recebe uma trilha e passa a navegar por matérias e projetos. Conquistas persistidas alimentam certificados e portfólio. A publicação externa é reversível: o estudante pode tornar o perfil privado novamente a qualquer momento.")
    add_figure(doc, "Fluxo principal do estudante", diagrams["fluxo"], alt_text="Fluxo do estudante desde visitante, cadastro, quiz e dashboard até estudos, projetos, certificados e portfólio.")

    add_heading(doc, "4.2 Atores", 2)
    add_bullets(doc, [
        "Visitante: consulta a apresentação do produto, abre autenticação, visualiza modelo de certificado e acessa portfólio publicado por link válido;",
        "Estudante autenticado: gerencia o próprio perfil, responde ao nivelamento, estuda, conclui exercícios e projetos, recebe XP, certificados e controla a publicação do portfólio;",
        "Administrador: possui as funções do estudante e, adicionalmente, consulta alunos, altera papel administrativo, redefine XP, bloqueia/desbloqueia, abre detalhes e exclui dados acadêmicos de terceiros;",
        "Serviços externos: Supabase autentica e persiste; GitHub Pages entrega os arquivos estáticos; fontes e bibliotecas CDN complementam a interface."
    ])

    add_heading(doc, "4.3 Requisitos funcionais", 2)
    rf_rows = [
        ("RF01", "Permitir cadastro com nome, idade, e-mail e senha, validando os campos antes da rede.", "Visitante", "Alta"),
        ("RF02", "Autenticar por e-mail e senha, restaurar sessão e permitir logout.", "Visitante/estudante", "Alta"),
        ("RF03", "Aplicar quiz inicial de três perguntas e salvar nível declarado, área e objetivo.", "Estudante", "Alta"),
        ("RF04", "Exibir dashboard com nome, nível, XP, trilha, progresso e recomendação.", "Estudante", "Alta"),
        ("RF05", "Apresentar perfil, avatar, dados acadêmicos e respostas do nivelamento.", "Estudante", "Alta"),
        ("RF06", "Disponibilizar doze matérias com tópicos, exemplo, exercício, erros comuns, links e teste rápido.", "Estudante", "Alta"),
        ("RF07", "Registrar visualização e conclusão de matéria, concedendo XP somente quando aplicável.", "Estudante", "Alta"),
        ("RF08", "Emitir certificado visual por matéria concluída, com visualização, PNG e impressão/PDF.", "Estudante", "Alta"),
        ("RF09", "Listar nove projetos e abrir briefing com contexto, tecnologias, requisitos, entregáveis e critérios.", "Estudante", "Alta"),
        ("RF10", "Registrar conclusão de projeto e recompensa definida no catálogo.", "Estudante", "Alta"),
        ("RF11", "Exibir nove possibilidades de carreira, competências, prazo estimado e faixa salarial informativa.", "Estudante", "Média"),
        ("RF12", "Reunir certificados, projetos, XP e habilidades no portfólio do estudante.", "Estudante", "Alta"),
        ("RF13", "Permitir publicar ou privatizar o portfólio e copiar link público individual.", "Estudante", "Alta"),
        ("RF14", "Permitir enviar, substituir e remover foto JPG/PNG de até 2 MB com prévia.", "Estudante", "Média"),
        ("RF15", "Disponibilizar visão pública sem login, limitada aos dados autorizados.", "Visitante", "Alta"),
        ("RF16", "Listar estudantes no painel administrativo e abrir respostas, projetos e certificados.", "Administrador", "Alta"),
        ("RF17", "Permitir redefinir XP, alterar papel, bloquear/desbloquear e excluir dados acadêmicos.", "Administrador", "Alta"),
        ("RF18", "Recusar sessão e ações de XP de conta bloqueada e ocultá-la do portfólio público.", "Sistema", "Alta"),
    ]
    add_table(doc, "Requisitos funcionais", ["ID", "Descrição", "Ator", "Prioridade"], rf_rows, [1.4, 9.5, 3.0, 2.1], 8)

    add_heading(doc, "4.4 Requisitos não funcionais", 2)
    rnf_rows = [
        ("RNF01", "Segurança", "Autorizar dados por grants, RLS e validação no banco; não expor service_role."),
        ("RNF02", "Privacidade", "Manter portfólio privado por padrão e expor somente colunas necessárias após consentimento."),
        ("RNF03", "Integridade", "Calcular XP no servidor e tornar recompensas idempotentes."),
        ("RNF04", "Usabilidade", "Fornecer feedback visível, confirmações, estados de carregamento e linguagem em português."),
        ("RNF05", "Responsividade", "Operar em desktop e telas de até 768 px com menu móvel."),
        ("RNF06", "Acessibilidade", "Usar elementos semânticos, foco visível, textos alternativos e estados ARIA essenciais."),
        ("RNF07", "Compatibilidade", "Executar em navegadores modernos com suporte a ES2020+, canvas e APIs usadas."),
        ("RNF08", "Manutenibilidade", "Separar marcação, estilos, lógica de interface, acesso a dados e scripts SQL."),
        ("RNF09", "Testabilidade", "Permitir execução local das suítes sem banco real por meio de mocks."),
        ("RNF10", "Desempenho percebido", "Exibir boot, aviso de demora após quatro segundos e carregar dados secundários sem bloquear o acesso principal."),
        ("RNF11", "Portabilidade", "Publicar o frontend como arquivos estáticos e configurar backend por URL/chave publicável."),
        ("RNF12", "Auditabilidade", "Versionar código, migrações, testes e documentação no repositório."),
    ]
    add_table(doc, "Requisitos não funcionais", ["ID", "Categoria", "Critério"], rnf_rows, [1.5, 3.5, 10.0], 9)

    add_heading(doc, "4.5 Regras de negócio", 2)
    rn_rows = [
        ("RN01", "Um perfil corresponde a uma identidade de auth.users."),
        ("RN02", "O quiz aceita exatamente três respostas previstas e concede 50 XP somente na primeira conclusão."),
        ("RN03", "A primeira visualização de cada matéria válida concede 10 XP; chamadas repetidas não concedem novamente."),
        ("RN04", "A conclusão de exercício gera um certificado e 30 XP uma única vez por matéria."),
        ("RN05", "Projeto concluído é único por usuário e usa a recompensa do catálogo: 100, 150 ou 200 XP."),
        ("RN06", "Nível = maior valor entre 1 e piso(XP/100) + 1."),
        ("RN07", "Somente certificado emitido conta a matéria como concluída no contador; visualização não conta."),
        ("RN08", "Portfólio nasce privado e só pode ser publicado ou privatizado pelo proprietário."),
        ("RN09", "Visitante não recebe e-mail, idade, is_admin ou is_blocked; perfil privado e inexistente produzem mensagem equivalente."),
        ("RN10", "Avatar aceita image/jpeg ou image/png, até 2 MB, e permanece em bucket privado."),
        ("RN11", "Administrador não pode bloquear nem excluir a própria conta pela função administrativa."),
        ("RN12", "Conta bloqueada não entra, não recebe XP e não aparece em perfil público ou foto pública."),
        ("RN13", "Excluir aluno remove dados acadêmicos em cascata, mas não remove a identidade Auth sem Admin API segura."),
    ]
    add_table(doc, "Regras de negócio", ["ID", "Regra"], rn_rows, [1.7, 13.3], 9)

    add_heading(doc, "4.6 Casos de uso essenciais", 2)
    add_heading(doc, "4.6.1 Realizar nivelamento", 3)
    add_body(doc, "Pré-condição: estudante autenticado com quiz_done igual a falso. Fluxo principal: o sistema apresenta três perguntas; o estudante escolhe uma opção em cada; o cliente envia respostas, trilha e objetivo; a função do banco valida o conjunto, bloqueia a linha do perfil, grava as respostas e concede 50 XP; o dashboard é atualizado. Fluxo alternativo: se a chamada for repetida após a conclusão, a operação retorna sem alterar respostas e sem novo XP. Pós-condição: perfil marcado como nivelado e três respostas persistidas.")
    add_heading(doc, "4.6.2 Concluir matéria e emitir certificado", 3)
    add_body(doc, "Pré-condição: sessão ativa e conta não bloqueada. O estudante abre uma das doze matérias, recebendo 10 XP apenas na primeira visualização válida. Ao acionar a conclusão, o banco valida matéria e título esperado, insere o certificado com restrição única e concede 30 XP somente quando a inserção ocorre. O cliente atualiza a lista e abre o diploma em canvas. Repetir a ação preserva o registro original sem duplicar recompensa.")
    add_heading(doc, "4.6.3 Publicar portfólio", 3)
    add_body(doc, "Pré-condição: estudante autenticado. O proprietário altera portfolio_public para verdadeiro. O sistema apresenta um link com fragmento #publico/<id>. Ao abrir esse endereço sem sessão, o cliente consulta apenas as colunas concedidas ao papel anon, projetos e certificados do perfil publicado. A foto, se houver, é entregue por URL assinada. Tornar o perfil privado invalida a leitura anônima pelas políticas.")
    add_heading(doc, "4.6.4 Bloquear estudante", 3)
    add_body(doc, "Pré-condição: administrador ativo e alvo diferente do próprio administrador. Após confirmação visual, o cliente chama admin_set_blocked. A função revalida o papel e atualiza o alvo. A conta bloqueada é recusada no próximo login, perde acesso protegido, não executa RPCs de recompensa e deixa de ser exposta publicamente. O processo é reversível por desbloqueio.")

    # 5 DESENVOLVIMENTO
    add_heading(doc, "5 DESENVOLVIMENTO DA SOLUÇÃO", 1, page_break=True)
    add_heading(doc, "5.1 Arquitetura", 2)
    add_body(doc, "A arquitetura separa interface, serviço de hospedagem e backend gerenciado. O navegador carrega index.html, style.css, supabase.js e script.js pelo GitHub Pages. Bibliotecas de interface e o cliente Supabase são obtidos por CDN. O arquivo supabase.js concentra autenticação e acesso aos serviços; script.js mantém estado, eventos e renderização. Não existe servidor Node em produção nem etapa de build.")
    add_body(doc, "As requisições de dados seguem por HTTPS ao Supabase. Auth identifica o usuário; PostgreSQL mantém dados e regras; RLS autoriza linhas; RPCs tratam operações sensíveis; Storage preserva avatares. A chave publicável presente no cliente não concede acesso irrestrito. A segurança é construída por grants, políticas, validações e ausência de service_role no repositório.")

    add_heading(doc, "5.2 Organização do frontend", 2)
    add_body(doc, "O index.html reúne a landing page, autenticação, aplicação principal, nove itens de navegação e modais. O style.css implementa o tema escuro, componentes, responsividade, gaveta móvel, diploma e estados de foco. O script.js contém catálogos locais de carreiras e matérias, conteúdo, briefings, estado da sessão, sanitização, renderização e interação. O supabase.js inicializa o cliente e oferece funções assíncronas de acesso.")
    add_body(doc, "A inicialização verifica primeiro se o fragmento representa um portfólio público; nesse caso, a tela é aberta sem restaurar sessão. Nos demais acessos, uma tela de boot evita piscar a tela de login antes de getSession terminar. Uma mensagem adicional é exibida quando a conexão ultrapassa quatro segundos. Dados secundários, como projetos e certificados, são carregados sem impedir a entrada inicial no aplicativo.")

    add_heading(doc, "5.3 Navegação e jornada", 2)
    add_body(doc, "A landing page apresenta benefícios e chamadas para cadastro ou login. Após autenticação, o usuário sem nivelamento recebe o quiz. A navegação principal troca abas dentro da mesma página: Dashboard, Perfil, Certificados, Evolução, Centro de Estudos, Sobre o Curso, Projetos, Portfólio e Admin. A última só é exibida a perfis administrativos, embora a autorização efetiva permaneça no banco.")
    add_body(doc, "No mobile, o menu se torna gaveta com fundo escurecido. A implementação bloqueia o scroll do fundo, mantém aria-expanded sincronizado e fecha a navegação por múltiplos caminhos. Feedbacks de sucesso e falha aparecem como toast; ações destrutivas usam modal temático e confirmação explícita.")

    add_heading(doc, "5.4 Modelo de dados", 2)
    add_figure(doc, "Modelo lógico de dados", diagrams["dados"], alt_text="Diagrama relacionando auth.users, profiles, quiz_answers, subject_progress, certificates, user_projects e projects.")
    add_body(doc, "A entidade profiles estende a identidade do Supabase Auth em relação um para um. As demais tabelas registram respostas, exploração, certificados e projetos concluídos. Chaves compostas ou restrições únicas representam a regra de não repetição. A exclusão de profiles utiliza cascata para registros acadêmicos dependentes; projects permanece como catálogo independente.")
    add_table(doc, "Entidades do banco de dados", ["Entidade", "Finalidade", "Chave e relações"], [
        ("profiles", "Dados acadêmicos, papel, bloqueio, publicação e caminho do avatar.", "PK id; FK para auth.users(id)."),
        ("quiz_answers", "Três respostas do nivelamento.", "PK id; FK user_id; único user_id + question."),
        ("subject_progress", "Primeira visualização de matéria.", "PK composta user_id + subject_id."),
        ("projects", "Catálogo dos nove projetos e recompensa.", "PK id."),
        ("user_projects", "Projetos concluídos por estudante.", "PK composta user_id + project_id; duas FKs."),
        ("certificates", "Conclusão de matéria e emissão de certificado.", "PK id; único user_id + subject_id."),
        ("storage.objects", "Arquivos de avatar no bucket privado.", "Caminho <uid>/avatar.jpg|png; políticas por pasta."),
    ], [3.2, 7.4, 5.8])

    add_heading(doc, "5.5 Autenticação e perfil", 2)
    add_body(doc, "O cadastro chama auth.signUp com e-mail, senha e metadados. Um gatilho on_auth_user_created cria o perfil mínimo, e o cliente realiza upsert dos dados informados. O login usa signInWithPassword; a inicialização usa getSession; o logout encerra a sessão e retorna à landing. Se o perfil estiver bloqueado, o cliente realiza logout e informa a recusa, enquanto políticas e RPCs também impedem operações no banco.")
    add_body(doc, "No perfil, o estudante consulta dados e respostas do nivelamento. A foto é selecionada por input restrito a JPG/PNG. O cliente valida MIME e tamanho, cria uma URL blob somente para prévia e aguarda confirmação. Ao salvar, o arquivo é enviado para a pasta do próprio usuário e profiles.avatar_url recebe apenas o caminho. A exibição usa createSignedUrl com validade de uma hora; falhas retornam à inicial do nome sem interromper a tela.")

    add_heading(doc, "5.6 Centro de Estudos", 2)
    add_body(doc, "O Centro de Estudos contém HTML, CSS, JavaScript, SQL, Python, Java, Programação Orientada a Objetos, Git/GitHub, Redes, APIs, Banco de Dados e Lógica. Cada módulo informa nível e tempo estimado, introdução, tópicos, exemplo, exercício, erros comuns, materiais externos e três questões com correção imediata. A recomendação usa a área do quiz e destaca a próxima matéria não concluída com o selo Comece por aqui.")
    add_body(doc, "Duas ações persistentes são distintas. Abrir o módulo chama award_subject_view_xp e registra a exploração; concluir chama award_exercise_xp e emite certificado. O contador X de 12 e o selo Estudada derivam dos certificados, não da simples visualização. Essa regra preserva a diferença entre contato e conclusão.")

    add_heading(doc, "5.7 Projetos e carreiras", 2)
    add_body(doc, "O catálogo apresenta três projetos iniciantes, três intermediários e três avançados. Cada cartão abre um briefing com contexto de cliente, tecnologias sugeridas, requisitos funcionais, entregáveis, critérios de aceite e estimativa. A conclusão chama uma função que consulta a recompensa na tabela projects e insere user_projects. O uso do catálogo no servidor impede o cliente de escolher a quantidade de XP.")
    add_body(doc, "A aba Evolução apresenta nove carreiras: Front-end, Back-end, Full Stack, Mobile, QA/Testes, Banco de Dados, UX/UI Design, DevOps e Analista de Sistemas. Faixas salariais e tempos são apenas referências informativas do conteúdo local; não constituem pesquisa salarial nem garantia profissional.")

    add_heading(doc, "5.8 Certificados e portfólio", 2)
    add_body(doc, "Certificates é a fonte da verdade para conclusões. O diploma visual é desenhado em canvas de 2800 por 1980 pixels e inclui nome, módulo, data, trilha, nível, XP e código de verificação determinístico. O usuário pode baixar PNG ou abrir a impressão do navegador para salvar PDF. O certificado é uma representação da plataforma e não possui, no escopo atual, assinatura digital ou validação institucional externa.")
    add_body(doc, "O portfólio privado reúne resumo, habilidades derivadas de certificados, projetos e diplomas. Quando publicado, o link abre uma visão sem login. A consulta de profiles seleciona explicitamente id, name, track, goal, level, xp, portfolio_public e avatar_url. Grants por coluna impedem leitura anônima de email, age, is_admin e is_blocked. Perfil inexistente e perfil privado geram a mesma mensagem, reduzindo enumeração de identificadores.")

    add_heading(doc, "5.9 Gamificação e integridade do XP", 2)
    add_figure(doc, "Regras de experiência e progressão", diagrams["xp"], alt_text="Quatro regras de XP: quiz 50, visualização 10, exercício 30 e projeto conforme catálogo.")
    add_table(doc, "Regras de pontuação", ["Ação", "Recompensa", "Controle de integridade"], [
        ("Concluir quiz", "50 XP", "Validação das três respostas, bloqueio da linha profiles e retorno se quiz_done já for verdadeiro."),
        ("Abrir matéria", "10 XP", "Lista fechada de 12 IDs e INSERT ON CONFLICT na chave composta."),
        ("Concluir exercício", "30 XP", "ID e título validados; certificado único por usuário e matéria."),
        ("Concluir projeto iniciante", "100 XP", "Projeto deve existir e user_projects é único."),
        ("Concluir projeto intermediário", "150 XP", "Recompensa lida do catálogo, não do cliente."),
        ("Concluir projeto avançado", "200 XP", "Recompensa lida do catálogo, não do cliente."),
    ], [4.0, 2.5, 9.5])
    add_body(doc, "As funções award_* são SECURITY DEFINER com search_path fixo e verificam auth.uid(). O gatilho que protege XP permite alterações quando a operação é executada pelo proprietário controlado da função, mas continua revertendo atualizações diretas de usuários comuns. O papel anon tem EXECUTE revogado nas funções do schema público. Essas decisões fecham duas classes de abuso: alterar profiles.xp pelo cliente e chamar recompensas com matérias inventadas.")

    add_heading(doc, "5.10 Autorização e administração", 2)
    add_table(doc, "Matriz de controle de acesso", ["Recurso/ação", "Anon", "Estudante", "Administrador"], [
        ("Catálogo de projetos", "Ler", "Ler", "Ler"),
        ("Próprio perfil acadêmico", "Não", "Ler/atualizar campos permitidos", "Ler/administrar"),
        ("Perfil publicado", "Ler colunas públicas", "Ler se público", "Ler conforme políticas"),
        ("Respostas, progresso e certificados", "Somente de portfólio publicado e campos concedidos", "Apenas próprios", "Consultar alunos"),
        ("Avatar", "Assinar se portfólio público", "Gerir própria pasta; ler pública", "Mesmas regras de leitura"),
        ("XP e nível", "Não", "Somente por RPC validada", "Redefinir por função"),
        ("Bloqueio e exclusão", "Não", "Não", "Funções revalidam admin e impedem ação sobre si"),
    ], [5.0, 3.0, 4.0, 4.0], 8)
    add_body(doc, "O painel administrativo mostra quantidade e tabela de alunos, estado ativo/bloqueado e ações. Resetar XP e bloquear usam funções SECURITY INVOKER, pois o administrador possui UPDATE autorizado e é novamente conferido por current_is_admin. Excluir dados acadêmicos usa SECURITY DEFINER com search_path fixo porque DELETE direto não é concedido ao cliente; a função revalida o papel, verifica bloqueio do administrador e recusa autoexclusão.")

    add_heading(doc, "5.11 Proteções no cliente", 2)
    add_body(doc, "Dados originados do banco, URL ou usuário passam por escapeHtml antes de interpolação em HTML. Os testes incluem nomes, e-mails, trilhas, mensagens e URLs maliciosas para verificar que não criam elementos ou atributos executáveis. Parâmetros usados em manipuladores inline passam por codificação apropriada. Validações de cadastro e avatar melhoram a experiência, mas não substituem restrições do banco e configuração do bucket.")
    add_body(doc, "O tratamento de erro evita confirmar sucesso antes da resposta do backend. Se a conclusão de projeto falha, o estado local não é marcado e o botão permite nova tentativa. Falhas do avatar não impedem o restante do perfil. Essas estratégias melhoram consistência percebida e recuperação.")

    add_heading(doc, "5.12 Publicação e operação", 2)
    add_figure(doc, "Publicação e operação", diagrams["publicacao"], alt_text="Fluxo de publicação entre desenvolvedor, repositório GitHub, GitHub Pages, SQL Editor e Supabase.")
    add_body(doc, "O frontend é publicado a partir do repositório no endereço https://joaocaetano19.github.io/TCC/. O arquivo .nojekyll mantém a publicação dos arquivos estáticos sem processamento do Jekyll. O backend requer execução de database/schema.sql em um projeto novo; instalações existentes aplicam as migrações na ordem documentada. URL e chave publicável ficam em supabase.js; a chave service_role permanece fora do cliente.")
    add_body(doc, "A operação inclui validar URLs autorizadas no Supabase Auth, aguardar a publicação do Pages e executar uma jornada de fumaça. Alterações de banco devem ser testadas em instância separada, refletidas no schema consolidado e acompanhadas de migração idempotente para ambientes existentes.")

    # 6 RESULTADOS
    add_heading(doc, "6 RESULTADOS E VALIDAÇÃO", 1, page_break=True)
    add_heading(doc, "6.1 Artefato obtido", 2)
    add_body(doc, "O resultado é um protótipo web funcional e publicado, composto por interface responsiva, integração com autenticação, seis tabelas públicas, catálogo de projetos, funções de negócio, políticas de acesso, bucket privado, scripts de migração, testes e documentação. A solução cobre a jornada do primeiro acesso ao compartilhamento controlado do portfólio e oferece operações administrativas essenciais.")
    add_body(doc, "A centralização proposta foi materializada em nove áreas de navegação. O estudante encontra seu estado atual no dashboard, consulta o nivelamento no perfil, acessa doze matérias, resolve testes rápidos, conclui projetos, abre certificados e publica o portfólio. O administrador acompanha registros sem depender do painel interno do banco para ações rotineiras.")

    add_heading(doc, "6.2 Resultados dos testes automatizados", 2)
    add_table(doc, "Resultados dos testes automatizados", ["Suíte", "Escopo principal", "Resultado em 06/10/2026"], [
        ("regressao.js", "Boot, landing, autenticação, sanitização, portfólio público, avatar, SQL, bloqueio, nivelamento e centro de estudos.", "161 de 161 aprovadas"),
        ("smoke-completo.js", "Cadastro, quiz, dashboard, perfil, estudo, certificado, projeto, publicação e logout.", "47 de 47 aprovadas"),
        ("verificacao-extra.js", "Menu móvel, certificado, impressão, administração, carreiras e briefings.", "55 de 55 aprovadas"),
        ("Total", "Três suítes executadas por npm test.", "263 de 263 aprovadas"),
        ("npm audit", "Dependências de desenvolvimento registradas em package-lock.json.", "0 vulnerabilidades conhecidas após atualização"),
    ], [3.1, 8.4, 4.5], 9)
    add_body(doc, "O total aprovado indica que os comportamentos codificados nas suítes permaneceram consistentes no estado analisado. A regressão contém verificações específicas para grants por coluna, políticas públicas, bucket privado, validação de XP, revogação de execução anônima, bloqueio e prevenção de XSS em pontos de interpolação. A jornada principal confirma que as telas e estados locais se conectam na ordem esperada.")
    add_body(doc, "O resultado não deve ser interpretado como prova absoluta de ausência de falhas. Mocks podem divergir do serviço real, e verificações por presença de trechos SQL não substituem execução de todas as políticas em banco isolado. Ainda assim, a combinação de comportamento simulado e inspeção de artefatos reduz regressões e documenta premissas importantes.")

    add_heading(doc, "6.3 Evidências de atendimento aos objetivos", 2)
    add_table(doc, "Rastreabilidade entre objetivos e evidências", ["Objetivo específico", "Implementação", "Evidência"], [
        ("Levantar requisitos", "RF01–RF18, RNF01–RNF12 e RN01–RN13.", "Seção 4 e casos de uso."),
        ("Construir jornada educacional", "Landing, quiz, dashboard, estudos, projetos, certificados e portfólio.", "47 verificações da jornada principal."),
        ("Estruturar persistência segura", "Tabelas, constraints, RLS, grants, RPCs e Storage privado.", "schema.sql e verificações 66–126 da regressão."),
        ("Aplicar gamificação íntegra", "XP no banco, IDs permitidos, bloqueio de linha e chaves únicas.", "Regras RN02–RN07 e testes de integridade."),
        ("Proteger dados e administração", "Campos públicos mínimos, URLs assinadas, papel admin e bloqueio.", "Matriz de acesso e testes de portfólio/avatar/admin."),
        ("Verificar comportamento", "Três suítes e auditoria de dependências.", "263 verificações aprovadas e audit sem alertas."),
        ("Documentar e publicar", "README, documentação técnica, migrações, TCC e GitHub Pages.", "Arquivos do repositório e endereço público."),
    ], [5.2, 5.8, 5.0], 8)

    add_heading(doc, "6.4 Análise técnica", 2)
    add_heading(doc, "6.4.1 Pontos fortes", 3)
    add_bullets(doc, [
        "fonte da verdade de XP e certificados no banco, em vez de cálculo confiado ao navegador;",
        "autorização em camadas por grants, RLS, funções e validações de identidade;",
        "publicação voluntária com exposição mínima de colunas e mensagem que reduz enumeração de perfis;",
        "avatar em bucket privado, com pasta por usuário, validação dupla e URL assinada;",
        "operações idempotentes para quiz, visualização, certificado e projeto;",
        "feedback de falhas, confirmações e recuperação de estados no cliente;",
        "testes executáveis sem infraestrutura externa e documentação de migração para instalações existentes."
    ])
    add_heading(doc, "6.4.2 Decisões de compromisso", 3)
    add_body(doc, "A ausência de etapa de build facilita compreensão e publicação, mas concentra muita lógica em script.js e depende de bibliotecas CDN. O uso do Supabase reduz a necessidade de servidor próprio, mas transfere parte da disponibilidade e configuração de segurança ao serviço. Os conteúdos locais deixam o protótipo rápido, porém dificultam edição por professores sem alteração de código. O certificado em canvas é visualmente rico, mas não possui verificação pública independente do estado da plataforma.")

    add_heading(doc, "6.5 Limitações e riscos", 2)
    add_table(doc, "Limitações e ações de evolução", ["Limitação/risco", "Impacto", "Ação recomendada"], [
        ("Sem teste com estudantes reais", "Não há evidência de ganho de aprendizagem ou facilidade percebida.", "Realizar estudo de usabilidade e avaliação pedagógica com consentimento."),
        ("Mocks nas integrações", "Diferenças de RLS, Auth ou Storage podem não aparecer localmente.", "Criar ambiente Supabase de teste e suíte integrada automatizada."),
        ("Conteúdo no JavaScript", "Atualização exige edição e nova publicação.", "Migrar conteúdo para tabelas ou CMS com versionamento."),
        ("Dependência de CDN e serviços externos", "Indisponibilidade de rede afeta interface e dados.", "Fixar versões, monitorar serviços e considerar empacotamento local."),
        ("Certificado sem assinatura digital", "Não oferece validação institucional forte.", "Criar página de verificação e assinatura/código validado no servidor."),
        ("Exclusão não remove auth.users", "Identidade pode permanecer após apagar dados acadêmicos.", "Implementar função segura em servidor/Edge Function com Admin API."),
        ("Sem recuperação de senha e MFA na UI", "Conta depende do fluxo básico de senha.", "Adicionar recuperação, política de senha e MFA opcional."),
        ("Sem auditoria formal WCAG", "Barreiras de acessibilidade podem permanecer.", "Executar testes automáticos e manuais com tecnologias assistivas."),
        ("Sem teste de carga", "Escalabilidade não foi medida.", "Definir cenários, métricas e ensaios com dados não pessoais."),
    ], [5.2, 5.2, 5.6], 8)

    add_heading(doc, "6.6 Discussão", 2)
    add_body(doc, "A solução responde ao problema de centralização ao reunir orientação, conteúdo, prática e evidências em uma única navegação. Os elementos gamificados foram vinculados a ações persistidas, o que preserva o significado da pontuação. A arquitetura também demonstra que uma SPA estática pode manter autorização robusta quando o backend aplica regras no banco e não confia na visibilidade da interface.")
    add_body(doc, "O projeto se aproxima da proposta de gamificação descrita por Deterding et al. (2011) e Kapp (2012) ao empregar elementos de jogos em uma atividade educacional que continua sendo estudo e prática, não um jogo completo. Entretanto, somente pesquisa futura com usuários poderá avaliar se XP, níveis e certificados produzem engajamento positivo para o público pretendido. O resultado atual deve ser entendido como validação técnica do artefato, não como validação de impacto educacional.")

    # 7 CONCLUSÃO
    add_heading(doc, "7 CONCLUSÃO", 1, page_break=True)
    add_heading(doc, "7.1 Considerações finais", 2)
    add_body(doc, "Este trabalho desenvolveu e documentou o Pratica.dev 2.0, uma plataforma web gamificada para estudantes de Desenvolvimento de Sistemas. O objetivo geral foi atendido pela construção de um protótipo que centraliza nivelamento, doze matérias, projetos, XP, níveis, certificados, perfil, administração e portfólio público. A aplicação foi publicada como frontend estático e integrada a serviços gerenciados de autenticação, banco e armazenamento.")
    add_body(doc, "A principal contribuição técnica está na combinação entre experiência simples e regras protegidas no backend. XP não é aceito do JavaScript; recompensas são validadas e idempotentes; dados individuais são filtrados por políticas; o portfólio exige decisão do proprietário; e a foto permanece privada. O painel administrativo revalida permissões no banco e contas bloqueadas perdem acesso efetivo, não apenas elementos visuais.")
    add_body(doc, "As 263 verificações automatizadas aprovadas demonstram consistência dos comportamentos definidos, e a auditoria final das dependências de desenvolvimento não apontou vulnerabilidades conhecidas no nível configurado. Esses resultados, somados à rastreabilidade entre requisitos e implementação, sustentam a conclusão de que o artefato atende ao escopo técnico. Permanecem, contudo, limitações de teste integrado, acessibilidade formal, carga e avaliação com usuários.")
    add_body(doc, "A pergunta de pesquisa é respondida pela arquitetura e pelos fluxos implementados: uma aplicação web pode centralizar a jornada formativa quando relaciona conteúdos e atividades a registros persistentes, oferece feedback compreensível, transforma conquistas em evidências e aplica privacidade e autorização no backend. A gamificação funciona, no artefato, como camada de orientação da progressão, e não como substituta dos objetivos educacionais.")

    add_heading(doc, "7.2 Trabalhos futuros", 2)
    add_bullets(doc, [
        "realizar avaliação de usabilidade com estudantes e professores, definindo protocolo, consentimento e métricas;",
        "criar suíte de integração em um projeto Supabase exclusivo para testes de RLS, RPC e Storage;",
        "adicionar recuperação de senha, verificação de e-mail e autenticação multifator opcional;",
        "migrar conteúdo e projetos para área editorial administrável, com histórico de versões;",
        "implementar submissão de projetos com repositório, evidências, comentários e critérios avaliados;",
        "criar verificação pública de certificado e assinatura digital quando houver respaldo institucional;",
        "executar auditoria de acessibilidade com WCAG 2.2, leitor de tela e navegação integral por teclado;",
        "adicionar monitoramento, logs administrativos, trilha de auditoria e métricas respeitando privacidade;",
        "automatizar publicação e testes em integração contínua;",
        "desenvolver Edge Function segura para exclusão completa da identidade quando exigido."
    ])

    # REFERÊNCIAS
    add_heading(doc, "REFERÊNCIAS", 1, page_break=True)
    add_ref(doc, "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. ", "ABNT NBR 14724: informação e documentação — trabalhos acadêmicos — apresentação", ". 4. ed. Rio de Janeiro: ABNT, 2024.")
    add_ref(doc, "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. ", "ABNT NBR 10520: informação e documentação — citações em documentos — apresentação", ". 2. ed. Rio de Janeiro: ABNT, 2023.")
    add_ref(doc, "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. ", "ABNT NBR 6023: informação e documentação — referências — elaboração", ". 3. ed. Rio de Janeiro: ABNT, 2025.")
    add_ref(doc, "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. ", "ABNT NBR 6024: informação e documentação — numeração progressiva das seções de um documento — apresentação", ". Rio de Janeiro: ABNT, 2012.")
    add_ref(doc, "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. ", "ABNT NBR 6027: informação e documentação — sumário — apresentação", ". Rio de Janeiro: ABNT, 2012.")
    add_ref(doc, "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. ", "ABNT NBR 6028: informação e documentação — resumo, resenha e recensão — apresentação", ". Rio de Janeiro: ABNT, 2021.")
    add_ref(doc, "BACICH, Lilian; MORAN, José (org.). ", "Metodologias ativas para uma educação inovadora: uma abordagem teórico-prática", ". Porto Alegre: Penso, 2018.")
    add_ref(doc, "CAETANO, João. ", "Pratica.dev 2.0", ". GitHub, 2026. Disponível em: https://github.com/JOAOCAETANO19/TCC. Acesso em: 6 out. 2026.")
    add_ref(doc, "DETERDING, Sebastian; DIXON, Dan; KHALED, Rilla; NACKE, Lennart. ", "From game design elements to gamefulness: defining gamification", ". In: INTERNATIONAL ACADEMIC MINDTREK CONFERENCE, 15., 2011, Tampere. Proceedings [...]. New York: ACM, 2011. p. 9–15. DOI: https://doi.org/10.1145/2181037.2181040.")
    add_ref(doc, "GIL, Antonio Carlos. ", "Como elaborar projetos de pesquisa", ". 7. ed. São Paulo: Atlas, 2022.")
    add_ref(doc, "GITHUB. ", "What is GitHub Pages?", ". GitHub Docs, 2026. Disponível em: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages. Acesso em: 6 out. 2026.")
    add_ref(doc, "KAPP, Karl M. ", "The gamification of learning and instruction: game-based methods and strategies for training and education", ". San Francisco: Pfeiffer, 2012.")
    add_ref(doc, "MDN WEB DOCS. ", "Learn web development", ". 2026. Disponível em: https://developer.mozilla.org/en-US/docs/Learn_web_development. Acesso em: 6 out. 2026.")
    add_ref(doc, "OWASP. ", "A07:2021 — Identification and Authentication Failures", ". OWASP Top 10, 2021. Disponível em: https://owasp.org/Top10/2021/A07_2021-Identification_and_Authentication_Failures/. Acesso em: 6 out. 2026.")
    add_ref(doc, "POSTGRESQL GLOBAL DEVELOPMENT GROUP. ", "PostgreSQL 18 documentation: row security policies", ". 2026. Disponível em: https://www.postgresql.org/docs/current/ddl-rowsecurity.html. Acesso em: 6 out. 2026.")
    add_ref(doc, "SUPABASE. ", "Auth", ". Supabase Docs, 2026a. Disponível em: https://supabase.com/docs/guides/auth. Acesso em: 6 out. 2026.")
    add_ref(doc, "SUPABASE. ", "Securing your API", ". Supabase Docs, 2026b. Disponível em: https://supabase.com/docs/guides/api/securing-your-api. Acesso em: 6 out. 2026.")
    add_ref(doc, "W3C. ", "Web Content Accessibility Guidelines (WCAG) 2.2", ". W3C Recommendation, 5 out. 2023. Disponível em: https://www.w3.org/TR/WCAG22/. Acesso em: 6 out. 2026.")

    # APÊNDICE A — INSTALAÇÃO E CONFIGURAÇÃO
    add_heading(doc, "APÊNDICE A — INSTALAÇÃO E CONFIGURAÇÃO", 1, page_break=True)
    add_heading(doc, "A.1 Pré-requisitos", 2)
    add_bullets(doc, [
        "Git e navegador moderno;",
        "Python 3 ou outro servidor HTTP estático para execução local;",
        "Node.js e npm para executar as suítes;",
        "projeto Supabase com acesso ao SQL Editor;",
        "repositório clonado e conexão à internet para bibliotecas CDN e backend."
    ])
    add_heading(doc, "A.2 Execução local", 2)
    add_code(doc, "git clone https://github.com/JOAOCAETANO19/TCC.git\ncd TCC\nnpm ci\nnpm test\npython3 -m http.server 8080")
    add_body(doc, "Acesse http://localhost:8080. Não abra index.html diretamente por file://, porque o navegador pode restringir requisições e origens usadas pela autenticação.")

    add_heading(doc, "A.3 Instalação nova do backend", 2)
    add_numbered(doc, [
        "Criar um projeto no Supabase.",
        "Abrir SQL Editor e executar database/schema.sql por completo.",
        "Copiar a Project URL e a chave publicável para SUPABASE_URL e SUPABASE_ANON em supabase.js.",
        "Revisar Authentication > URL Configuration e cadastrar a URL local e a URL publicada.",
        "Criar um usuário pelo formulário da aplicação.",
        "Promover o primeiro administrador por SQL, usando um e-mail já cadastrado.",
        "Confirmar que o bucket avatars está privado e que as políticas foram criadas.",
        "Executar a jornada manual recomendada no Apêndice C."
    ])
    add_code(doc, "update public.profiles\nset is_admin = true\nwhere email = 'administrador@exemplo.com';")

    add_heading(doc, "A.4 Atualização de instalação existente", 2)
    add_body(doc, "Para banco criado com uma versão anterior, execute os scripts abaixo na ordem. Todos foram escritos para reexecução idempotente, mas recomenda-se backup e validação em ambiente de teste.")
    add_numbered(doc, [
        "database/correcao-xp.sql — corrige execução das funções de recompensa;",
        "database/migracao-portfolio-avatar.sql — adiciona portfólio público e avatar privado;",
        "database/migracao-bloqueio-usuarios.sql — adiciona bloqueio administrativo e atualiza políticas;",
        "database/migracao-permissoes-anon.sql — reforça grants por coluna para visitantes;",
        "database/migracao-integridade-xp.sql — valida quiz e matérias, garante idempotência e corrige exclusão administrativa."
    ])
    add_body(doc, "Depois da migração, valide um cadastro de teste, repetição do quiz, abertura repetida da mesma matéria, conclusão repetida de exercício/projeto, publicação/privatização, upload/remoção de avatar, bloqueio e exclusão acadêmica.")

    add_heading(doc, "A.5 Publicação", 2)
    add_numbered(doc, [
        "Executar npm test e npm run audit.",
        "Revisar git diff para impedir inclusão de segredos ou dados pessoais.",
        "Enviar a versão aprovada para o repositório e aguardar o GitHub Pages.",
        "Abrir https://joaocaetano19.github.io/TCC/ e repetir o smoke test.",
        "Confirmar que a aplicação usa HTTPS e que a rota pública funciona em janela anônima."
    ])

    add_heading(doc, "A.6 Operação e manutenção", 2)
    add_bullets(doc, [
        "Nunca inserir service_role, senhas, tokens privados ou dumps de usuários no repositório;",
        "manter package-lock.json versionado e repetir a auditoria periodicamente;",
        "refletir toda mudança de banco em schema.sql e em migração para ambientes existentes;",
        "não editar XP ou nível diretamente para fluxo comum; usar as funções previstas;",
        "registrar limitações conhecidas e atualizar testes quando uma regra de negócio mudar;",
        "validar restauração e plano de backup conforme o plano contratado do backend."
    ])

    # APÊNDICE B — DICIONÁRIO DE DADOS
    add_heading(doc, "APÊNDICE B — DICIONÁRIO DE DADOS", 1, page_break=True)
    add_heading(doc, "B.1 Tabela profiles", 2)
    add_table(doc, "Dicionário de dados — profiles", ["Campo", "Tipo", "Restrições/uso"], [
        ("id", "uuid", "PK; FK auth.users(id); exclusão em cascata."),
        ("name", "text", "Obrigatório; 2 a 120 caracteres após trim."),
        ("age", "integer", "Obrigatório; entre 10 e 120."),
        ("email", "text", "Obrigatório; usado para consulta administrativa."),
        ("level", "integer", "Padrão 1; mínimo 1; recalculado no servidor."),
        ("xp", "integer", "Padrão 0; não negativo; protegido por trigger."),
        ("track", "text", "Área selecionada no quiz."),
        ("goal", "text", "Objetivo profissional selecionado."),
        ("quiz_done", "boolean", "Padrão falso; trava recompensa repetida do quiz."),
        ("is_admin", "boolean", "Padrão falso; papel privilegiado."),
        ("is_blocked", "boolean", "Padrão falso; bloqueia sessão, ações e exposição."),
        ("portfolio_public", "boolean", "Padrão falso; consentimento de publicação."),
        ("avatar_url", "text", "Caminho no bucket privado, não URL pública."),
        ("created_at", "timestamptz", "Data/hora de criação; padrão now()."),
    ], [3.3, 3.3, 9.4], 8)

    add_heading(doc, "B.2 Nivelamento e progresso", 2)
    add_table(doc, "Dicionário de dados — quiz_answers e subject_progress", ["Tabela.campo", "Tipo", "Restrições/uso"], [
        ("quiz_answers.id", "bigint identity", "Chave primária."),
        ("quiz_answers.user_id", "uuid", "FK profiles; obrigatório; cascata."),
        ("quiz_answers.question", "integer", "Valores 1 a 3; único com user_id."),
        ("quiz_answers.answer", "text", "Resposta validada pela RPC."),
        ("quiz_answers.created_at", "timestamptz", "Padrão now()."),
        ("subject_progress.user_id", "uuid", "FK profiles; parte da PK."),
        ("subject_progress.subject_id", "text", "ID entre os 12 aceitos; parte da PK."),
        ("subject_progress.viewed_at", "timestamptz", "Primeira visualização; padrão now()."),
    ], [5.2, 3.1, 7.7], 8)

    add_heading(doc, "B.3 Projetos e certificados", 2)
    add_table(doc, "Dicionário de dados — projetos e certificados", ["Tabela.campo", "Tipo", "Restrições/uso"], [
        ("projects.id", "integer", "PK do catálogo."),
        ("projects.name", "text", "Nome obrigatório."),
        ("projects.level", "text", "Iniciante, Intermediário ou Avançado."),
        ("projects.description", "text", "Resumo obrigatório."),
        ("projects.xp_reward", "integer", "Não negativo; 100, 150 ou 200 na carga inicial."),
        ("user_projects.user_id", "uuid", "FK profiles; parte da PK."),
        ("user_projects.project_id", "integer", "FK projects; parte da PK."),
        ("user_projects.completed_at", "timestamptz", "Padrão now()."),
        ("certificates.id", "bigint identity", "PK."),
        ("certificates.user_id", "uuid", "FK profiles; cascata."),
        ("certificates.subject_id", "text", "Único com user_id; validado pela RPC."),
        ("certificates.title", "text", "Título esperado derivado da matéria."),
        ("certificates.issued_at", "timestamptz", "Data de emissão; padrão now()."),
    ], [5.2, 3.1, 7.7], 8)

    add_heading(doc, "B.4 Storage", 2)
    add_body(doc, "O bucket avatars é privado. O caminho segue <id do usuário>/avatar.jpg ou avatar.png. Políticas de INSERT, UPDATE e DELETE exigem que o primeiro segmento seja auth.uid(). A leitura autenticada permite a própria foto e fotos de portfólios publicados; a leitura anônima permite apenas fotos de perfis publicados e não bloqueados. Quando a infraestrutura oferece as colunas correspondentes em storage.buckets, aplicam-se limite de 2.097.152 bytes e MIME image/jpeg ou image/png.")

    # APÊNDICE C — PLANO DE TESTES
    add_heading(doc, "APÊNDICE C — PLANO DE TESTES", 1, page_break=True)
    add_heading(doc, "C.1 Automação", 2)
    add_body(doc, "A execução padrão é npm test. Cada suíte imprime as verificações em ordem e retorna código diferente de zero em caso de falha. Para a auditoria, use npm run audit. Antes da entrega, recomenda-se instalar exatamente as versões do lockfile com npm ci.")
    add_code(doc, "npm ci\nnpm test\nnpm run audit")

    add_heading(doc, "C.2 Casos manuais recomendados", 2)
    manual_rows = [
        ("CT01", "Abrir a URL em janela anônima.", "Landing aparece; app autenticado permanece oculto."),
        ("CT02", "Cadastrar dados válidos e concluir quiz.", "Perfil criado, 3 respostas persistidas e +50 XP uma vez."),
        ("CT03", "Tentar chamar/concluir o quiz novamente.", "Nenhum XP ou alteração adicional."),
        ("CT04", "Abrir a mesma matéria duas vezes.", "Somente a primeira abertura concede +10 XP."),
        ("CT05", "Concluir a mesma matéria duas vezes.", "Um certificado e +30 XP no total."),
        ("CT06", "Concluir projeto duas vezes.", "Um registro e uma recompensa conforme catálogo."),
        ("CT07", "Publicar portfólio e abrir o link sem login.", "Dados públicos aparecem; e-mail/idade/admin não aparecem."),
        ("CT08", "Tornar portfólio privado e recarregar link.", "Mensagem genérica de inexistente ou privado."),
        ("CT09", "Enviar JPG/PNG válido e depois arquivo inválido/maior que 2 MB.", "Válido abre prévia e salva; inválidos são recusados."),
        ("CT10", "Bloquear estudante e tentar login/rota pública.", "Login recusado e perfil/foto não aparecem publicamente."),
        ("CT11", "Tentar bloquear/excluir a própria conta admin.", "Interface não oferece ação e banco recusa chamada direta."),
        ("CT12", "Usar menu em largura <=768 px e teclado.", "Gaveta, Esc, foco visível e fechamento funcionam."),
        ("CT13", "Baixar e imprimir certificado.", "PNG nomeado e impressão aberta com imagem completa."),
        ("CT14", "Simular falha de rede ao concluir projeto.", "Erro visível e estado local não marcado."),
        ("CT15", "Inspecionar console e rede durante jornada.", "Sem service_role, senhas, dados de outros alunos ou erros inesperados."),
    ]
    add_table(doc, "Casos de teste manual recomendados", ["ID", "Procedimento", "Resultado esperado"], manual_rows, [1.5, 7.0, 7.5], 8)

    add_heading(doc, "C.3 Critérios de aceite", 2)
    add_bullets(doc, [
        "todas as 263 verificações automatizadas aprovadas;",
        "auditoria sem vulnerabilidade conhecida no nível high ou superior;",
        "nenhum dado sensível acessível por visitante anônimo;",
        "recompensas repetidas não alteram XP;",
        "conta bloqueada recusada pelo cliente e pelo banco;",
        "jornada principal executada no endereço publicado;",
        "documentação e schema consistentes com a versão entregue."
    ])

    # APÊNDICE D — MANUAL DO USUÁRIO
    add_heading(doc, "APÊNDICE D — MANUAL DO USUÁRIO", 1, page_break=True)
    add_heading(doc, "D.1 Primeiro acesso", 2)
    add_numbered(doc, [
        "Abra o endereço publicado.",
        "Selecione Cadastrar e informe nome completo, idade, e-mail e senha.",
        "Responda às três perguntas de nivelamento.",
        "Confira trilha, XP e recomendação no Dashboard.",
        "Use Sair ao terminar, especialmente em computador compartilhado."
    ])
    add_heading(doc, "D.2 Estudos", 2)
    add_numbered(doc, [
        "Abra Centro de Estudos e observe o contador e a trilha recomendada.",
        "Escolha uma matéria e leia resumo, tópicos, exemplo e erros comuns.",
        "Use os links Para se aprofundar em nova aba.",
        "Responda ao teste rápido; o resultado aparece imediatamente e não altera XP.",
        "Execute o exercício proposto e, quando concluído, selecione Marcar como concluído.",
        "Abra o certificado gerado na aba Certificados ou no Perfil."
    ])
    add_heading(doc, "D.3 Projetos", 2)
    add_numbered(doc, [
        "Abra Projetos e escolha um nível adequado.",
        "Selecione Ver briefing e leia contexto, requisitos, entregáveis e critérios.",
        "Desenvolva o projeto em repositório próprio.",
        "Ao cumprir os critérios, confirme Concluir Projeto.",
        "Confira a recompensa e a inclusão no portfólio."
    ])
    add_heading(doc, "D.4 Foto e portfólio", 2)
    add_numbered(doc, [
        "No Perfil, selecione Alterar foto.",
        "Escolha JPG ou PNG de até 2 MB, confira a prévia e salve; use Remover foto para voltar à inicial.",
        "Na aba Portfólio, revise os dados exibidos.",
        "Selecione Publicar portfólio e copie o link.",
        "Teste o link em janela anônima antes de compartilhar.",
        "Use Tornar privado para interromper o acesso externo."
    ])
    add_heading(doc, "D.5 Administração", 2)
    add_numbered(doc, [
        "Entre com perfil autorizado e abra Admin.",
        "Selecione o nome de um aluno para consultar quiz, projetos e certificados.",
        "Use Resetar XP, Tornar/Remover admin, Bloquear/Desbloquear ou Excluir somente após conferir o alvo.",
        "Leia a confirmação e observe que a exclusão remove dados acadêmicos, mas não a identidade Auth.",
        "Não compartilhe conta administrativa; encerre a sessão ao finalizar."
    ])
    add_heading(doc, "D.6 Solução de problemas", 2)
    add_bullets(doc, [
        "Tela de boot demorada: confira conexão e disponibilidade do Supabase; use Tentar novamente se exibido;",
        "login recusado por bloqueio: procure o administrador; o cliente não pode remover o bloqueio;",
        "foto não aparece: confirme privacidade, formato, limite e políticas do bucket; a inicial é o fallback normal;",
        "portfólio não abre: confirme que está publicado e que o link contém #publico/<id>;",
        "XP não atualiza: não repita a atividade; registre o erro e confirme se as migrações foram aplicadas;",
        "impressão do certificado: permita que a imagem carregue e escolha Salvar como PDF no diálogo do navegador."
    ])

    # APÊNDICE E — CHECKLIST ABNT E ENTREGA
    add_heading(doc, "APÊNDICE E — CHECKLIST DE NORMALIZAÇÃO E ENTREGA", 1, page_break=True)
    add_body(doc, "Este documento foi configurado com base na ABNT NBR 14724:2024 para apresentação, NBR 10520:2023 para citações, NBR 6023:2025 para referências, NBR 6024:2012 para numeração, NBR 6027:2012 para sumário e NBR 6028:2021 para resumo. Como a instituição não forneceu manual próprio, requisitos institucionais devem prevalecer e ser conferidos antes da versão final.")
    checklist = [
        ("Dados institucionais", "Pendente", "Substituir instituição, orientador e banca destacados em amarelo."),
        ("Capa e folha de rosto", "Estruturadas", "Confirmar grafia oficial do curso, autor e cidade."),
        ("Folha de aprovação", "Estruturada", "Preencher data e nomes após definição da banca."),
        ("Ficha catalográfica", "Verificar", "Solicitar à biblioteca e inserir somente se a instituição exigir."),
        ("Resumo/Abstract", "Conforme", "Parágrafo único, objetivo, método, resultados, conclusão e palavras-chave."),
        ("Papel e margens", "Conforme", "A4; superior/esquerda 3 cm; inferior/direita 2 cm."),
        ("Fonte", "Conforme", "Times New Roman 12; tamanho 10 em tabelas, legendas e paginação."),
        ("Parágrafos", "Conforme", "Justificados, recuo inicial 1,25 cm, entrelinhas 1,5."),
        ("Exceções", "Conforme", "Referências, natureza, fontes, legendas e códigos em espaço simples."),
        ("Paginação", "Automática", "Contada da folha de rosto; visível no canto superior direito a partir da Introdução."),
        ("Seções", "Conforme", "Numeração progressiva; seções primárias em nova página."),
        ("Ilustrações e tabelas", "Conforme", "Identificação acima e fonte abaixo; chamadas no texto."),
        ("Citações", "Conforme", "Sistema autor-data com maiúsculas/minúsculas segundo NBR 10520:2023."),
        ("Referências", "Conforme", "Ordem alfabética, alinhamento à esquerda, simples e separadas por linha."),
        ("Sumário/listas", "Automáticos", "No Word, pressionar Ctrl+A e F9 antes de exportar/entregar."),
        ("Revisão final", "Pendente", "Aplicar manual da instituição, correção linguística e conferência do orientador."),
        ("Entrega técnica", "Conforme", "Executar npm ci, npm test e npm run audit; testar URL publicada."),
    ]
    add_table(doc, "Checklist de normalização e entrega", ["Item", "Estado", "Ação final"], checklist, [4.3, 2.3, 9.0], 8)
    add_body(doc, "Antes da entrega, selecione todo o documento no Microsoft Word (Ctrl+A), pressione F9 e escolha atualizar o índice inteiro. Isso recalcula sumário, listas e referências de página. Depois, salve o DOCX e gere o PDF pelo próprio Word para preservar fontes, campos e paginação.")

    # Garantias finais de seção e salvamento.
    for section in doc.sections:
        configure_section(section)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    return OUT


if __name__ == "__main__":
    path = build_document()
    print(path)




