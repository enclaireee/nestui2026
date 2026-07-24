import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The shared page backdrop, inlined so it scales to the full page height.
// Read once at module load; `preserveAspectRatio` makes it cover like a
// background-image instead of letterboxing.
export const bgSvg = readFileSync(
  join(process.cwd(), "public/mainpagebackground.svg"),
  "utf8",
).replace("<svg", '<svg preserveAspectRatio="xMidYMid slice"');
