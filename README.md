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
```

Aplikacja wystartuje pod adresem wypisanym w terminalu (domyślnie `http://localhost:5173`).

## Budowanie wersji produkcyjnej

```bash
npm run build
npm run preview
```

Pliki gotowe do wdrożenia znajdą się w katalogu `dist/`. Można je wrzucić np. na GitHub Pages, Netlify lub Vercel.

## Publikacja na GitHub Pages

Konfiguracja jest już ustawiona pod repo `smelin777/Kaucjonator`:

1. Zainstaluj zależności (jeśli jeszcze nie): `npm install`
2. Wdróż: `npm run deploy`
3. W repozytorium na GitHubie wejdź w **Settings → Pages** i jako źródło wybierz branch `gh-pages`.
4. Po chwili aplikacja będzie dostępna pod `https://smelin777.github.io/Kaucjonator`.

## Struktura projektu

```
kaucjonator-app/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx      # punkt wejścia React
│   ├── App.jsx        # główny komponent aplikacji
│   └── storage.js     # warstwa trwałego zapisu danych (localStorage)
```

## Uwagi

- Ta wersja zapisuje dane w `localStorage` przeglądarki, więc dane są lokalne dla danego urządzenia/przeglądarki.
- Stawka kaucji i cel dzienny są edytowalne przez ikonę ⚙️ w prawym górnym rogu.
