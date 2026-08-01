import { defineConfig } from "vite";

// Lovelace loads a single ES module, so everything (including lit) is bundled
// into one self-contained file.
export default defineConfig({
  build: {
    // Built into the component rather than dist/: HACS gives one repo exactly
    // one category, so this ships as an integration that serves its own card.
    outDir: "custom_components/polr_stocks/frontend",
    lib: {
      entry: "src/polr-stocks.ts",
      formats: ["es"],
      fileName: () => "polr-stocks.js",
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
    minify: "esbuild",
    sourcemap: true,
    emptyOutDir: true,
    target: "es2021",
  },
});
