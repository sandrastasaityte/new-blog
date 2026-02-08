import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "/",

  build: {
    outDir: "dist",
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          icons: ["react-icons"]
        }
      }
    }
  },

  server: {
    port: 5173,
    open: true
  },

  preview: {
    port: 4173
  }
});
