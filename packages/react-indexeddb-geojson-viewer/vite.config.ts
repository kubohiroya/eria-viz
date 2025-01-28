import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const projectName = "react-indexed-geojson-viewer";
export default defineConfig({
  server: {
    port: 4200,
    host: "localhost",
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },

  base: `/${projectName}/`,

  resolve: {
    alias: {},
  },

  plugins: [
    react(),
  ],
  worker: {
    rollupOptions: {
      output: {
        format: "es",
      },
    },
    format: "es",
    plugins: () => [],
  } as any,
  build: {
    outDir: `./dist/${projectName}`,
    emitAssets: true,
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      input: {
        main: "index.html",
      },
    },
  },
});
