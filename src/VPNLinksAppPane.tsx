import { A, Navigate } from "@solidjs/router"
import { For, Match, Setter, Show, Switch, createSignal, onMount } from "solid-js";
import { state } from "./store/electron";
import { Search } from "./components/Search";
import api from "./api";
import { Link } from "@surfskip/api-types";
import { VPNLinks, setVPNLinks } from "./store/vpnLinks";
import clm from "country-locale-map";



const VPNLinksAppPane = () => {
  const [search, setSearch] = createSignal("")

  return (
    <Show when={state.isLoggedIn} fallback={<Navigate href="/login" />}>
      <div class="flex h-full overflow-auto flex-col m-t-24">
        <div class="flex flex-col overflow-x-hidden">

          <img src="assets/vpn-links-graphic.svg" class="w-296px self-center" />
          <div class="text-30px font-600 p-x-8 ">My VPN Links</div>

          <div class="m-x-4 flex flex-col items-center">
            <div class="w-full rd-15px p-3 p-t-2">
              <Search placeholder="Search for specific Links" onText={setSearch} />
              <LinkList filter={search()} />
            </div>
            <CreateNewLinkButton />
          </div>
        </div>
      </div>
    </Show>
  )
}

const LinkList = (props: { filter?: string }) => {
  onMount(async () => {
    const res = await api.links.get()
    if (res.data) {
      setVPNLinks(res.data.result)
    }
  })

  const onDelete = async (link: Link) => {
    const res = await api.links[link.id].delete()
    setVPNLinks(VPNLinks().filter(l => l.id !== link.id))
  }
  const filteredLinks = () => {
    if (!props.filter) return VPNLinks()
    const val = props.filter.toLowerCase()
    return VPNLinks().filter(link => link.code?.toLowerCase().includes(val) || link.url?.toLowerCase().includes(val) || link.server?.toLowerCase().includes(val))
  }
  return (
    <div class="flex flex-col gap-2 m-t-3">
      <For each={filteredLinks()}>{(link) => <LinkItem onDeleteClick={() => onDelete(link)} link={link} />}</For>
    </div>
  )
}

const LinkItem = (props: { link: Link; onDeleteClick: () => void }) => {

  const nameWithoutPrem = () => {
    if (props.link.server.endsWith("-prem")) {
      return props.link.server.substring(0, props.link.server.length - 5)
    }
    return props.link.server;
  }
  return (
    <div class="bg-white rd-8px h-55px items-center flex p-l-12px gap-2 overflow-hidden">
      <div class="bg-#00091F1A rd-8px h-40px w-40px flex items-center justify-center shrink-0">
        <img class="w-6 h-6" src={`https://icon.horse/icon?uri=${encodeURIComponent(props.link.url)}`} />

      </div>
      <div class="flex flex-col leading-5 truncate">
        <div class="font-500 text-16px select-text">{props.link.code}</div>
        <div class="text-#00091F66 font-medium text-13px flex gap-1 items-center">Server of link: {nameWithoutPrem()} <img src={`assets/flag-icons/${clm.getAlpha2ByName(nameWithoutPrem())?.toLowerCase()}.svg`} class="w-4 object-contain" /></div>
      </div>
      <button class="shrink-0 m-l-auto bg-white/21 h-28px w-28px rd-12px flex items-center justify-center" onclick={() => navigator.clipboard.writeText("https://surfskip.it/" + props.link.code)}>
        <img src="assets/copy.svg" class="w-16px h-16px" style="filter: invert(100%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%);" />
      </button>
      <button class="shrink-0 m-l-2px bg-white/21 h-28px w-28px rd-12px flex items-center justify-center m-r-8px" onclick={props.onDeleteClick}>
        <img src="assets/red-bin.svg" class="w-16px h-16px" />
      </button>
    </div>
  )
}


const CreateNewLinkButton = () => {
  return (
    <A href="./create" class="m-t-1 w-300px rd-8px bg-#E8E9EA h-56px shrink-0 m-b-30px color-#00091F flex items-center p-x-12px cursor-pointer">
      <div class="text-14px font-medium flex-1 text-center">Create New VPN Link</div>
    </A>
  )
}



export default VPNLinksAppPane;