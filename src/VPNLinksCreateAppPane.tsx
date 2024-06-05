import { A, useNavigate } from "@solidjs/router"
import { For, Match, Setter, Show, Switch, createSignal, onMount } from "solid-js";
import { state } from "./store/electron";
import { Search } from "./components/Search";
import api from "./api";
import { Link } from "@surfskip/api-types";
import { Region, regions } from "./regions";
import clm from "country-locale-map";



const VPNLinksCreateAppPane = () => {
  const navigate = useNavigate();
  const [code, setCode] = createSignal("")
  const [url, setUrl] = createSignal("")
  const [server, setServer] = createSignal("Italy");
  const [error, setError] = createSignal<string | null>(null);
  

  const onCreateClick = async () => {
    setError(null);
    const res = await api.links.post({
      code: code(),
      url: url(),
      server: server()
    });
    if (!res.data?.success) {
      if (!res.data?.message) return setError("Failed to create link");
      return setError(res.data.message);
    }

    navigate("../")
  }

  return (
    <div class="flex h-full overflow-auto justify-center flex-col">
    <div class="flex flex-col overflow-x-hidden">
      <div class="text-24px font-medium p-x-8 ">My VPN Links</div> 

      <div class="m-x-4 m-t-4 flex flex-col items-center">
        <img src="assets/create-vpn-illustration.svg" alt="" />
      </div>
      <div class="flex flex-col  m-t-2 gap-2 m-x-4">
        <Input onInput={setCode} title="Name For Link" placeholder="Link-For-James" />
        <Input onInput={setUrl} title="Paste A Long URL" placeholder="Example: www.super-long-link.com/sh...." />
        <ServerDropdown server={server()} setServer={setServer} />
        <Show when={error()}><div class="color-red text-12px self-start">{error()}</div></Show>
        <div class="flex flex-col gap-6px m-t-10px m-b-4">
          <button class="font-medium cursor-pointer bg-#185BFF color-white rd-8px h-56px w-full shrink-0 flex items-center justify-center" onClick={onCreateClick}>Create VPN Link</button>
        </div>

        <A href="../" class="flex gap-2 m-t-0 items-center self-center m-b-4">
          <div class="text-16px font-medium">Go Back</div>
        </A>
      </div>
    </div>
    </div>
  )
}

const Input = (props: {title: string; placeholder: string; type?: string, onInput?: (text: string) => void}) => {
  return (
    <div class="flex flex-col gap-2">
      <div class="text-14px">{props.title}</div>
      <input type={props.type} onInput={e => props.onInput?.(e.currentTarget.value)} class="w-full outline-none p-x-4 rd-16px h-56px bg-transparent b-#00091F33/20 b-1px" placeholder={props.placeholder} />
    </div>
  )
} 

const ServerDropdown = (props: {server: string; setServer: Setter<string> }) => {
  const [open, setOpen] = createSignal(false);

  const region = () => {
    return regions.find(region => region.name === props.server)
  }
  const onRegionClick = (region: Region) => {
    setOpen(false);
    props.setServer(region.name);
  }

  return (
    <div class="flex flex-col gap-2">
    <div class="text-14px">Server Of Link</div>
    <div onClick={() => setOpen(!open())} class="p-x-4 rd-16px h-56px w-full b-#00091F33/20 b-1px flex items-center gap-2 cursor-pointer">
      <img src={`assets/flag-icons/${clm.getAlpha2ByName(region()?.name)?.toLowerCase()}.svg`} class="w-8"  />
      <div class="text-14px">{region()?.name}</div>
      <img class="m-l-auto rotate-180" src="assets/arrow-up.svg" />
    </div>
    

    <Show when={open()}>
      <div class="rd-16px  w-full b-#00091F33/20 b-1px flex flex-col cursor-pointer overflow-hidden">
        <For each={regions}>
          {region => (
              <div onclick={() => onRegionClick(region)} class="p-x-4 flex items-center gap-2 cursor-pointer h-46px hover:bg-black/5">
                <img src={`assets/flag-icons/${clm.getAlpha2ByName(region.name)?.toLowerCase()}.svg`} class="w-8"  />
                <div class="text-14px">{region.name}</div>
              </div>
            )
          } 
        </For>
      </div>
    </Show>



  </div>
  )
}




export default VPNLinksCreateAppPane;