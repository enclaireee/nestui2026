# Non-Desktop Responsiveness, UX & Performance Audit

**Date:** 2026-07-26 · **Branch:** `fatih` · **Scope:** mobile (primary) + tablet. Desktop explicitly out of scope — nothing below asks for a desktop change.

## How this was produced

Two passes, and findings are labelled so you know which one they came from:

- **[measured]** — real Chrome (150), CDP-driven, 9 routes × 8 viewports (360×800, 390×844, 428×926, 844×390 landscape, 540×960, 600×960, 768×1024, 1024×768), plus targeted probes that opened the mobile menu and the competition modal and measured them. Performance numbers come from a **production build** (`next build` + `next start`) at 390×844 with **Slow 4G (1.6 Mbps / 150 ms RTT) + 4× CPU throttle** — roughly a mid-tier Android.
- **[code]** — static review. Applies to auth-gated routes the headless pass could not reach: the registration wizard, `/protected`, `/protected/resubmit/[id]`, and the admin dashboard/detail. These are read from source, not observed in a browser — treat sizes as computed-from-Tailwind, not verified pixels.

**What is already right, so nobody "fixes" it:** there is **no horizontal page scroll on any tested route at any tested breakpoint** — the usual vibe-coding tell is absent. `prefers-reduced-motion` is handled properly (global CSS rule + `MotionConfig reducedMotion="user"`). CLS is good everywhere measured (0.000–0.029). Inputs have real labels with `aria-describedby` wiring. The wizard persists its draft to `sessionStorage`.

**Severity:** Blocker = broken/unusable · High = works but materially fails or costs users · Medium = noticeably degraded · Low = polish.

---

## Global — site chrome (affects every route)

Header, footer and root layout live in `components/site-header.tsx`, `components/site-footer.tsx`, `components/reveal-footer.tsx`, `app/layout.tsx`.

### High — no `viewport-fit=cover`, so safe-area insets are unavailable app-wide

