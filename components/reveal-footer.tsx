"use client";

import { useEffect, useRef, useState } from "react";
import { SiteFooter } from "@/components/site-footer";

/**
 * Pins the footer to the bottom of the viewport *behind* the page content.
 * A spacer (sized to the footer) is added to the document flow so that
 * scrolling to the bottom lifts the page up and reveals the footer underneath.
 *
 * Render this as a sibling of the page's <main>, not inside it — the page's
 * background must sit above the footer for the reveal to work.
 */
export function RevealFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Reserves scroll room so the fixed footer below can be revealed. */}
      <div aria-hidden style={{ height }} />
      <div ref={ref} className="fixed bottom-0 left-0 z-0 w-full">
        <SiteFooter />
      </div>
    </>
  );
}
