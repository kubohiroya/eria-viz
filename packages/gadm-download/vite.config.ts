import { defineConfig } from "vite";
import {resolve} from "path";
//import dts from "vite-plugin-dts";

const projectName = "@eria-viz/gadm-download";

export default defineConfig({
  //plugins: [dts()],

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
