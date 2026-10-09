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
      name: "supabase-env-build-diagnostic",
      buildStart() {
        const url = process.env.VITE_SUPABASE_URL;
        const key = process.env.VITE_SUPABASE_ANON_KEY;
        const hasUrl = Boolean(url && url.trim() && !url.includes("YOUR_SUPABASE_PROJECT_URL"));
        const hasKey = Boolean(key && key.trim() && !key.includes("YOUR_SUPABASE_ANON_KEY"));
        console.log(`[build-diagnostic] Supabase VITE_SUPABASE_URL: ${hasUrl ? "PRESENT" : "MISSING"}`);
        console.log(`[build-diagnostic] Supabase VITE_SUPABASE_ANON_KEY: ${hasKey ? "PRESENT" : "MISSING"}`);
        if (!hasUrl || !hasKey) {
          console.warn("[build-diagnostic] WARNING: Build environment missing Supabase credentials. Client will initialize in standby mode.");
        }
      },
    },
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
