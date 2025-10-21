"""
Moduł do ekstrakcji tekstu z różnych formatów plików
"""

import re
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

# PDF
try:
    import PyPDF2
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

# Word
try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

# OCR dla obrazów
try:
    from PIL import Image
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


class FileExtractor:
    """Klasa do ekstrakcji tekstu z różnych formatów plików"""

    SUPPORTED_FORMATS = {
        'pdf': 'Dokumenty PDF',
        'docx': 'Dokumenty Word',
        'doc': 'Dokumenty Word (stary format)',
        'txt': 'Pliki tekstowe',
        'jpg': 'Obrazy JPG (OCR)',
        'jpeg': 'Obrazy JPEG (OCR)',
        'png': 'Obrazy PNG (OCR)',
        'email': 'Wiadomości email'
    }

    def extract_text(self, file_path: str) -> str:
        """
        Ekstraktuje tekst z pliku

        Args:
            file_path: Ścieżka do pliku

        Returns:
            Wyekstrahowany tekst
        """
        path = Path(file_path)
        extension = path.suffix.lower().lstrip('.')

        extractors = {
            'pdf': self._extract_from_pdf,
            'docx': self._extract_from_docx,
            'doc': self._extract_from_doc,
            'txt': self._extract_from_txt,
            'jpg': self._extract_from_image,
            'jpeg': self._extract_from_image,
            'png': self._extract_from_image,
        }

        extractor = extractors.get(extension)
        if extractor:
            return extractor(file_path)
        else:
            raise ValueError(f"Nieobsługiwany format pliku: {extension}")

    def _extract_from_pdf(self, file_path: str) -> str:
        """Ekstraktuje tekst z PDF"""
        if not PDF_AVAILABLE:
            raise ImportError("PyPDF2 i pdfplumber nie są zainstalowane")

        text = ""

        # Próba 1: pdfplumber (lepsze dla tabel)
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"pdfplumber error: {e}, trying PyPDF2...")

            # Próba 2: PyPDF2 (backup)
            try:
                with open(file_path, 'rb') as file:
                    reader = PyPDF2.PdfReader(file)
                    for page in reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
            except Exception as e2:
                raise Exception(f"Nie udało się wyekstrahować tekstu z PDF: {e2}")

        return text.strip()

    def _extract_from_docx(self, file_path: str) -> str:
        """Ekstraktuje tekst z pliku Word (.docx)"""
        if not DOCX_AVAILABLE:
            raise ImportError("python-docx nie jest zainstalowane")

        doc = Document(file_path)
        text = []

        # Wyciągnij tekst z paragrafów
        for para in doc.paragraphs:
            if para.text.strip():
                text.append(para.text)

        # Wyciągnij tekst z tabel
        for table in doc.tables:
            for row in table.rows:
                row_text = []
                for cell in row.cells:
                    if cell.text.strip():
                        row_text.append(cell.text.strip())
                if row_text:
                    text.append(" | ".join(row_text))

        return "\n".join(text)

    def _extract_from_doc(self, file_path: str) -> str:
        """Ekstraktuje tekst z pliku Word (.doc) - stary format"""
        # Stary format .doc wymaga dodatkowych bibliotek (antiword, textract)
        # Na razie zwróć informację
        raise NotImplementedError(
            "Format .doc nie jest jeszcze obsługiwany. "
            "Proszę przekonwertować plik do .docx lub .pdf"
        )

    def _extract_from_txt(self, file_path: str) -> str:
        """Ekstraktuje tekst z pliku tekstowego"""
        encodings = ['utf-8', 'cp1250', 'latin1', 'iso-8859-2']

        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as file:
                    return file.read()
            except UnicodeDecodeError:
                continue

        raise ValueError("Nie udało się odkodować pliku tekstowego")

    def _extract_from_image(self, file_path: str) -> str:
        """Ekstraktuje tekst z obrazu za pomocą OCR"""
        if not OCR_AVAILABLE:
            raise ImportError("Pillow i pytesseract nie są zainstalowane")

        try:
            image = Image.open(file_path)
            # Tesseract OCR - wymaga zainstalowanego Tesseract na systemie
            text = pytesseract.image_to_string(image, lang='pol+eng')
            return text.strip()
        except Exception as e:
            raise Exception(f"Błąd OCR: {e}. Upewnij się że Tesseract jest zainstalowany.")

    def extract_from_plain_text(self, text: str) -> str:
        """Ekstraktuje tekst z wklejonego tekstu"""
        return text.strip()

    def is_supported(self, filename: str) -> bool:
        """Sprawdza czy format pliku jest obsługiwany"""
        extension = Path(filename).suffix.lower().lstrip('.')
        return extension in self.SUPPORTED_FORMATS


