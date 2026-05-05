import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-inter)", "Inter", "sans-serif"] },
      colors: {
        brand: {
          primary: "#4F46E5",
          hover: "#6366F1",
          secondary: "#F59E0B",
          text: "#0F172A",
          muted: "#64748B",
          border: "#E2E8F0"
        }
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem"
      },
      boxShadow: {
        card: "0 0 0 1px rgba(0,0,0,.03), 0 2px 4px rgba(0,0,0,.05), 0 12px 24px rgba(0,0,0,.05)",
        "card-hover": "0 0 0 1px rgba(0,0,0,.03), 0 6px 16px rgba(79,70,229,.12), 0 24px 48px rgba(79,70,229,.08)",
        button: "0 4px 14px 0 rgba(79,70,229,.35)",
        glow: "0 0 20px rgba(79,70,229,.3)"
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-slow": "floatSlow 11s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s infinite",
        "fade-up": "fadeUp .4s ease both"
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(24px,-20px,0)" }
        },
        floatSlow: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(-24px,18px,0) scale(1.04)" }
        },
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: ".7" }
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")]
};

export default config;
