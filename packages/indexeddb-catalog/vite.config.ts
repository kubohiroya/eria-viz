import { defineConfig } from 'vite'

const projectName = '@eria-viz/indexeddb-catalog'
export default defineConfig({
    build: {
        outDir: `./dist/`,
        lib: {
            entry: 'src/index.ts',
            name: 'indexed-geojson',
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
    }
})