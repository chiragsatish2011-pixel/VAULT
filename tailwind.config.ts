import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#07070A",
          card: "#0d0d14",
          surface: "#12121c",
          border: "#1c1c2b",
          borderHover: "#2d2d42",
          text: "#f0f0f5",
          muted: "#8a8a9e",
          subtle: "#505064",
          accent: "#00F0FF",
          accentGlow: "rgba(0, 240, 255, 0.15)",
          violet: "#9d4edd",
          violetGlow: "rgba(157, 78, 221, 0.15)",
          emerald: "#10b981",
          amber: "#f59e0b",
          crimson: "#ff3366",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "Clash Display", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "radial-glow": "radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.12), transparent 70%)",
        "mesh-dark": "radial-gradient(at 0% 0%, rgba(157, 78, 221, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0, 240, 255, 0.08) 0px, transparent 50%)",
      },
      boxShadow: {
        "neon-cyan": "0 0 25px -5px rgba(0, 240, 255, 0.3)",
        "neon-violet": "0 0 25px -5px rgba(157, 78, 221, 0.3)",
        "glass-panel": "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-subtle": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-slow": "glow 8s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
