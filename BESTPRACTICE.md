# BESTPRACTICE.md — why this site reads as cheap, measured against sites that don't

Not opinion. Every reference below was loaded in a real browser at 1440×900 and its
computed styles were read off the DOM. Every claim about this repo cites a file or a
counted grep. Fix list at the bottom, ordered by impact per hour.

## The reference set

Deliberately mixed, so the conclusions aren't "just go dark and minimal":

| Site | Why it's here |
|---|---|
| **config.figma.com** | A loud, saturated **green** event site. Proves colorful ≠ cheap. Closest analogue to NEST. |
| **lkelui.com** | The site you compared against. Dark, photographic, same university-org category. |
| **linear.app** | The current benchmark for surface + type discipline. |
| **stripe.com** | Light background, heavy gradient usage — done correctly. |

### Measured, hero viewport only

| | body text | display text | weights in use | corner radii in use |
|---|---|---|---|---|
| Linear | 13–15px / **400** | 64px / **510** | 400, 510, 590 | 6px, 4px, pill |
| Stripe | 14px / **300** | 48px / **300** | 300, 400, 500 | 4px, 6px |
| Config | 16px / **400** | 36px / **400** | **400 only** | **none (0px)** |
| LKEL | 14px / 600 | 60px / **200** | 200, 400, 500, 600, 700 | 2px, 4px, pill |
| **NEST (this repo)** | 18px / **600** | 60px / **800** | **600, 800, 500** | 24px, pill, + 4 more sitewide |

That table is the whole essay. Read down the "weights" and "display text" columns.

---

## 1. Large text must get *lighter*, not heavier — and you own one font file

**What the references do.** Every single one makes its biggest text *thinner* than its
smallest text. Stripe's 48px headline is weight **300**. LKEL's 60px headline is weight
**200**, while its 12px eyebrow labels are **700**. Linear's 64px headline is **510** —
lighter than its own 590 nav labels. Large glyphs already carry visual weight through
sheer area; adding stroke weight on top makes them shout.

**What this repo does.** The inverse: the 60px countdown is weight **800**, the heaviest
thing on the page. And it doesn't matter anyway, because:

