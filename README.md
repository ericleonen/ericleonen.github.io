Eric Leonen's README here

## Adding origami to the gallery

Two files, same name — that's the whole process:

1. Put the photo in `public/origami/` — e.g. `public/origami/lang-scorpion.webp`
   (`.webp`, `.jpg`, `.png`, and `.gif` all work).
2. Put the caption in `src/content/origami/` with the **same** filename —
   `src/content/origami/lang-scorpion.md`:

   ```markdown
   ---
   title: "Scorpion Varileg"
   date: 2026-08-14
   designer: "Robert Lang"
   designerUrl: "https://langorigami.com"
   paper: "40 cm double tissue"
   ---

   The **hardest** part was the *sink fold* in the tail.
   ```

Only `title` is required. `designer` and `paper` render as a credit line under
the title; `date` both displays and sorts (dated models come first, newest
first, ahead of undated ones).

The photo is matched to the caption by filename, so there's nothing else to wire
up. The body is regular markdown — inline links, bold, italics all render.

`src/content/origami/_template.md` is a copy-paste starting point; anything
starting with `_` is ignored by the site. Models are shown newest `date` first.

## Editing the home page

Everything on the home page comes from `src/content/home.md`'s frontmatter: the
name, links, emails, the "works in progress" list, and the "outside of academics"
sentence (`outsideOfAcademics` — each entry is one comma-separated clause with an
emoji and a link; the sentence re-punctuates itself when you add or reorder them).
