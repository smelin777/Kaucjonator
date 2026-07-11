# Kaucjonator 🍾

Aplikacja licząca w czasie rzeczywistym liczbę zebranych butelek i wysokość kaucji.

## Funkcje

- Przyciski **+** / **−** do zliczania zebranych butelek
- Suma butelek i kwoty kaucji (kolor zielony przy wartości dodatniej, czarny przy zerze)
- Edytowalna stawka kaucji (domyślnie 0,50 zł)
- Cel dzienny z paskiem postępu i konfetti po jego osiągnięciu
- Statystyki: wykres słupkowy i lista dni zbierania z liczbą butelek i sumą pieniędzy
- Reset dzisiejszego dnia (z potwierdzeniem)
- Udostępnianie wyniku jako grafika (systemowe okno udostępniania na telefonie lub pobranie pliku PNG)
- Dane zapisywane trwale między sesjami (localStorage w wersji samodzielnej)

## Uruchomienie lokalne

```bash
npm install
npm run dev
