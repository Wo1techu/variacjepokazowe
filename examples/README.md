# Przykładowe pliki

Ten katalog zawiera przykładowe pliki Excel do testowania funkcji porównywania ofert.

## Jak wygenerować przykładowe pliki?

Uruchom skrypt z głównego katalogu projektu:

```bash
python create_examples.py
```

Skrypt utworzy 3 przykładowe oferty:
- **oferta_firma_a.xlsx** - oferta średnia (130,200 PLN)
- **oferta_firma_b.xlsx** - oferta najdroższa, rozbudowany zakres (196,500 PLN)
- **oferta_firma_c.xlsx** - oferta najtańsza, minimalny zakres (86,800 PLN)

## Jak używać przykładowych plików?

1. Uruchom aplikację: `python run.py`
2. Przejdź do zakładki "Porównaj oferty"
3. Przeciągnij wszystkie 3 pliki (lub wybierz je z dysku)
4. Kliknij "Porównaj oferty"
5. Zobacz szczegółowe porównanie i analizę cen!

## Struktura przykładowych ofert

Każda oferta zawiera:
- **Arkusz "Oferta"**: szczegółowy zakres prac z cenami
  - Pozycja
  - Zakres
  - Cena jednostkowa
  - Ilość
  - Wartość
  - Wykonawca

- **Arkusz "Podsumowanie"**: podsumowanie finansowe
  - Wartość netto
  - VAT 23%
  - Wartość brutto
  - Termin realizacji
  - Okres gwarancji

## Własne przykłady

Możesz stworzyć własne pliki Excel do porównania. Aplikacja automatycznie:
- Wykryje kolumny z cenami (szuka słów: "cena", "price", "kwota", "wartość", "koszt")
- Porówna wszystkie wspólne kolumny
- Wygeneruje szczegółowe zestawienie

**Wskazówka**: Dla najlepszych wyników, utrzymuj podobną strukturę kolumn w różnych ofertach.
