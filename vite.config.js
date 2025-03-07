import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  target: ["es2020", "chrome87", "safari14", "firefox78", "edge88"],
  plugins: [
    react(),
    nodePolyfills(),
    topLevelAwait({
      promiseExportName: "__tla",
      promiseImportName: (i) => `__tla_${i}`,
    }),
  ],
  resolve: {
    alias: {
      "@/layout": path.resolve(__dirname, "./src/components/layout"),
      "@/views": path.resolve(__dirname, "./src/components/views"),
      "@/atoms": path.resolve(__dirname, "./src/components/atoms"),
      "@/apps": path.resolve(__dirname, "./src/components/views/apps"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ["torboar"], // ✅ Explicitly tell Vite to NOT bundle `torboar`
    },
  },
});

