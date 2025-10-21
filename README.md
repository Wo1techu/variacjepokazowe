# OfferComparator

Profesjonalne narzędzie do porównywania ofert Excel i generowania zapytań ofertowych (RFQ) z prostym interfejsem webowym.

## Możliwości

### 1. Porównywanie Ofert Excel
- Automatyczne porównanie wielu ofert Excel (min. 2 pliki)
- Wykrywanie i analiza cen
- Porównanie zakresów prac
- Kolorowe wyróżnienia różnic
- Export szczegółowego porównania do pliku Excel

### 2. Generator Zapytań Ofertowych (RFQ)
- Generowanie profesjonalnych dokumentów RFQ
- 3 gotowe szablony:
  - **Podstawowy** - prosty szablon do szybkiego utworzenia RFQ
  - **Szczegółowy** - rozbudowany szablon z wszystkimi sekcjami
  - **Budowlany** - dedykowany szablon dla branży budowlanej
- Export do formatu Word (.docx)
- Pełna personalizacja treści

## Instalacja i Uruchomienie

### Wymagania
- Python 3.10 lub nowszy
- pip (menedżer pakietów Python)

### Szybki start

1. **Sklonuj repozytorium:**
```bash
git clone https://github.com/Wo1techu/variacjepokazowe.git
cd variacjepokazowe
```

2. **Zainstaluj zależności:**
```bash
pip install -r requirements.txt
```

3. **Uruchom aplikację:**
```bash
python run.py
```

4. **Otwórz przeglądarkę:**
Aplikacja automatycznie otworzy przeglądarkę na adresie `http://localhost:8000`

Jeśli przeglądarka się nie otworzy automatycznie, wpisz ręcznie: `http://localhost:8000`

## Jak używać

### Porównywanie Ofert

1. Przejdź do zakładki **"Porównaj oferty"**
2. Przeciągnij pliki Excel na strefę przesyłania lub kliknij "Wybierz pliki"
3. Wybierz minimum 2 pliki Excel z ofertami
4. Kliknij **"Porównaj oferty"**
5. Poczekaj na wyniki analizy
6. Zobacz szczegółowe porównanie i pobierz raport Excel

**Wskazówki:**
- Pliki Excel powinny zawierać oferty w formacie tabelarycznym
- Dla najlepszych wyników, oferty powinny mieć podobną strukturę
- Aplikacja automatycznie wykryje kolumny z cenami (szuka słów: "cena", "price", "kwota", "wartość", "koszt")

### Generowanie Zapytań Ofertowych

1. Przejdź do zakładki **"Generuj RFQ"**
2. Wybierz odpowiedni szablon (podstawowy, szczegółowy lub budowlany)
3. Wypełnij formularz:
   - Nazwa projektu (wymagane)
   - Firma zamawiająca (wymagane)
   - Termin składania ofert (wymagane)
   - Opis przedmiotu zamówienia (wymagane)
   - Dane kontaktowe (opcjonalne)
4. Kliknij **"Generuj dokument"**
5. Pobierz wygenerowany dokument Word

**Wskazówki:**
- Formularz automatycznie zapisuje dane podczas wypełniania
- Dla szablonu budowlanego dostępne są dodatkowe pola (lokalizacja, czas realizacji)
- Możesz edytować wygenerowany dokument Word według potrzeb

## Struktura Projektu

```
variacjepokazowe/
├── app/
│   ├── core/                  # Główna logika aplikacji
│   │   ├── comparator.py      # Moduł porównywania ofert
│   │   └── rfq_generator.py   # Generator RFQ
│   ├── static/                # Pliki statyczne
│   │   ├── css/
│   │   │   └── style.css      # Style aplikacji
│   │   └── js/
│   │       ├── compare.js     # JavaScript dla porównywania
│   │       └── rfq.js         # JavaScript dla RFQ
│   ├── templates/             # Szablony HTML
│   │   ├── index.html         # Strona główna
│   │   ├── compare.html       # Strona porównywania
│   │   └── rfq.html           # Strona generatora RFQ
│   ├── uploads/               # Folder na przesłane pliki
│   └── outputs/               # Folder na wygenerowane pliki
├── examples/                  # Przykładowe pliki
├── tests/                     # Testy
├── requirements.txt           # Zależności Python
├── run.py                     # Plik uruchomieniowy
└── README.md                  # Dokumentacja
```

## Technologie

- **Backend:** FastAPI (Python)
- **Frontend:** Bootstrap 5, HTML, CSS, JavaScript
- **Przetwarzanie Excel:** pandas, openpyxl
- **Generowanie dokumentów:** python-docx
- **Serwer:** Uvicorn

## Funkcje dodatkowe

- ✅ Responsive design - działa na wszystkich urządzeniach
- ✅ Drag & drop dla plików
- ✅ Real-time progress tracking
- ✅ Auto-save formularzy
- ✅ Walidacja plików
- ✅ Kolorowe wyróżnienia w wynikach
- ✅ Export do Excel i Word

## Rozwiązywanie problemów

### Aplikacja nie startuje
- Upewnij się, że masz zainstalowany Python 3.10+
- Sprawdź czy wszystkie zależności są zainstalowane: `pip install -r requirements.txt`
- Sprawdź czy port 8000 nie jest zajęty przez inną aplikację

### Błąd podczas porównywania ofert
- Upewnij się, że pliki są w formacie Excel (.xlsx lub .xls)
- Sprawdź czy pliki nie są puste
- Upewnij się, że przesyłasz minimum 2 pliki

### Dokument RFQ nie generuje się
- Sprawdź czy wypełniłeś wszystkie wymagane pola (oznaczone *)
- Upewnij się, że termin składania ofert nie jest w przeszłości

## Roadmap (przyszłe funkcje)

- [ ] Eksport porównania do PDF
- [ ] Generowanie wykresów porównawczych
- [ ] Więcej szablonów RFQ
- [ ] Import szablonów własnych
- [ ] API dokumentacja (Swagger UI)
- [ ] Autentykacja użytkowników
- [ ] Historia porównań
- [ ] Powiadomienia email

## Licencja

MIT License - możesz swobodnie używać i modyfikować ten projekt.

## Kontakt

Masz pytania lub sugestie? Otwórz issue na GitHubie!

---

**Stworzone z ❤️ dla efektywnej pracy biznesowej**
