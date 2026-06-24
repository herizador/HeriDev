/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        fondo: "#05050a",
        cian: "#00f3ff",
        morado: "#9d00ff",
        gris: "#1a1a2e",
        texto: "#e0e0e0",
      },
      fontFamily: {
        mono: ['"Fira Code"', "monospace"],
      },
      animation: {
        glitch: "glitch 0.3s ease-in-out",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        typing: "typing 3s steps(40) forwards",
      },
      keyframes: {
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(2px, -2px)" },
          "60%": { transform: "translate(-1px, 1px)" },
          "80%": { transform: "translate(1px, -1px)" },
        },
        "neon-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        typing: {
          from: { width: "0" },
          to: { width: "100%" },
        },
      },
    },
  },
  plugins: [],
};
