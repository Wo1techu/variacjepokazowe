"""
Główna aplikacja FastAPI - OfferComparator
"""

from fastapi import FastAPI, UploadFile, File, Request, Form
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import List
import os
from pathlib import Path

from app.core.comparator import OfferComparator
from app.core.rfq_generator import RFQGenerator

# Inicjalizacja FastAPI
app = FastAPI(
    title="OfferComparator",
    description="Narzędzie do porównywania ofert Excel i generowania zapytań ofertowych",
    version="1.0.0"
)

# Ścieżki
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "app" / "uploads"
OUTPUT_DIR = BASE_DIR / "app" / "outputs"
STATIC_DIR = BASE_DIR / "app" / "static"
TEMPLATES_DIR = BASE_DIR / "app" / "templates"

# Upewnij się że katalogi istnieją
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Montowanie plików statycznych i szablonów
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# Inicjalizacja komponentów
comparator = OfferComparator()
rfq_generator = RFQGenerator()


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Strona główna aplikacji"""
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/compare", response_class=HTMLResponse)
async def compare_page(request: Request):
    """Strona porównywania ofert"""
    return templates.TemplateResponse("compare.html", {"request": request})


@app.get("/generate-rfq", response_class=HTMLResponse)
async def rfq_page(request: Request):
    """Strona generowania zapytań ofertowych"""
    return templates.TemplateResponse("rfq.html", {"request": request})


@app.post("/api/compare")
async def compare_offers(files: List[UploadFile] = File(...)):
    """
    Endpoint do porównywania przesłanych ofert Excel
    """
    if len(files) < 2:
        return {"error": "Potrzebujesz co najmniej 2 plików do porównania"}

    # Zapisz przesłane pliki
    saved_files = []
    for file in files:
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        saved_files.append(str(file_path))

    try:
        # Porównaj oferty
        result = comparator.compare_offers(saved_files)

        # Zapisz wynik do pliku Excel
        output_filename = f"porownanie_{len(files)}_ofert.xlsx"
        output_path = OUTPUT_DIR / output_filename
        comparator.save_comparison(result, str(output_path))

        return {
            "success": True,
            "data": result,
            "download_url": f"/download/{output_filename}"
        }
    except Exception as e:
        return {"error": f"Błąd podczas porównywania: {str(e)}"}
    finally:
        # Wyczyść przesłane pliki
        for file_path in saved_files:
            if os.path.exists(file_path):
                os.remove(file_path)


@app.post("/api/generate-rfq")
async def generate_rfq(
    project_name: str = Form(...),
    company_name: str = Form(...),
    deadline: str = Form(...),
    description: str = Form(...),
    template: str = Form("basic")
):
    """
    Endpoint do generowania zapytania ofertowego
    """
    try:
        data = {
            "project_name": project_name,
            "company_name": company_name,
            "deadline": deadline,
            "description": description
        }

        # Generuj dokument
        output_filename = f"zapytanie_ofertowe_{project_name.replace(' ', '_')}.docx"
        output_path = OUTPUT_DIR / output_filename

        rfq_generator.generate(data, str(output_path), template)

        return {
            "success": True,
            "message": "Zapytanie ofertowe wygenerowane pomyślnie",
            "download_url": f"/download/{output_filename}"
        }
    except Exception as e:
        return {"error": f"Błąd podczas generowania: {str(e)}"}


@app.get("/download/{filename}")
async def download_file(filename: str):
    """
    Pobieranie wygenerowanych plików
    """
    file_path = OUTPUT_DIR / filename
    if file_path.exists():
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type='application/octet-stream'
        )
    return {"error": "Plik nie istnieje"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "version": "1.0.0"}
