import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 2.0 设计系统色
        bg: {
          0: "#FAFAF9",
          1: "#F4F3EF",
          2: "#ECEAE4",
          inv: "#0D0D0B",
        },
        tx: {
          0: "#0D0D0B",
          1: "#1A1A18",
          2: "#4A4A45",
          3: "#8A8A82",
          inv: "#F0EDE8",
        },
        ac: {
          DEFAULT: "#B8922A",
          dim: "#7A5F1A",
        },
        // 四化语义色
        lu:   "#2D7A4A",
        quan: "#1A56A8",
        ke:   "#8A7018",
        ji:   "#A83228",
      },
      fontFamily: {
        sans: ["var(--font)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.05)",
        sm: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        md: "0 4px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)",
        lg: "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "999px",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
