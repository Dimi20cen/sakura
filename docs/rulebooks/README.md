# Rulebooks

This folder stores official rulebook sources and searchable text extracts.

## Files

- PDFs (authoritative originals):
  - `Rulebook-Base.pdf`
  - `Rulebook-Cities&Knights.pdf`
  - `Rulebook_Seafarers.pdf`
- Text extracts (for search/agent workflows):
  - `text/Rulebook-Base.txt`
  - `text/Rulebook-CitiesAndKnights.txt`
  - `text/Rulebook-Seafarers.txt`
- Chapter-structured summaries:
  - `summaries/Rulebook-Base-Summary.md`
  - `summaries/Rulebook-CitiesAndKnights-Summary.md`
  - `summaries/Rulebook-Seafarers-Summary.md`

## Usage Policy

- Treat PDFs as authoritative source material.
- Use summaries first for fast human-readable lookup.
- Use text extracts for deeper search (`rg`, diff, and parity audits).
- If extraction quality is unclear for a section, confirm against the PDF.

## Regenerating Text Extracts

Run from repo root:

```bash
mkdir -p docs/rulebooks/text
pdftotext -layout docs/rulebooks/Rulebook-Base.pdf docs/rulebooks/text/Rulebook-Base.txt
pdftotext -layout "docs/rulebooks/Rulebook-Cities&Knights.pdf" docs/rulebooks/text/Rulebook-CitiesAndKnights.txt
pdftotext -layout docs/rulebooks/Rulebook_Seafarers.pdf docs/rulebooks/text/Rulebook-Seafarers.txt
```
