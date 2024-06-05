import type { SurfSkipApi } from "@surfskip/api-types";
import { edenTreaty } from "@elysiajs/eden";

// const api = edenTreaty<SurfSkipApi>(import.meta.env.PROD ? "https://api.surfskip.com" : "http://localhost:8081" , {
const api = edenTreaty<SurfSkipApi>("https://api.surfskip.com", {
  $fetch: {
    credentials: "include"
  }
});


export default api;