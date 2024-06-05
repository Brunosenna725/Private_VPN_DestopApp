import { defineConfig, transformerVariantGroup, presetUno } from "unocss";
import presetRemToPx from "@unocss/preset-rem-to-px";

export default defineConfig({
  presets: [
    presetUno(),
    presetRemToPx()
  ],

  transformers: [
    transformerVariantGroup()
  ],

  theme: {
    fontFamily: {
      sans: "Poppins"
    },
    breakpoints: {
      sm: "320px",
      md: "640px",
      laptop: "1550px"
    },
    animation: {
      keyframes: {
        "scale-up": "{0%{transform:scale(1)}50%{transform:scale(1)}100%{transform:scale(1.1)}}"
      }
    }
  }
});