"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentIsDark = document.documentElement.classList.contains("dark");
    setIsDark(currentIsDark);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDark: boolean }>;
      if (customEvent.detail !== undefined) {
        setIsDark(customEvent.detail.isDark);
      } else {
        setIsDark(document.documentElement.classList.contains("dark"));
      }
    };

    window.addEventListener("vault_theme_change", handleThemeChange);

    // Also observe class changes directly on documentElement
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("vault_theme_change", handleThemeChange);
      observer.disconnect();
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("vault_theme", "dark");
      } catch {}
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("vault_theme", "light");
      } catch {}
    }

    window.dispatchEvent(new CustomEvent("vault_theme_change", { detail: { isDark: nextDark } }));
  };

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-full border border-black/10 dark:border-white/10 bg-transparent ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`p-2 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 transition-all active:scale-95 cursor-pointer shadow-xs ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0" />
      ) : (
        <Moon className="w-4 h-4 text-neutral-700 transition-transform -rotate-12" />
      )}
    </button>
  );
}
