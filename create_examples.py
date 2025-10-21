#!/usr/bin/env python3
"""
Skrypt do tworzenia przykładowych plików Excel z ofertami do testowania aplikacji
"""

import pandas as pd
from pathlib import Path

# Utwórz katalog examples jeśli nie istnieje
examples_dir = Path("examples")
examples_dir.mkdir(exist_ok=True)

# Przykładowa oferta 1 - Firma A
data_offer_1 = {
    "Pozycja": [
        "Konsultacje wstępne",
        "Analiza wymagań",
        "Projektowanie systemu",
        "Implementacja modułu CRM",
        "Implementacja modułu raportowania",
        "Testy jednostkowe",
        "Testy integracyjne",
        "Wdrożenie",
        "Szkolenie użytkowników",
        "Wsparcie techniczne (3 miesiące)"
    ],
    "Zakres": [
        "2 spotkania po 2h",
        "Warsztat 5 dni",
        "Architektura systemu",
        "Moduł bazowy + 3 rozszerzenia",
        "Dashboard + 10 raportów",
        "Pokrycie 80%",
        "End-to-end testing",
        "Wdrożenie produkcyjne",
        "2 dni szkolenia dla 20 osób",
        "8h/miesiąc"
    ],
    "Cena jednostkowa (PLN)": [
        1200, 8000, 12000, 45000, 18000,
        8000, 6000, 15000, 8000, 9000
    ],
    "Ilość": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    "Wartość (PLN)": [
        1200, 8000, 12000, 45000, 18000,
        8000, 6000, 15000, 8000, 9000
    ],
    "Wykonawca": ["Firma A"] * 10
}

df1 = pd.DataFrame(data_offer_1)
df1.to_excel(examples_dir / "oferta_firma_a.xlsx", index=False)

# Przykładowa oferta 2 - Firma B (droższa, ale z większym zakresem)
data_offer_2 = {
    "Pozycja": [
        "Konsultacje wstępne",
        "Analiza wymagań",
        "Projektowanie systemu",
        "Implementacja modułu CRM",
        "Implementacja modułu raportowania",
        "Implementacja modułu analitycznego",  # dodatkowy moduł
        "Testy jednostkowe",
        "Testy integracyjne",
        "Testy akceptacyjne",  # dodatkowe testy
        "Wdrożenie",
        "Szkolenie użytkowników",
        "Wsparcie techniczne (6 miesięcy)"  # dłuższe wsparcie
    ],
    "Zakres": [
        "3 spotkania po 3h",
        "Warsztat 7 dni",
        "Architektura systemu + dokumentacja",
        "Moduł bazowy + 5 rozszerzeń",
        "Dashboard + 15 raportów + eksport",
        "AI-powered analytics",
        "Pokrycie 90%",
        "End-to-end testing",
        "UAT z klientem",
        "Wdrożenie produkcyjne + rollback plan",
        "3 dni szkolenia dla 30 osób",
        "16h/miesiąc"
    ],
    "Cena jednostkowa (PLN)": [
        1500, 10000, 15000, 52000, 22000, 25000,
        10000, 8000, 5000, 18000, 12000, 18000
    ],
    "Ilość": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    "Wartość (PLN)": [
        1500, 10000, 15000, 52000, 22000, 25000,
        10000, 8000, 5000, 18000, 12000, 18000
    ],
    "Wykonawca": ["Firma B"] * 12
}

df2 = pd.DataFrame(data_offer_2)
df2.to_excel(examples_dir / "oferta_firma_b.xlsx", index=False)

# Przykładowa oferta 3 - Firma C (najtańsza, minimalny zakres)
data_offer_3 = {
    "Pozycja": [
        "Konsultacje wstępne",
        "Analiza wymagań",
        "Projektowanie systemu",
        "Implementacja modułu CRM",
        "Implementacja modułu raportowania",
        "Testy",
        "Wdrożenie",
        "Szkolenie użytkowników",
        "Wsparcie techniczne (1 miesiąc)"
    ],
    "Zakres": [
        "1 spotkanie 2h",
        "Warsztat 3 dni",
        "Podstawowa architektura",
        "Moduł bazowy",
        "Dashboard + 5 raportów",
        "Testy podstawowe",
        "Wdrożenie",
        "1 dzień szkolenia dla 10 osób",
        "4h/miesiąc"
    ],
    "Cena jednostkowa (PLN)": [
        800, 6000, 9000, 35000, 12000,
        5000, 12000, 4000, 3000
    ],
    "Ilość": [1, 1, 1, 1, 1, 1, 1, 1, 1],
    "Wartość (PLN)": [
        800, 6000, 9000, 35000, 12000,
        5000, 12000, 4000, 3000
    ],
    "Wykonawca": ["Firma C"] * 9
}

df3 = pd.DataFrame(data_offer_3)
df3.to_excel(examples_dir / "oferta_firma_c.xlsx", index=False)

# Dodaj podsumowania na końcu każdego pliku
for file_path, df in [
    (examples_dir / "oferta_firma_a.xlsx", df1),
    (examples_dir / "oferta_firma_b.xlsx", df2),
    (examples_dir / "oferta_firma_c.xlsx", df3)
]:
    # Wczytaj z powrotem
    with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Oferta', index=False)

        # Dodaj arkusz podsumowania
        summary_data = {
            "Parametr": ["Wartość netto", "VAT 23%", "Wartość brutto", "Termin realizacji", "Okres gwarancji"],
            "Wartość": [
                df["Wartość (PLN)"].sum(),
                round(df["Wartość (PLN)"].sum() * 0.23, 2),
                round(df["Wartość (PLN)"].sum() * 1.23, 2),
                "90 dni roboczych",
                "12 miesięcy"
            ]
        }
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Podsumowanie', index=False)

print("✅ Utworzono przykładowe pliki Excel w katalogu 'examples/':")
print(f"   - oferta_firma_a.xlsx (Wartość: {df1['Wartość (PLN)'].sum():,.2f} PLN)")
print(f"   - oferta_firma_b.xlsx (Wartość: {df2['Wartość (PLN)'].sum():,.2f} PLN)")
print(f"   - oferta_firma_c.xlsx (Wartość: {df3['Wartość (PLN)'].sum():,.2f} PLN)")
print("\nMożesz ich użyć do przetestowania funkcji porównywania ofert!")
