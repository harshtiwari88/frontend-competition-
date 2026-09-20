# Your life, in receipts

An interactive data story that turns eleven years of listening history and four years of spending into printed receipts. You can search them, zoom into eras, open any single day, solve cold cases hidden in the data, and download a receipt of what you found.

**Live demo:** `https://harshtiwari88.github.io/<repo-name>/`

![Hero, dark theme](docs/screenshots/01-hero-dark.png)

## The problem

Personal data (songs played, money spent) is usually shown as separate dashboards that nobody reads. Nothing connects a song to a purchase, and long histories are hard to scan. This project asks a simple question: what if the data read like a story?

- The whole record sits on **one strip** you can search and zoom.
- Every month and every day prints as a **receipt**, a format everyone already knows how to read.
- Three unrelated sources (music plays, a household ledger, a bank-card file) are laid on top of each other so patterns appear across them.
- No names, no accounts. The page only learns what was played and what was paid for.

## Features

| Area | What it does |
| --- | --- |
| **Story mode** | A two-minute scroll story. The strip follows along and each beat prints its own receipt. |
| **Explore strip** | Songs above the line, money below. Click a month, zoom into a chapter, or search any artist, food or festival and matches light up. |
| **Chapters** | Four eras detected from where the sources switch on and off, each with a listener persona. |
| **Taste charts** | Who owned each year, the impatience (skip) meter, and the explorer index. |
| **Patterns** | Six findings computed from the data, most of them clickable. |
| **Open any day** | Every song, ledger line and card swipe for one date, plus "threads" that link days sharing an artist, purchase or festival. |
| **Cold cases** | Six puzzles with clues. Answers open the day or pattern behind them. |
| **Your receipt** | A summary image generated in the browser. Nothing is uploaded. |

![Explore strip with search](docs/screenshots/02-explore-search.png)
![Open any day](docs/screenshots/03-open-any-day.png)

## Design

- **Receipts as the visual language.** Thermal-paper cards on a dark counter, with a light theme too.
- **Colour tokens** in `css/tokens.css` using `light-dark()` and `color-mix()`, so both themes share one set of variables. The charts read the same variables, so they re-theme instantly.
- **Type:** Bricolage Grotesque for headings and body, Geist Mono for receipt data.
- **Theme:** follows the system setting, has a manual toggle, and remembers the choice.

![Light theme](docs/screenshots/05-light-theme.png)

## Tech stack

Vanilla HTML, CSS and JavaScript. No framework, no build step, no dependencies to install.

- Modern CSS: custom properties, `light-dark()`, `color-mix()`, `clamp()`, `text-wrap`, grid, sticky positioning, `dvh`.
- JavaScript (ES2020): SVG charts drawn by hand, IntersectionObserver for the section highlight, Canvas for the downloadable receipt.
- Data loaded once from `data/data.json` with `fetch`.

## Project structure

```
.
├── index.html            page markup
├── css/
│   ├── tokens.css        colours, fonts, theme variables
│   ├── style.css         layout and components
│   └── responsive.css    breakpoints and reduced-motion rules
├── js/
│   ├── theme.js          light/dark toggle
│   └── app.js            data loading, charts, interactions
├── data/
│   └── data.json         the dataset (minified)
└── docs/screenshots/     images used in this README
```

## Accessibility

- Semantic landmarks, one `h1`, ordered headings, and a skip link.
- The strip is keyboard-operable: `Tab` to it, then `←` `→` step through months and `Home` / `End` jump to the ends. Changes are announced through a live region.
- Every control is a real button or input with a visible focus ring and an accessible name.
- Results, the month panel and case progress use `aria-live="polite"`.
- Toggle buttons expose `aria-pressed`, and the main strip chart has a text description.
- Body text and controls use high-contrast colours in both themes.
- `prefers-reduced-motion` turns off animations and smooth scrolling.

## Performance

- Data is a single minified JSON file, cached by the browser and compressed by the host, and it is preloaded from the HTML.
- Scripts use `defer`, so nothing blocks rendering. A status line shows while data loads, and a clear message appears if it fails.
- No images, no third-party scripts. Only two web fonts, with `display=swap`.
- Charts are plain SVG and update only what changed.

## Responsive

Checked from 320 px to 1920 px. On phones the nav scrolls sideways, chip rows scroll instead of wrapping, cards stack, and the story strip stays pinned.

![Mobile](docs/screenshots/06-mobile-hero.png)

## Run locally

The page fetches `data/data.json`, so serve the folder over http instead of opening the file directly:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy on GitHub Pages

1. Push this folder to the `main` branch of a repository.
2. **Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save.**
3. The site appears at `https://<username>.github.io/<repo-name>/`.

## About the data

The three source files are unrelated: a play history (2013 to 2024), a household ledger in INR (2015 to 2018) and a synthetic bank-card file (2022 to 2024). Treating them as one person is a storytelling choice. Play times are UTC, so the clock chart uses a slider instead of guessing a time zone.

## License

MIT. See [LICENSE](LICENSE).