- **Breakpoints:** all mobile; visible on any notched/home-indicator iPhone.
- **What's wrong** [measured + grep]: the rendered viewport meta is exactly `width=device-width, initial-scale=1` — there is no `export const viewport` in [app/layout.tsx](app/layout.tsx). A repo-wide grep for `safe-area` / `env(` returns **zero hits**. Without `viewport-fit=cover`, `env(safe-area-inset-*)` resolves to `0px`, so safe-area handling is not merely missing — it is currently impossible to add without this change first.
- **Why it matters:** the reveal-footer is `position: fixed; bottom: 0` ([reveal-footer.tsx:29](components/reveal-footer.tsx#L29)), so its "Privacy Policy" and email links sit under the iOS home indicator on every page.
- **Fix:** add to [app/layout.tsx](app/layout.tsx):
  ```ts
  export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
  ```
  then add `pb-[env(safe-area-inset-bottom)]` to the footer's inner container.

### High — mobile menu has no focus trap and does not lock background scroll

- **Breakpoints:** 360, 390, 428, 540, 600 (hidden at ≥768).
- **What's wrong** [measured]: with the sheet open, `document.activeElement` is still `<body>`, the panel carries **no `role="dialog"` and no `aria-modal`**, **15 focusable elements behind it remain tabbable**, and `getComputedStyle(document.body).overflow === "visible"` — the page scrolls behind the open menu.
- **Why it matters:** keyboard and switch-control users tab straight out of the menu into the page underneath with no visual indication; scrolling the backdrop while the menu floats above it reads as a broken overlay.
- **Fix:** on the panel in [site-header.tsx:337-342](components/site-header.tsx#L337-L342) add `role="dialog" aria-modal="true"`, move focus to the first link on open and restore it on close, and set `document.body.style.overflow = "hidden"` while `menuOpen` (the `useEffect` at [line 160](components/site-header.tsx#L160) is already there to hang it off). `PopUpTemplate` already does this correctly via native `<dialog>` — reuse that pattern.

### High — footer tap targets are 16–20px tall on every page

- **Breakpoints:** all.
- **What's wrong** [measured, all viewports]: Instagram **20×20**, LinkedIn **20×20**, `nestui.ft@gmail.com` **158×16**, Privacy Policy **90×16**.
- **Why it matters:** ~20px against a 44px HIG / 48px Material floor. The two social icons sit `gap-3` (12px) apart, which is also under the 8px-minimum-plus-target spacing guidance — high mis-tap risk between them.
- **Fix:** in [site-footer.tsx](components/site-footer.tsx), give the icon anchors `flex h-11 w-11 items-center justify-center -m-2` (padding grows the target without moving the glyph) and the text links `inline-flex min-h-[44px] items-center`.

### Medium — header icon buttons are 32×32 and get squeezed to 29px at 360

- **Breakpoints:** 360 (worst), 390, 428, 540, 600.
- **What's wrong** [measured]: the hamburger is `h-8 w-8` = 32×32, and at 360px it renders **29×32** — the right pill spans x=154→344 of a 360px viewport and the button is being compressed by its own siblings. The logout icon button ([site-header.tsx:294](components/site-header.tsx#L294)) is also `h-8 w-8`, and the "NEST UI" wordmark link measures **92×24**.
- **Fix:** `h-11 w-11` on both icon buttons; drop the right pill to `pl-3 pr-1.5` at base and restore `pl-4 pr-2` at `sm:` to buy the room back.

### Medium — desktop nav pills (32px tall) are what tablets and phone-landscape actually get

- **Breakpoints:** 844×390 landscape, 768×1024, 1024×768.
- **What's wrong** [measured]: the hamburger is `md:hidden`, so from 768px up — **including a phone held in landscape at 844×390** — users get the inline nav: Home 72×32, About us 94×32, Registration 119×32, Contact 90×32. All 32px tall on a touch device.
- **Why it matters:** these are the primary navigation targets on every tablet and every landscape phone.
- **Fix:** `py-1.5` → `py-3` on the nav links in [site-header.tsx:93](components/site-header.tsx#L93) (the pill background grows with it, so it stays visually consistent); optionally raise the drawer breakpoint to `lg:` so tablets keep the sheet.

### Medium — `min-h-screen` (100vh) instead of dvh, on 13+ containers

- **Breakpoints:** all mobile browsers with collapsing chrome.
- **What's wrong** [code]: `min-h-screen` appears in the branding pages, `auth-page-shell`, `registration-page`, `protected/layout`, `admin` layouts, `not-found`. On iOS Safari `100vh` is the *large* viewport, so a "full height" container is ~90px taller than what is visible while the address bar is showing.
- **Fix:** `min-h-screen` → `min-h-dvh` (Tailwind 3.4 ships `dvh`; this project is on 3.4.1, so it needs no config change).

### Medium — the logout confirm dialog's buttons don't fit at 360px

- **Breakpoints:** 360 (and any 320px device).
- **What's wrong** [code]: [pop-up-template.tsx:64](components/registration/pop-up-template.tsx#L64) is `max-w-sm ... p-8`. The UA clamps a modal `<dialog>` to `calc(100% - 6px - 2em)` = 322px at 360, minus 64px of padding = **258px of content width**. The footer is `flex justify-center gap-3` with **no `flex-wrap`**, holding `Cancel` (`px-8`) and `Log Out` (`px-8` + a 16px icon + gap) — together ~276px of intrinsic width. They squash or spill.
- **Why it matters:** this dialog is mounted by `SiteHeader`, i.e. on every route, and it is the only way to log out on mobile.
- **Fix:** `p-8` → `p-6 sm:p-8` on the dialog and `flex-wrap justify-center` on the footer row; drop the buttons to `px-6`.

### Medium — dialog close button is a bare 20×20 icon

- **Breakpoints:** all mobile.
- **What's wrong** [code]: [pop-up-template.tsx:66-72](components/registration/pop-up-template.tsx#L66-L72) — `absolute right-5 top-5` on an `X` sized `h-5 w-5`, with no padding and no width/height. Tap target = the glyph, 20×20.
- **Fix:** add `flex h-11 w-11 items-center justify-center` and pull the offset to `right-2 top-2`.

### Low — sticky header costs 15% of the viewport in landscape

- **Breakpoints:** 844×390.
- **What's wrong** [measured]: header occupies ~60px of a 390px-tall viewport, and it is `sticky top-0`, so it never gives the space back. With mobile browser chrome on top of that, usable height is ~250px.
- **Fix:** `sticky` → `relative` below `sm:` in landscape, or shrink the pill to `h-10` at `max-h-[500px]` via a `@media (max-height: 500px)` rule.

---

## `/branding/mainpage` — Home

### Blocker — hero LCP image is served at 1920px for a 176px slot

- **Breakpoints:** all mobile.
- **What's wrong** [measured]: on the throttled mobile profile the **LCP element is `nestlogo.webp` served at `w=1920`** (88 KB, 2451 ms to download) while rendering at **176 CSS px**. `LCP = 2792 ms` — over Google's 2500 ms "good" threshold, and the image *is* the metric. Cause: [hero.tsx:60-67](app/branding/mainpage/section/hero.tsx#L60-L67) passes `width={800} height={800} priority` with **no `sizes` prop**, so `next/image` emits a fixed `1x/2x` srcset and a DPR-3 phone picks the 2x candidate.
- **Why it matters:** this is the single number that decides whether Home passes Core Web Vitals on mobile. One prop fixes it.
- **Fix:** add `sizes="(min-width: 768px) 288px, (min-width: 640px) 224px, 176px"` to that `<Image>`. Expected: 1920→640 candidate, ~88 KB → ~20 KB, LCP under 2s.

### Blocker — the second hero image is 14.5× oversampled

- **Breakpoints:** all mobile.
- **What's wrong** [measured]: `aboutheronest.webp` is requested at **`w=3840`** and rendered at **265 CSS px** on a 390px phone — a 14.5× linear oversample. Declared `width={2769}` with no `sizes` at [hero.tsx:75](app/branding/mainpage/section/hero.tsx#L75), and it carries `priority`, so it competes with the actual LCP image for bandwidth on the critical path.
- **Fix:** `sizes="(min-width: 768px) 480px, 100vw"`.

### High — first timeline milestone label runs off the left edge of the screen

- **Breakpoints:** **360×800 only** (fits from 390 up) — a textbook narrow-Android-only bug.
- **What's wrong** [measured]: the "Open Registration / & Preliminary" `<h4>` renders at **left = −3px**, i.e. 3px past the viewport's left edge, and 39px outside its own stage container (stage starts at x=36). It is `absolute top-[105%] ... whitespace-nowrap` at `clamp(26px, 3vw, 36px)` ([timeline.tsx:181-195](app/branding/mainpage/section/timeline.tsx#L181-L195)), centred on a node pinned at `left: 30%` of a 328px stage. No page scrollbar appears because left-side overflow doesn't create one in LTR — the text is simply cut off.
- **Why it matters:** the first word of the first milestone is clipped on the most common Android width.
- **Fix:** drop `whitespace-nowrap` on the mobile variant and let the label wrap, or clamp the font lower (`clamp(20px, 6vw, 36px)`) and cap the label at `max-w-[46vw]`. Nudge node 1 from `left: 30%` to `left: 36%`.

### High — competition modal is `90vh`, so its action row hides under iOS browser chrome

- **Breakpoints:** all mobile portrait; acute at 844×390.
- **What's wrong** [measured]: `max-h-[90vh]` resolves to **720px in an 800px viewport**, panel bottom at y=760. On iOS, `vh` is the *large* viewport, so with the address bar visible the actually-visible height is ~710px — the footer row holding **Guidebook** and **Register** falls below the fold with nothing indicating it's there. At 844×390 the panel is 351px tall and the scrollable body gets **~155px**.
- **Why it matters:** "Register" is the site's conversion action and it's the element that disappears.
- **Fix:** `max-h-[90vh]` → `max-h-[90dvh]` at [competition-modal.tsx:205](app/branding/mainpage/section/competition-modal.tsx#L205). Consider `h-[100dvh] max-h-none rounded-none sm:h-auto sm:max-h-[90dvh] sm:rounded-3xl` so it becomes a true full-screen sheet on phones.

### Medium — modal: no focus move, 36px close button, scroll chains to the page

- **Breakpoints:** all mobile.
- **What's wrong** [measured]: with the modal open `document.activeElement` is `<body>` — focus is never moved into the dialog (it does have `role="dialog" aria-modal="true"` and Esc works, so this is the last piece). Close button measures **36×36**. The scrolling body has `overscroll-behavior: auto`, so flicking past the end of the modal content scrolls the page behind it.
- **Fix:** focus the close button in the existing `useEffect` at [competition-modal.tsx:183](app/branding/mainpage/section/competition-modal.tsx#L183); `h-9 w-9` → `h-11 w-11`; add `overscroll-contain` to the scroller at [line 229](app/branding/mainpage/section/competition-modal.tsx#L229).

### Medium — the 540–767px dead zone in the timeline

- **Breakpoints:** 540, 600, up to 767.
- **What's wrong** [measured]: the desktop timeline is `hidden md:block`, so from 540 to 767px you get the mobile ribbon, which is hard-capped at `max-w-[360px] mx-auto`. At 600px that's a 360px illustration centred in a 600px column with ~120px of empty gutter each side; measured stage at 540 = x 90→450.
- **Fix:** let the mobile stage grow — `max-w-[360px]` → `max-w-[460px]` — or move the desktop breakpoint down to `sm:`/`lg:` so the transition lands where the layout actually changes.

### Medium — "See Details" is 39px tall; competition logos are 6.8× oversampled

- **Breakpoints:** all mobile.
- **What's wrong** [measured]: the CTA measures **158×39** — 5px under the 44px floor. Separately, the three logos declare `sizes="160px"` but render at **94px**, so at DPR 3 the browser resolves 480 → **640w served for a 94px slot**.
- **Fix:** `py-2.5` → `py-3` on `.btn-brand` call sites (or bake `min-h-[44px]` into `.btn-brand` in [globals.css](app/globals.css)); change `sizes="160px"` → `sizes="(min-width: 640px) 160px, 96px"` at [competition.tsx:149](app/branding/mainpage/section/competition.tsx#L149).

### Low — countdown unit labels are 12px

- **Breakpoints:** 360, 390, 428.
- **What's wrong** [measured]: "Days" / "Hours" / "Minutes" render at **12px** while the digits are 30px.
- **Fix:** `text-xs` → `text-sm` in `CountdownBlock` ([hero.tsx:157](app/branding/mainpage/section/hero.tsx#L157)).

---

## `/branding/aboutpage` — About

### Blocker — LCP 4436 ms, because the LCP text is hidden until framer-motion hydrates

- **Breakpoints:** all mobile.
- **What's wrong** [measured]: FCP 732 ms but **LCP 4436 ms**, and the LCP element is a `<P>` — the description paragraph. It is a `motion.p` with `variants={fadeUp}` starting at `opacity: 0` under `initial="hidden"` ([description.tsx:30-34](app/branding/aboutpage/sections/description.tsx#L30-L34)). Framer's `initial` doesn't resolve until hydration, so on a 4×-throttled CPU the page's largest text stays invisible for ~3.7s after first paint. This is exactly the failure mode the comment in [globals.css](app/globals.css) documents for the hero — the About page just doesn't follow it.
- **Why it matters:** 4.4s LCP is a failing Core Web Vital, and it's self-inflicted: the content is in the HTML the whole time.
- **Fix:** drop the entry animation from the above-the-fold `Description` block (or make it transform-only, no opacity, like `.hero-rise`). Everything below the fold can keep `whileInView` untouched.

### High — mission statement text overflows its pill container

- **Breakpoints:** **360×800** (3 of 5 pills) and **390×844** (1 of 5). Clean from 540 up.
- **What's wrong** [measured]: each mission sits in a fixed `h-24` (96px) container painted with `misicontainerMobile.webp`, with the copy in a `pl-28 pr-12` column. Measured text heights vs. the 96px pill: **124px (+14px over)**, 110px (+7), 110px (+7), 69px, 55px. The parent's `overflow` is `visible`, so the overrun **spills out over the pill's bottom edge onto the gap below**, not clipped — text floating outside its own background graphic.
- **Why it matters:** the longest mission is the first one, so it's the first thing anyone sees in that section.
- **Fix:** in [mission.tsx:38-42](app/branding/aboutpage/sections/mission.tsx#L38-L42), change `h-24` → `min-h-24` and the background to `bg-[length:100%_100%]` (already set) so the pill grows with its copy. Reclaim width with `pl-24 pr-6` at base.

### High — mission copy is 11px justified text in a ~160px column

- **Breakpoints:** 360, 390, 428 (16px from `sm:` up).
- **What's wrong** [measured]: computed font-size **11px** — the only sub-12px text found anywhere in the app. `text-justify` in a column roughly 160px wide (viewport minus `pl-28 pr-12`) produces heavy word-spacing rivers, and `leading-tight` on 11px is ~13.75px line height.
- **Fix:** `text-[11px]` → `text-sm`, drop `text-justify` below `sm:` (`text-left sm:text-justify`), `leading-tight` → `leading-snug`. Pairs with the `min-h-24` fix above, which gives the larger type somewhere to go.

### Medium — 14 sponsor logos and 3 photos ship at 640w for ~95px and 252px slots

- **Breakpoints:** all mobile.
- **What's wrong** [measured]: every `pastsponsors/Sponsor*.png` is fetched at **`w=640`** for rendered widths of 60–114px (ratios 5.6×–10.7×); `dokumnest*.jpg` at `w=640` for 252px. None declare `sizes` ([pastSponsors.tsx:86](app/branding/aboutpage/sections/pastSponsors.tsx#L86), [documentation.tsx:53](app/branding/aboutpage/sections/documentation.tsx#L53)).
- **Fix:** `sizes="(min-width: 768px) 220px, (min-width: 640px) 33vw, 45vw"` on the sponsor grid; `sizes="(min-width: 640px) 320px, 256px"` on the marquee photos.

### Medium — the photo marquee is hover-paused with no touch equivalent and no swipe

- **Breakpoints:** all mobile and tablet.
- **What's wrong** [code]: [documentation.tsx:41](app/branding/aboutpage/sections/documentation.tsx#L41) — `hover:[animation-play-state:paused]` is the only way to stop the 20s scroll. There is no tap-to-pause, no swipe, and no manual control. On touch the photos simply slide past and can never be looked at.
- **Fix:** make it a real scroller and delete the animation: `flex gap-4 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none]` with `snap-center` on each card. Native momentum scroll, swipeable, and it drops the infinite animation entirely.

---

## `/branding/contact` — Contact

Cleanest page measured: LCP 664 ms, CLS 0.000, no overflow at any breakpoint.

### Medium — contact-person rows and link rows are 20–36px tall

- **Breakpoints:** all mobile (measured identical at every viewport).
- **What's wrong** [measured]: the WhatsApp rows measure **278×36**, and the email / Instagram / LinkedIn rows inside "General & Socials" measure **278×20**. The WhatsApp rows are stacked `gap-2` (8px).
- **Why it matters:** these are the page's only purpose — six contact links, all under the touch floor, adjacent to each other.
- **Fix:** `py-2` → `py-3` on the WhatsApp anchors ([contact/page.tsx:141](app/branding/contact/page.tsx#L141)) and `min-h-[44px] items-center` on the three social rows ([lines 96-121](app/branding/contact/page.tsx#L96-L121)). Bump the gap to `gap-2.5`.

### Low — "Names link to WhatsApp" is the only affordance that these rows are links

- **Breakpoints:** all mobile.
- **What's wrong** [code]: a 12px caption below the grid is doing the work an icon or chevron in each row should do.
- **Fix:** add a small WhatsApp/arrow glyph inside each row (the competition modal's contact rows already do this with `ArrowRight`).

---

## `/branding/privacy` — Privacy Policy

No layout problems at any breakpoint. Long-form text renders correctly from 360 up.

### Medium — inline links are 20px tall

- **Breakpoints:** all mobile.
- **What's wrong** [measured]: `nestui.ft@gmail.com` **181×20**, `@nest_ui on Instagram` **169×20**.
- **Fix:** `inline-flex min-h-[44px] items-center` on the two contact anchors in the "Contact us" section.

---

## `/branding/registration` and `/branding/registration/sma` — the wizard

*Auth-gated; findings are [code] except where the same component was measured on a public page.*

### Blocker — every input is 14px, which triggers iOS zoom-on-focus

- **Breakpoints:** all iOS.
- **What's wrong**: [registration-input.tsx:80](components/registration/registration-input.tsx#L80) sets `text-sm` on the `<input>`. This component renders **every field in the app** — the wizard's up-to-36 fields, both auth forms, and the resubmit form. Measured on the public auth pages: computed `font-size: 14px` on all of them. iOS Safari zooms the viewport on focus for any input under 16px and **does not zoom back out**, so the user is left panned into a horizontally-scrolled page and has to pinch out between fields.
- **Why it matters:** this is the registration funnel, on phones, under a deadline. Highest-impact single fix in the audit.
- **Fix:** one character — `text-sm` → `text-base` in `RegistrationInput`. Add `sm:text-sm` if the smaller type is wanted on desktop.

### High — the step artwork pushes the actual form below the fold

- **Breakpoints:** 360, 390, 428, 540, 600 (grid is `grid-cols-1` until `md`).
- **What's wrong**: [registration-client.tsx:299-301](components/registration/registration-client.tsx#L299-L301) puts `StepIndicator` first in a single-column grid, and it renders a **288px-wide (`w-72`) decorative image** ([step-indicator.tsx:36](components/registration/step-indicator.tsx#L36)). Combined with `pt-28` on the wrapper, roughly the first 400px of a 800px viewport is chrome before the first field.
- **Why it matters:** this is the "multi-column layout naively stacked" pattern — the desktop rail is decorative context, but on mobile it takes the priority slot from the form.
- **Fix:** `order-2 md:order-1` on the rail div and `order-1 md:order-2` on the card, or hide the artwork below `md` and keep only the existing "Step N of M" text indicator, which already carries the same information.

### High — the step artwork is 209–278 KB of `priority` WebP with no `sizes`

- **Breakpoints:** all mobile.
- **What's wrong**: `regsteps1–4.webp` are 209/241/263/278 KB, declared `width={600} height={600} priority` with no `sizes`, and rendered at 288px on mobile — so a DPR-3 phone pulls the 2x candidate on the critical path of the registration form.
- **Fix:** add `sizes="(min-width: 1024px) 600px, (min-width: 768px) 500px, 288px"` and drop `priority` (it's below the header, not the LCP).

### Medium — student ID field has no numeric keyboard

- **Breakpoints:** all mobile.
- **What's wrong**: [person-form.tsx:96-105](components/registration/steps/person-form.tsx#L96-L105) — the `cfg.studentIdLabel` field (NIM / NISN) has no `inputMode`. Email, phone and URL fields are all correctly typed, so this is the one gap.
- **Fix:** `inputMode="numeric"` on that `RegistrationInput`.

### Medium — Back/Next sit top-right of the thumb zone at the end of a long form

- **Breakpoints:** all mobile.
- **What's wrong**: `NavButtons` ([registration-client.tsx:388-398](components/registration/registration-client.tsx#L388-L398)) is `flex justify-end gap-4` with `px-10 py-2.5` buttons (~40px tall). On the members step with 4 members that's ~28 fields of scroll before reaching them, and they land in the top-right — the hardest corner to reach one-handed.
- **Fix:** `py-2.5` → `py-3.5` and `flex-col-reverse gap-3 sm:flex-row sm:justify-end` so Next is full-width and lowest on mobile.

### Low — review step nests `max-w-md` inside an already-narrow card

- **What's wrong**: [review-submit.tsx:32](components/registration/steps/review-submit.tsx#L32) — `w-full max-w-md` inside a card that is already the full column width on mobile. Harmless at 360 but wastes width from 540 up.
- **Fix:** `max-w-md` → `md:max-w-md`.

---

## `/auth/login`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/update-password`

### Blocker — inputs are 14px (iOS zoom)

- **Breakpoints:** all iOS.
- **What's wrong** [measured]: `font-size: 14px` confirmed on `/auth/login` (email, password), `/auth/sign-up` (email + 2 passwords), `/auth/forgot-password` (email). Same `RegistrationInput` root cause as the wizard.
- **Fix:** see the wizard entry — one change covers all of these.

### Medium — "Forgot password?" and the footer link are 16–19px tall

- **Breakpoints:** all mobile.
- **What's wrong** [measured]: "Forgot password?" **115×16**, "Sign Up" **56×19**, "Login" **39×19**.
- **Why it matters:** password recovery is a stress path — a 16px target on a phone is where people give up.
- **Fix:** `inline-flex min-h-[44px] items-center px-2 -mx-2` on the `Link` at [login-form.tsx:65-70](components/login-form.tsx#L65-L70) and on the `footer` links in [auth-form.tsx](components/auth/auth-form.tsx).

### Low — 310 KB of JS for a two-field form

- **Breakpoints:** all mobile.
- **What's wrong** [measured]: `/auth/login` transfers **310 KB of JS** and 557 KB total, for a page that is a heading and two inputs. See the framer-motion item under Cross-Cutting Performance.

---

## `/protected` — participant dashboard

*Auth-gated; [code] only.*

### High — full Google Drive URLs are printed with `break-all`

- **Breakpoints:** all mobile.
- **What's wrong**: [link-row.tsx:8-15](components/link-row.tsx#L8-L15) renders the entire URL as the link text with `break-all`. A typical Drive folder URL is 60–90 characters, which at 360px wraps to 4–5 lines of character-broken gibberish, twice per submission card.
- **Why it matters:** the dashboard's job is "is my submission OK" — the status is buried under URL noise.
- **Fix:** render a label instead: `<a …>Open in Drive ↗</a>`, keeping the full URL in `title`/`aria-label`. This also fixes the admin detail page, which shares the component.

### Medium — member avatar rows are 36px tall

- **What's wrong**: `h-9 w-9` initials chip at [protected/page.tsx:216](app/protected/page.tsx#L216); the row itself is not interactive, so this is presentation, not a tap target — but the `mailto:` link under "Contact person" ([line 200](app/protected/page.tsx#L200)) is plain inline text and inherits ~20px.
- **Fix:** `inline-flex min-h-[44px] items-center` on the `mailto:` anchor.

### Low — "Submit again" competes with the section heading at 360

- **What's wrong**: [protected/page.tsx:255-263](app/protected/page.tsx#L255-L263) — `flex items-center justify-between` with an `h2` and a `px-4 py-2` button. Tight but does not wrap at 360.
- **Fix:** `flex-wrap gap-3` for safety.

---

## `/protected/resubmit/[id]`

### High — the copy-account-number button is a ~14px tap target

- **Breakpoints:** all mobile.
- **What's wrong** [code]: [resubmit-form.tsx:87-94](components/registration/resubmit-form.tsx#L87-L94) — a `<button>` wrapping only a `h-3.5 w-3.5` icon, with no padding, no min size. That is a **14×14** target, the smallest in the app, and it's the affordance for copying a bank account number people are about to transfer money to.
- **Fix:** `inline-flex h-11 w-11 items-center justify-center -my-3` and bump the icon to `h-4 w-4`.

### Medium — inputs 14px (iOS zoom) and 40px-tall action buttons

- **What's wrong** [code]: same `RegistrationInput` (`text-sm`); Cancel/Submit are `px-8 py-2.5` ≈ 40px.
- **Fix:** covered by the global `text-base` change; `py-2.5` → `py-3.5`.

---

## `/admin` and `/admin/registrations/[id]` — admin panel

*Auth-gated; [code] only. Lower priority than participant routes — admins are likelier to be on a laptop — but the panel is used at events, on phones.*

### High — a 9-column table with no mobile treatment and no scroll affordance

- **Breakpoints:** 360–767.
- **What's wrong**: [admin/(protected)/page.tsx:147](app/admin/(protected)/page.tsx#L147) wraps a 9-column table (Code, Team, Competition, Members, Leader Email, Leader Phone, Submissions, Registered, Status) in a bare `overflow-x-auto`. At 360px roughly two columns are visible; nothing indicates the other seven exist — no edge fade, no scroll hint, no card fallback.
- **Fix:** the cheap version is a scroll affordance — add `[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]` to the wrapper and a "swipe for more →" caption below `md`. The right version is a card list below `md`: `<div className="md:hidden">` rendering one card per row with Code/Team/Status prominent.

### Medium — `title` tooltips are the only way to see truncated URLs

- **Breakpoints:** all touch.
- **What's wrong**: `LinkCell` at [admin/(protected)/page.tsx:390-401](app/admin/(protected)/page.tsx#L390-L401) is `max-w-[12rem] truncate` with the full URL in `title=` — a hover-only affordance with no touch equivalent. On a phone the admin sees a truncated URL and has no way to read it without navigating.
- **Fix:** drop the `title` reliance; the link already opens in a new tab, so show a stable label (`Payment ↗`) instead of a truncated URL.

### Medium — admin login inputs are 14px (iOS zoom)

- **What's wrong** [measured]: `font-size: 14px` on both fields — these are hand-written classes at [admin/login/page.tsx:29,37](app/admin/login/page.tsx#L29), **not** `RegistrationInput`, so the global fix does not reach them.
- **Fix:** `text-sm` → `text-base` on both inputs.

### Medium — filter tabs and pager links are ~32px tall

- **What's wrong**: `ModeTab`, `Tab` and the Pager links are all `py-1.5` ≈ 32px. There are 5 filter chips plus 2 mode tabs in a `flex-wrap gap-2` at the top of the page.
- **Fix:** `py-1.5` → `py-2.5` on all three.

### Low — fixed `p-6` padding on the admin shell

- **What's wrong**: [admin/(protected)/layout.tsx:28](app/admin/(protected)/layout.tsx#L28) — `p-6` at every width; header is `px-6 py-4`. At 360 that's 48px of the viewport spent on gutters around a table that is already too narrow.
- **Fix:** `p-4 md:p-6`.

---

## `/not-found` and `app/error.tsx`

### Medium — 404 logo is served at 1200px for a 96px slot

- **Breakpoints:** all mobile.
- **What's wrong** [measured]: `nestlogo.webp&w=1200` fetched for a `w-24` (96px) image — a 12.5× oversample on the page people hit *because something already went wrong*. Declared `width={600} height={580}` with no `sizes` at [not-found.tsx:14](app/not-found.tsx#L14).
- **Fix:** `sizes="96px"`.

### Low — `error.tsx` renders with no site chrome

- **What's wrong** [code]: [app/error.tsx](app/error.tsx) is `min-h-[60vh]` with no header — on mobile the only escape is the browser back button, since "Try again" re-runs the same failing render.
- **Fix:** add a `Link href="/branding/mainpage"` next to "Try again", and `min-h-[60dvh]`.

---

## Cross-cutting performance (measured, production build, 390×844, Slow 4G + 4× CPU)

| Route | FCP | **LCP** | CLS | JS | Images | Total |
|---|---|---|---|---|---|---|
| `/branding/mainpage` | 956 ms | **2792 ms** ⚠️ | 0.029 | 307 KB | 244 KB | 799 KB |
| `/branding/aboutpage` | 732 ms | **4436 ms** ❌ | 0.002 | 311 KB | 155 KB | 789 KB |
| `/auth/login` | 660 ms | 660 ms ✅ | 0.001 | 310 KB | 15 KB | 557 KB |
| `/branding/contact` | 664 ms | 664 ms ✅ | 0.000 | 309 KB | 40 KB | 593 KB |

CLS is genuinely good everywhere — that box is ticked. LCP is the problem, and on both failing routes the cause is a single fixable thing (an unsized image on Home, an opacity-0 entry animation on About).

### High — `app/icon.png` is 98 KB and downloads on every single route

- **What's wrong** [measured]: `app/icon.png` is a **256×247 PNG weighing 98,087 bytes** — it is the **largest single resource on 3 of the 4 measured pages**, ahead of the font and every JS chunk. A 256px icon should be 5–10 KB; this one carries an embedded ICC profile and no compression pass.
- **Why it matters:** ~90 KB of pure waste on every page load, competing for bandwidth during the LCP window on a 1.6 Mbps link.
- **Fix:** run it through `pngquant`/`oxipng`, or replace with a 96×96. Expect ~98 KB → ~6 KB.

### High — the font is a 231 KB TTF, not WOFF2

- **What's wrong** [measured]: `app/fonts/Oddval-Semibold.ttf` is 231 KB on disk, **94 KB over the wire, 2005–2277 ms to arrive** on every measured route. `display: swap` is correctly set, so there is no FOIT — but there is a guaranteed font swap ~2s in on every cold load.
- **Fix:** convert to WOFF2 (`fonttools`: `fonttools ttLib.woff2 compress`). Typically 30–50% smaller than gzipped TTF and it removes a decompression step. Then add `preload: true` to the `localFont` call.

### Medium — framer-motion ships on 100% of routes, including static ones

- **What's wrong** [measured]: 307–311 KB of JS on *every* route, including `/auth/login`. The framer-motion chunk is `449xsog_ccl92.js` — **133 KB raw / 43 KB transferred** — and it loads everywhere because `SiteHeader` is a client component that animates (`motion.header`, `useScroll`, `AnimatePresence`, the `layoutId` nav pill).
- **Why it matters:** on a 4× CPU throttle that is parse/execute time on the critical path of pages with no animation to speak of.
- **Fix (cheap):** the header's entry animation and scroll-progress bar are both achievable in CSS (`@keyframes` + `animation-timeline: scroll()`, with the existing bar as the fallback). Dropping framer from `SiteHeader` alone takes it off `/auth/*`, `/privacy` and `/admin/*`. **Fix (cheapest):** leave it, and just make the two LCP fixes above — framer isn't what's failing the vitals today.

### Medium — no responsive `sizes` on 9 of 12 `next/image` call sites

Consolidated from the per-route findings — measured served-vs-rendered ratios on a 390px phone:

| Image | Served | Rendered | Ratio |
|---|---|---|---|
| `aboutheronest.webp` (home, `priority`) | 3840w | 265px | **14.5×** |
| `aboutheronest.webp` (about, `priority`) | 3840w | 308px | **12.5×** |
| `nestlogo.webp` (home hero, **LCP**) | 1920w | 176px | **10.9×** |
| `nestlogo.webp` (404) | 1200w | 96px | **12.5×** |
| `pastsponsors/Sponsor7.png` | 640w | 60px | **10.7×** |
| `tagline.webp` (footer, every page) | 640w | 86px | **7.4×** |
| competition logos | 640w | 94px | **6.8×** |
| `dokumnest*.jpg` | 640w | 252px | 2.5× |

The three floaters on Home *do* have correct `sizes` and land at 3.6–4.0× (DPR-3 is doing that, not a bug) — so the pattern is understood in this codebase, it just wasn't applied consistently.

### Low — `public/mainlogo.png` is a 572 KB unreferenced asset

- **What's wrong** [grep]: no reference anywhere in `app/`, `components/` or `lib/`. Not served, so it costs users nothing — but it's the largest file in `public/`.
- **Fix:** delete it.

---

## Accessibility (mobile-relevant)

- ✅ **Reduced motion**: correctly handled twice over — a global CSS rule in [globals.css](app/globals.css) plus `MotionConfig reducedMotion="user"`. The near-zero-duration approach (rather than `none`) so `transitionend` still fires is the right call.
- ✅ **Icon-button labels**: `aria-label` present on the hamburger, logout, modal close, and copy-account buttons.
- ✅ **Form semantics**: `RegistrationInput` wires `htmlFor`/`id`, `aria-describedby`, `aria-invalid`, and `focusFirstError()` scrolls the first bad field into view.
- ⚠️ **Focus order / trapping**: broken for the mobile menu (no trap, background tabbable — see Global). Focus is never moved into the competition modal.
- ⚠️ **Hover-only information**: `LinkCell`'s `title` tooltip in admin, and the marquee's `hover:pause` on About — neither has a touch equivalent.
- ⚠️ **Contrast at mobile sizes**: not measured in this pass. The most likely offenders by inspection are `text-white/40`–`/45` captions ("Each submission needs its own paid fee", "Names link to WhatsApp", fee `until` dates) on translucent surfaces — white at 40% over `bg-brand-green` is around 3:1, which fails AA for the 11–12px sizes they're used at. Worth a dedicated contrast pass.
- ❌ **Screen reader pass**: not performed — VoiceOver/TalkBack testing needs a real device and is out of reach for this pass. Recommend running it on registration and login specifically, since those are the two flows that matter.

---

## Top 10 quick wins

Ordered by impact ÷ effort. The first four are one-line changes that fix a Blocker each.

| # | Fix | Where | Impact |
|---|---|---|---|
| 1 | `text-sm` → `text-base` on the input | [registration-input.tsx:80](components/registration/registration-input.tsx#L80) | Kills iOS zoom-on-focus across **the whole registration funnel, both auth forms and resubmit** in one character. Add the same to the two hand-rolled admin login inputs. |
| 2 | Add `sizes="(min-width: 768px) 288px, (min-width: 640px) 224px, 176px"` to the hero logo | [hero.tsx:60-67](app/branding/mainpage/section/hero.tsx#L60-L67) | Home LCP is *this image*. 1920w → 640w, ~88 KB → ~20 KB. Should take LCP from 2792 ms to under 2s. |
| 3 | Remove the opacity-0 entry animation from the About description | [description.tsx:30-34](app/branding/aboutpage/sections/description.tsx#L30-L34) | About LCP **4436 ms → ~750 ms**. The content is already in the HTML; framer is just hiding it until hydration. |
| 4 | Compress `app/icon.png` (98 KB → ~6 KB) | [app/icon.png](app/icon.png) | Removes the single largest resource from **every page load** site-wide. Pure `pngquant` run, no code change. |
| 5 | `max-h-[90vh]` → `max-h-[90dvh]` on the competition modal | [competition-modal.tsx:205](app/branding/mainpage/section/competition-modal.tsx#L205) | Stops the **Register** button hiding under iOS browser chrome. One word. |
| 6 | Add `viewport-fit=cover` via `export const viewport` | [app/layout.tsx](app/layout.tsx) | Unblocks all safe-area handling; without it `env(safe-area-inset-*)` is permanently `0`. Prerequisite for the footer fix. |
| 7 | `h-24` → `min-h-24` on the mission pills, `text-[11px]` → `text-sm` | [mission.tsx:38-42](app/branding/aboutpage/sections/mission.tsx#L38-L42) | Fixes text spilling out of its own background graphic at 360/390 **and** the only sub-12px text in the app. |
| 8 | Bake `min-h-[44px]` into `.btn-brand` / `.btn-ghost` / `.btn-ghost-muted` | [globals.css](app/globals.css) | One place, and every primary/secondary button in the app clears the touch floor — "See Details" (39px), wizard Back/Next, resubmit actions. |
| 9 | Give footer + header icon buttons a 44px box | [site-footer.tsx](components/site-footer.tsx), [site-header.tsx](components/site-header.tsx) | The 20×20 social icons and 32×32 hamburger are on **every page**; `flex h-11 w-11 items-center justify-center -m-2` grows the target without moving anything visually. |
| 10 | Add `sizes` to the remaining 8 unsized `<Image>` call sites | see the table above | 6.8×–14.5× oversampling on sponsors, the second hero image, footer tagline, 404 logo. Mechanical, no visual change, meaningful bytes on a 1.6 Mbps link. |

**Deliberately not in the top 10:** the mobile-menu focus trap (#High, but a real component change), the admin table card view (real redesign), dropping framer-motion from `SiteHeader` (worthwhile, but the vitals fail for other reasons today), and the timeline label clip at 360 (real, but it's one label on one width — fix it in the same pass as #7).
