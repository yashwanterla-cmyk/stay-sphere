/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#556B2F", // Olive Green
          dark: "#3D5229",    // Dark Olive
          light: "#8F9779",   // Light Olive
        },
        secondary: "#3D5229",
        accent: "#8F9779",
        background: {
          DEFAULT: "#FFFFFF",
          soft: "#F8F9F5",    // Off White
        },
        card: "#F8F9F5",
        text: {
          DEFAULT: "#1F2937", // Dark Gray
          light: "#4B5563",
          muted: "#9CA3AF"
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        "soft": "0 4px 20px -2px rgba(85, 107, 47, 0.08)",
        "premium": "0 10px 30px -5px rgba(61, 82, 41, 0.12)",
      }
    },
  },
  plugins: [],
}
