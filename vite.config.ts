import { defineConfig } from "vite";
import path from "path";
import electron from 'vite-plugin-electron'

import unocss from "unocss/vite";
import solid from "vite-plugin-solid";


interface Route {
  path: string;
  children?: Route[]
}


export default defineConfig({
  plugins: [
    electron({
      entry: './main.js',
    }),
    unocss(),
    solid(),
  ],
  server: {
    port: 4000,
    host: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },

  optimizeDeps: {include: ["mapbox-gl", "maplibre-gl"]},

  build: {
    target: "esnext",
    outDir: "out"
  }
});
