"use client";

import { useEffect, useRef, useState } from "react";

export function AppleHero() {
  const heroRef = useRef<HTMLElement>(null);
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 450;
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      // Hero scale down slightly from 1 to 0.94, fade from 1 to 0.2, translate up
      setOpacity(Math.max(0, 1 - progress * 1.15));
      setScale(1 - progress * 0.06);
      setTranslateY(scrollY * 0.35);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative pt-32 pb-20 md:pt-44 md:pb-28 lg:pt-52 lg:pb-36 px-6 sm:px-12 flex flex-col items-center text-center select-none overflow-hidden"
      aria-label="VAULT Introduction"
    >
      <div
        style={{
          opacity,
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          willChange: opacity < 1 && opacity > 0 ? "transform, opacity" : "auto",
        }}
        className="max-w-4xl mx-auto transition-transform duration-75 ease-out"
      >
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-[-0.04em] text-black dark:text-white leading-[0.95] mb-5 sm:mb-6">
          VAULT
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-black/70 dark:text-white/70 font-normal tracking-[-0.015em] max-w-2xl mx-auto leading-relaxed">
          A gallery of digital experiences, web applications, and interactive systems.
        </p>
      </div>
    </section>
  );
}
