/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
          border: "var(--border-color)",
        },
        txt: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
        },
        status: {
          healthy: "var(--status-healthy)",
          "healthy-bg": "var(--status-healthy-bg)",
          warning: "var(--status-warning)",
          "warning-bg": "var(--status-warning-bg)",
          fault: "var(--status-fault)",
          "fault-bg": "var(--status-fault-bg)",
          offline: "var(--status-offline)",
          "offline-bg": "var(--status-offline-bg)",
          running: "var(--status-running)",
          "running-bg": "var(--status-running-bg)",
          error: "var(--status-error)",
          "error-bg": "var(--status-error-bg)",
          idle: "var(--status-idle)",
          "idle-bg": "var(--status-idle-bg)",
          info: "var(--status-info)",
          "info-bg": "var(--status-info-bg)",
        },
      },
      fontFamily: {
        sans: ["Source Sans 3", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        panel:
          "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
