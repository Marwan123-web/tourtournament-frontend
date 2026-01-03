import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // ✅ Root app/[locale]
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // ✅ Components
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // ✅ If pages dir exists
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "Cairo", "ui-sans-serif", "system-ui"],
      cairo: ["Cairo", "sans-serif"], // Arabic RTL
    },
    colors: {
      primary: "hsl(var(--color-primary))",
      "primary-foreground": "hsl(var(--color-primary-foreground))",
      secondary: "hsl(var(--color-secondary))",
      "secondary-foreground": "hsl(var(--color-secondary-foreground))",
      background: "hsl(var(--color-background))",
      foreground: "hsl(var(--color-foreground))",
      muted: "hsl(var(--color-muted))",
      "muted-foreground": "hsl(var(--color-muted-foreground))",
      card: "hsl(var(--color-card))",
      "card-foreground": "hsl(var(--color-card-foreground))",
      border: "hsl(var(--color-border))",
      input: "hsl(var(--color-input))",
      ring: "hsl(var(--color-ring))",
    },
    backgroundImage: {
      "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      "gradient-conic":
        "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
    },
  },
  plugins: [],
};

export default config;
