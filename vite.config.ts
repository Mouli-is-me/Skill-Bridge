import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "development" ? "/" : "/Skill-Bridge/",
  plugins: [
    react(),
    {
      name: "generate-github-pages-404",
      closeBundle() {
        const distDir = path.resolve(__dirname, "dist");
        const indexPath = path.resolve(distDir, "index.html");
        const fallbackPath = path.resolve(distDir, "404.html");
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, fallbackPath);
          console.log("[vite-plugin] Generated dist/404.html for GitHub Pages SPA deep links.");
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