class OfferDataParser:
    """Klasa do parsowania danych oferty z tekstu"""

    def parse(self, text: str, filename: str = "") -> Dict[str, Any]:
        """
        Parsuje tekst i wyciąga kluczowe informacje

        Args:
            text: Tekst do sparsowania
            filename: Nazwa pliku źródłowego

        Returns:
            Słownik z wyekstrahowanymi danymi
        """
        data = {
            "source_file": filename,
            "raw_text": text[:500] + "..." if len(text) > 500 else text,  # Pierwsze 500 znaków
            "extracted_data": {}
        }

        # Wyciągnij ceny
        prices = self._extract_prices(text)
        if prices:
            data["extracted_data"]["prices"] = prices
            data["extracted_data"]["total_price"] = max(prices)  # Największa kwota to prawdopodobnie suma

        # Wyciągnij daty
        dates = self._extract_dates(text)
        if dates:
            data["extracted_data"]["dates"] = dates

        # Wyciągnij numery telefonów
        phones = self._extract_phones(text)
        if phones:
            data["extracted_data"]["phones"] = phones

        # Wyciągnij emaile
        emails = self._extract_emails(text)
        if emails:
            data["extracted_data"]["emails"] = emails

        # Wyciągnij nazwę firmy (próbujemy różne metody)
        company = self._extract_company_name(text)
        if company:
            data["extracted_data"]["company_name"] = company

        # Wyciągnij NIP
        nip = self._extract_nip(text)
        if nip:
            data["extracted_data"]["nip"] = nip

        return data

    def _extract_prices(self, text: str) -> list:
        """Wyciąga ceny z tekstu"""
        prices = []

        # Wzorce dla cen w różnych formatach
        patterns = [
            r'(\d+[\s,]?\d*[\s,]?\d*)[,.](\d{2})\s*(?:zł|PLN|pln)',  # 1000.00 zł
            r'(?:wartość|kwota|cena|suma|razem|total)[:\s]+(\d+[\s,]?\d*[\s,]?\d*)[,.](\d{2})',  # wartość: 1000.00
            r'(\d+[\s,]?\d*[\s,]?\d*)[,.](\d{2})\s*(?:netto|brutto)',  # 1000.00 netto
        ]

        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    # Wyciągnij liczbę i grosze
                    if len(match.groups()) >= 2:
                        number_part = match.group(1).replace(' ', '').replace(',', '')
                        decimal_part = match.group(2)
                        price = float(f"{number_part}.{decimal_part}")
                        prices.append(price)
                except (ValueError, IndexError):
                    continue

        return sorted(set(prices), reverse=True)  # Unikalne ceny, od największej

    def _extract_dates(self, text: str) -> list:
        """Wyciąga daty z tekstu"""
        dates = []

        # Wzorce dat
        patterns = [
            r'\b(\d{2})[.\-/](\d{2})[.\-/](\d{4})\b',  # 01.01.2024 lub 01-01-2024
            r'\b(\d{4})[.\-/](\d{2})[.\-/](\d{2})\b',  # 2024-01-01
        ]

        for pattern in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                dates.append(match.group(0))

        return list(set(dates))

    def _extract_phones(self, text: str) -> list:
        """Wyciąga numery telefonów"""
        pattern = r'(?:\+48\s?)?(?:\d{3}[\s\-]?\d{3}[\s\-]?\d{3}|\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2})'
        matches = re.findall(pattern, text)
        return list(set(matches))

    def _extract_emails(self, text: str) -> list:
        """Wyciąga adresy email"""
        pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        matches = re.findall(pattern, text)
        return list(set(matches))

    def _extract_company_name(self, text: str) -> Optional[str]:
        """Próbuje wyekstrahować nazwę firmy"""
        # Szukamy po wzorcach jak "Sp. z o.o.", "S.A.", etc.
        patterns = [
            r'([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż\s]+(?:Sp\.|S\.A\.|Spółka)[\w\s\.]+)',
            r'(?:Firma|Wykonawca|Oferent)[:\s]+([A-ZĄĆĘŁŃÓŚŹŻ][\w\s]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()

        return None

    def _extract_nip(self, text: str) -> Optional[str]:
        """Wyciąga numer NIP"""
        pattern = r'(?:NIP[:\s]+)?(\d{10}|\d{3}-\d{3}-\d{2}-\d{2}|\d{3}-\d{2}-\d{2}-\d{3})'
        match = re.search(pattern, text)
        if match:
            return match.group(1)
        return None