[app/fonts/](app/fonts/) contains exactly one file — `Oddval-Semibold.ttf` — and
[layout.tsx:47-58](app/layout.tsx#L47-L58) declares it as `weight: "100 900"`. The
codebase writes **148 weight utilities**:

```
70  font-bold
56  font-semibold
11  font-medium
 6  font-extrabold
 5  font-black
 1  font-normal
 1  font-light
```

**Every one of them renders identical glyphs.** There is no typographic hierarchy on this
site — not a weak one, literally none. `font-light` and `font-black` are the same pixels.
Browsers won't synthesise a lighter face, so the `100 900` declaration silently flattens
everything to Semibold.

**Fix.** Obtain Oddval Regular + Bold (or Light/Regular/Bold) and register them as
separate `src` entries. Then: display text at Light/Regular, small labels at Bold. This is
one commit and it is the highest-impact change available.

---

## 2. There is no value anchor — everything sits in one tonal band

**What the references do.** Each one establishes a hard extreme and hangs everything off
it. Config is the instructive case: the background is a loud saturated green, but the
content sits on a **pure black card** (`rgb(0,0,0)`). The green is allowed to be loud
*because* the black gives the eye somewhere to rest. Stripe: near-black on white. Linear:
white on `#08090A`. LKEL: white on near-black, ~19.9:1.

**What this repo does.** Primary text against the page background, measured:

| color | contrast |
|---|---|
| `--brand-lime` `#E3EF26` | **1.5:1** |
| `--brand-butter` `#FFF478` | **1.67:1** |
| `--brand-cream` `#FFFDEE` | **1.85:1** |

WCAG AA for body text is 4.5:1. These are 1.5. "Registration closes in"
([hero.tsx:85](app/branding/mainpage/section/hero.tsx#L85)) is pale yellow on light green;
the "Healthynovation" card heading is green on green and effectively invisible in the
render. Cards are mid-green on a mid-green background, so they don't read as surfaces —
they read as smudges.

This is the root cause of "cheap." Nothing recedes, nothing advances, so the eye has no
path through the page.

**Fix.** You already have `--brand-green` `#0C342C`, which hits **7.18:1** against the page
background. Make it a real surface: cards and content panels get a solid `#0C342C` fill
with cream text on top. Stop tinting text to match its own background.

---

## 3. Gradients belong in the background, never in the letterforms

**What the references do.** Zero of the four gradient-fill their text. Stripe has the most
aggressive gradient on the web — and it's a **background ribbon**, positioned off to the
right where it never sits behind a glyph. Stripe's headline changes color mid-sentence, but
as two flat solid colors marking a semantic break, not a per-glyph ramp.

**What this repo does.** 43 `bg-gradient` / `bg-clip-text` / `text-gradient-brand` usages.
The hero *paragraph* — body copy, the thing whose only job is legibility — is a three-stop
gradient at [hero.tsx:81](app/branding/mainpage/section/hero.tsx#L81). The nav wordmark is a
green gradient on dark green ([site-header.tsx:70-76](components/site-header.tsx#L70-L76))
and is unreadable and clipped in the render.

Gradient-filled body text is a first-tier amateur signal. It has no upside — it costs
legibility to buy decoration on the one element that shouldn't be decorated.

**Fix.** Flat color on all body copy, all card text, all labels, and the nav wordmark.
Keep `.text-gradient-brand` for exactly one hero moment (the countdown digits) and delete
the other ~40 usages.

---

## 4. The type scale is compressed and bottom-heavy

**What the references do.** Linear runs 64px against 15px — a **4.3× ratio** — and puts
nothing in between. Stripe: 48px against 14px. The jump is dramatic and the middle is
empty, which is what makes a hierarchy legible at a glance.

**What this repo does.** 147 of 245 size utilities are `text-sm` or `text-xs`:

```
101  text-sm     46  text-xs     19  text-lg     16  text-base
 15  text-3xl    13  text-5xl    13  text-2xl     7  text-xl
```

Dense small bold text everywhere, with the middle of the scale (`lg`/`xl`/`2xl`) crowded
rather than empty. Card body copy is tiny and centered, which compounds it.

**Fix.** Pick four steps and delete the rest: `text-sm` (meta), `text-base` (body),
`text-3xl` (section), `text-6xl` (display). Widen the gap; don't fill it.

---

## 5. Two buttons, one geometry

**What the references do.** Stripe ships exactly two in the hero — solid indigo and white
outline — at identical height, padding, and 4px radius. LKEL ships two outlined buttons,
identical but for border color. Linear ships one pill.

**What this repo does.** Four different button languages on the landing page alone:
`.btn-brand` gradient pill ([globals.css](app/globals.css)), the nav's white pill
([site-header.tsx:88-94](components/site-header.tsx#L88-L94)), the yellow "See Details"
pill, and "Explore Now" — which is a **raster image**
([hero.tsx:159-166](app/branding/mainpage/section/hero.tsx#L159-L166)) and therefore can
never match the others, can't take a focus ring, and can't scale with the type.

**Fix.** `.btn-brand` and `.btn-ghost` already exist and are well-built. Route every button
through them. Convert "Explore Now" from an image to a real `.btn-brand`.

---

## 6. Restrained corner radius

**What the references do.** Config: **0px, everywhere.** Stripe: 4px. Linear: 6px, plus
pills reserved for buttons only. LKEL: 2–4px. Tight radii read as precise; large radii read
as a template.

**What this repo does.** Five values in active use:

```
29  rounded-full    28  rounded-xl (12px)    20  rounded-lg (8px)
16  rounded-2xl (16px)    5  rounded-3xl (24px)
```

The hero card is `rounded-3xl` — 24px, larger than any radius on any reference site.

**Fix.** Two values total: one card/input radius (8px) and `rounded-full` for buttons only.

---

## 7. Decoration is monochrome and stays behind the content

**What the references do.** Config's background texture is elaborate — and it's **one grey**
at low contrast, fully behind the black card, never overlapping a letterform. Stripe's
ribbon occupies the right third and stops before the text column. Linear has no decoration
at all.

**What this repo does.** [main-page-content.tsx](app/branding/mainpage/main-page-content.tsx)
layers an SVG gradient background, `flowerfloater.webp`, and `rightfloater.webp`, and the
sections add more blobs — in five saturated colors, overlapping section edges and running
behind text. There are 20 `drop-shadow` usages on top. Four illustration idioms coexist:
flat paper-cut blobs, a rendered 3D-ish leaf, a hand-traced SVG blob for the countdown, and
flat Lucide line icons.

**Fix.** Pick one idiom. Desaturate all decoration to a single tint of the background and
drop it well below the text layer. Cut the drop-shadows to the two that carry real elevation.

---

## 8. Section titles are baked images, not text

**What the references do.** All four set every heading as live text. That's what lets the
headings share a scale with the body copy.

**What this repo does.** [competition.tsx](app/branding/mainpage/section/competition.tsx)
hand-traces "Our Competition" as a **1026×144 SVG path** with a baked drop-shadow filter,
mixing a script italic and a caps face in one wordmark. "The theme is…" uses a third style.
These can't align to any type scale, can't respond to the viewport, can't be selected or
translated, and can't inherit a color fix.

**Fix.** Set them as text in the real font. If a display face is genuinely needed, load it
as a webfont rather than tracing outlines.

---

## 9. Align to a grid edge, not to the center

**What the references do.** All four are left-aligned to a hard column edge. Config aligns
to two edges and lets a hairline rule carry the row separation. Secondary meta (dates) is
right-aligned to the opposite edge — a real grid, visible at a glance.

**What this repo does.** Everything is centered. The theme row has three cards of unequal
height; the competition section puts two cards in a row and then **orphans the third
centered underneath**; there's roughly 800px of dead vertical space before Timeline. The
hero text is indented by `pl-[11.6%]` — a hardcoded offset tuned to a decorative blob lobe
([hero.tsx:70](app/branding/mainpage/section/hero.tsx#L70)) rather than to any column.

**Fix.** Left-align section headings and card content to one column edge. Equal-height
cards via `grid` + `items-stretch`. Give the orphan card a 3-up row or a deliberate full
width.

---

## 10. Secondary information gets a quieter tier

**What the references do.** Config's dates are grey against white on black. Linear's
subhead is grey-white against pure white. LKEL's dates are small grey against white
headlines. Every reference has at least three explicit text tiers: primary / secondary /
meta.

**What this repo does.** Everything is full-saturation lime, butter, or white at weight
600. Dates, labels, body copy, and headings all compete at the same volume, so the eye
can't tell what to read first.

**Fix.** Three tiers: primary cream at 100% opacity, secondary cream at ~70%, meta cream at
~50% and one step down in size.

---

## Fix order

Ranked by visual impact per hour of work.

1. **Ship real font weights** (§1). One commit. Unlocks every other typographic fix — and
   nothing else on this list fully lands without it.
2. **Give cards and panels a solid `#0C342C` surface** (§2). Turns 1.5:1 into 7.2:1 and is
   the difference between "smudge" and "card."
3. **Delete gradient from all body and card text** (§3). Mechanical find-and-replace, ~40 sites.
4. **Collapse to two radii and route all buttons through `.btn-brand` / `.btn-ghost`** (§5, §6).
5. **Desaturate the decoration layer and push it behind the text** (§7).
6. **Left-align to a grid; fix the orphan card and the dead space** (§9).
7. **Convert the SVG title paths to real text** (§8).
8. **Introduce the three-tier text opacity scale** (§10).
9. **Prune the type scale to four steps** (§4).

Items 1–3 are most of the perceived gap. Everything after 4 is refinement.

---

## The one-sentence version

The references succeed by *withholding* — one or two weights, one accent, flat text, tight
radii, one decorative idiom, a hard value anchor — while this site applies gradient, shadow,
saturation, weight, and decoration to nearly every element simultaneously, which is exactly
the pattern the eye reads as cheap.

Config is the proof that the green isn't the problem.
