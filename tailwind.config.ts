import type { Config } from "tailwindcss";

/**
 * Tokens live as CSS variables in globals.css (single source of truth) and are
 * surfaced here as semantic Tailwind colors. Light theme only — no dark mode.
 * Accent is warm amber (#B25E09). No purple anywhere.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        panel: "var(--panel)",
        muted: "var(--muted)",
        label: "var(--label)",
        mid: "var(--mid)",
        faint: "var(--faint)",
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
          strong2: "var(--line-strong-2)",
        },
        wash: {
          DEFAULT: "var(--bg-wash)",
          hover: "var(--bg-hover)",
          track: "var(--bg-track)",
          deep: "var(--bg-wash-2)",
          deep2: "var(--bg-wash-3)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          bright: "var(--accent-bright)",
          tint: "var(--accent-tint)",
          tint2: "var(--accent-tint-2)",
          "tint-border": "var(--accent-tint-border)",
          "tint-fg": "var(--accent-tint-fg)",
        },
        ok: { DEFAULT: "var(--ok)", tint: "var(--ok-tint)" },
        warn: { DEFAULT: "var(--warn)", tint: "var(--warn-tint)" },
        danger: {
          DEFAULT: "var(--danger)",
          border: "var(--danger-border)",
          tint: "var(--danger-tint)",
          tint2: "var(--danger-tint-2)",
        },
        info: { DEFAULT: "var(--info)", tint: "var(--info-tint)" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "7px",
        md: "9px",
        lg: "12px",
      },
      boxShadow: {
        dropdown: "0 12px 32px rgba(16,25,42,.12)",
        drawer: "0 12px 40px rgba(16,25,42,.18)",
        card: "0 1px 2px rgba(16,25,42,.04)",
      },
      maxWidth: {
        content: "1240px",
      },
      keyframes: {
        reveal: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        fadein: { from: { opacity: "0" }, to: { opacity: "1" } },
        pop: {
          from: { opacity: "0", transform: "translateY(10px) scale(.98)" },
          to: { opacity: "1", transform: "none" },
        },
        slideright: {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "none" },
        },
        toastin: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "none" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        reveal: "reveal .42s cubic-bezier(.16,1,.3,1)",
        fadein: "fadein .2s ease",
        pop: "pop .16s ease",
        slideright: "slideright .28s cubic-bezier(.16,1,.3,1)",
        toastin: "toastin .24s cubic-bezier(.16,1,.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
