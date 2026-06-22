# Fonts

Drop your font files here. The app expects these filenames (referenced in `app/layout.tsx`):

- `Oddval-Semibold.ttf` — the default app font (`font-sans`). Declared with the
  full weight range `100 900`, so every Tailwind weight class renders this one
  file until you add real weights.
- `Geller-Regular.ttf` — alternate font (`font-geller`)

`.ttf`, `.otf`, and `.woff2` all work with `next/font/local`. `.woff2` is the
smallest/fastest if you have the choice.

## Adding more weights

In `app/layout.tsx`, add another entry to the font's `src` array, e.g.:

```ts
{ path: "./fonts/Oddval-Bold.ttf", weight: "700", style: "normal" }
```

Then update the filename here to match whatever you actually save.
