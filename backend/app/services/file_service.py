import logging
import os
from pathlib import Path
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class FileService:
    """Сервис для работы с файлами и извлечения текста."""

    ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt"}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 МБ

    async def extract_text(self, file_path: Path) -> str:
        """Извлечение текста из файла различных форматов."""
        ext = file_path.suffix.lower()

        if ext == ".txt":
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    return f.read()
            except UnicodeDecodeError:
                with open(file_path, "r", encoding="cp1251") as f:
                    return f.read()

        elif ext == ".pdf":
            try:
                from pypdf import PdfReader
                reader = PdfReader(str(file_path))
                text = ""
                for page in reader.pages:
                    text += page.extract_text() or ""
                return text
            except Exception as e:
                logger.error(f"Error extracting text from PDF: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Ошибка извлечения текста из PDF: {str(e)}",
                )

        elif ext == ".docx":
            try:
                from docx import Document as DocxDocument
                doc = DocxDocument(str(file_path))
                return "\n".join([p.text for p in doc.paragraphs])
            except Exception as e:
                logger.error(f"Error extracting text from DOCX: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Ошибка извлечения текста из документа: {str(e)}",
                )

        elif ext == ".doc":
            # Базовая поддержка .doc через olefile (если нет libreoffice)
            try:
                import olefile
                ole = olefile.OleFileIO(str(file_path))
                text_parts = []
                for stream in ole.listdir():
                    if stream and len(stream) > 0:
                        try:
                            data = ole.openstream(stream).read()
                            text = data.decode('utf-8', errors='ignore')
                            if text.strip():
                                text_parts.append(text)
                        except:
                            pass
                ole.close()
                if text_parts:
                    return '\n'.join(text_parts[:20])
            except Exception:
                pass
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Формат .doc (старый Word) не поддерживается для прямого анализа. Пожалуйста, сохраните как .docx или PDF.",
            )

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неподдерживаемый формат файла: {ext}",
            )

file_service = FileService()
