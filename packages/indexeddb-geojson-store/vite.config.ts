import { defineConfig } from "vite";
import {resolve} from "path";

const projectName = "@eria-viz/indexeddb-geojson-store";

export default defineConfig({

  resolve: {
    alias: {
    },
  },

  build: {
    outDir: `./dist/`,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: projectName,
      formats: ["es"],
      fileName: (format) => `index.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
