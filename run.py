#!/usr/bin/env python3
"""
OfferComparator - Narzędzie do porównywania ofert i generowania zapytań ofertowych
Uruchom ten plik aby wystartować aplikację webową
"""

import uvicorn
import webbrowser
from threading import Timer

def open_browser():
    """Otwiera przeglądarkę po uruchomieniu serwera"""
    webbrowser.open('http://localhost:8000')

if __name__ == "__main__":
    print("🚀 Uruchamianie OfferComparator...")
    print("📊 Aplikacja będzie dostępna na: http://localhost:8000")
    print("🛑 Aby zatrzymać naciśnij Ctrl+C")
    print("-" * 50)

    # Otwórz przeglądarkę po 1.5 sekundy (żeby serwer zdążył wystartować)
    Timer(1.5, open_browser).start()

    # Uruchom serwer FastAPI
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
