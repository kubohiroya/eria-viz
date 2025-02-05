import {reactRouter} from "@react-router/dev/vite";
import comlink from "vite-plugin-comlink";
import { defineConfig } from "vite";

const projectName = "eria-viz";
export default defineConfig({
  server: {
    port: 4200,
    host: "localhost",
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    proxy: {
      // ターゲットとなる外部のURL
      "/gadm.org": {
        target: "https://gadm.org",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/gadm.org/, ""),
      },
      "/geodata.ucdavis.edu": {
        target: "https://geodata.ucdavis.edu",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/geodata.ucdavis.edu/, ""),
      },
      "/www3.cuc.ac.jp": {
        target: "https://www3.cuc.ac.jp",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/www3.cuc.ac.jp/, ""),
      },
    },
  },

  base: `/${projectName}/`,

  resolve: {
    alias: {},
  },

  plugins: [
    reactRouter()
  ],
  worker: {
    rollupOptions: {
      output: {
        format: "es",
      },
    },
    format: "es",
    plugins: () => [
        comlink()
    ],
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
  ssr: {
    noExternal: [process.env.NODE_ENV === 'development' ? '@mui/icons-material' : /^@mui\//],
  },

});
