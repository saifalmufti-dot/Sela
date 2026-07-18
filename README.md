# Sela — صلة

**Your AI Workspace for Pharmacy.**

Sela is an AI assistant for pharmacists: ask about medicines, suppliers, offers,
jobs, conferences, and anything else in pharmacy.

This repository contains the Sela welcome page — a fully static, dependency-free
front end built from the product design mockup.

## Features

- **Prompt composer** — large ask-anything input with send button, plus
  Voice, Scan Barcode, and Upload PDF actions (UI placeholders for now)
- **Suggestion chips** — one-tap example prompts (Find Ozempic, Today's offers,
  Find Hikma, Market insights, Conferences this week, Drug recalls)
- **Frequent actions** — Find Medicine, Expiry Exchange, Hire a Pharmacist,
  and Find a Job cards
- **Time-aware greeting** — good morning / afternoon / evening based on the
  visitor's local time
- Bilingual brand mark (صلة / Sela) drawn as inline SVG, responsive layout
  down to mobile

## Running locally

No build step — it's plain HTML/CSS/JS. Serve the folder with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project structure

```
index.html    Page markup
styles.css    All styling (design tokens in :root)
script.js     Greeting, chip → composer wiring, submit handling
assets/       Logo and favicon SVGs
```

## Next steps

- Wire the composer to the Sela backend/AI API
- Implement voice input, barcode scanning, and PDF upload
- Replace the hard-coded user name with real authentication
- Arabic (RTL) localization of the full page
