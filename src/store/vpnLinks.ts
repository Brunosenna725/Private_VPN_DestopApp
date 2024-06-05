import api from "@/api";
import { Link } from "@surfskip/api-types";
import { createSignal } from "solid-js";

export const [VPNLinks, setVPNLinks] = createSignal<Link[]>([])


export async function loadVPNLinks () {
  const res = await api.links.get()
  if (res.data) {
    setVPNLinks(res.data.result)
  }
}

