"""Генерация PDF документов с использованием WeasyPrint."""
import io
import logging
from typing import Dict, Any, Optional
from weasyprint import HTML, CSS
from jinja2 import Environment, FileSystemLoader
import os

logger = logging.getLogger(__name__)

class PDFGenerator:
    """Генератор юридических документов в формате PDF."""

    def __init__(self):
        # Настройка Jinja2 для шаблонов, если они понадобятся в будущем
        # Пока будем генерировать HTML динамически
        pass

    def generate_pdf(self, title: str, html_content: str) -> bytes:
        """Сгенерировать PDF из HTML контента с водяным знаком."""
        
        # Базовый CSS для оформления и водяного знака
        base_css = """
        @page {
            size: A4;
            margin: 2cm 1.5cm 2.5cm 2.5cm;
            @bottom-center {
                content: "Документ составлен и проверен ИИ-юристом LAXLY AI LAW — laxly.ru";
                font-family: 'Times New Roman', serif;
                font-size: 9pt;
                font-style: italic;
                color: #666666;
                border-top: 0.5pt solid #999999;
                width: 100%;
                padding-top: 5pt;
            }
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 14pt;
            line-height: 1.5;
            color: #000000;
        }
        h1 {
            text-align: center;
            text-transform: uppercase;
            font-size: 16pt;
            margin-bottom: 20pt;
        }
        h2 {
            text-align: center;
            font-size: 14pt;
            margin-top: 15pt;
            margin-bottom: 10pt;
        }
        .address-block {
            text-align: right;
            margin-bottom: 20pt;
        }
        .section-header {
            font-weight: bold;
            text-align: center;
            margin-top: 15pt;
            margin-bottom: 10pt;
        }
        .paragraph {
            text-indent: 1.25cm;
            margin-bottom: 6pt;
            text-align: justify;
        }
        .list-item {
            margin-left: 1.25cm;
            margin-bottom: 4pt;
        }
        .signature-block {
            margin-top: 30pt;
        }
        """

        full_html = f"""
        <html>
        <head>
            <meta charset="utf-8">
            <style>{base_css}</style>
        </head>
        <body>
            <h1>{title}</h1>
            {html_content}
        </body>
        </html>
        """

        try:
            buffer = io.BytesIO()
            HTML(string=full_html).write_pdf(buffer)
            buffer.seek(0)
            return buffer.getvalue()
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            raise e

# Singleton
pdf_generator = PDFGenerator()
