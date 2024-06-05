import { A } from "@solidjs/router"
import { For, Match, Setter, Show, Switch, createEffect, createMemo, createSignal, on, onMount } from "solid-js";
import { state } from "./store/electron";
import { WelcomeMessage } from "./components/WelcomeMessage";
import { selectedLocationId, setSelectedLocationId, selectedRegionId, setSelectedRegionId, changeLocation, connecting, cancelConnecting } from "./locationStore";
import { Search } from "./components/Search";
import { Server, loadVPNServers, servers, setServers } from "./store/vpnClient";
import { centerMap } from "./components/Map";
import { AppHeader } from "./components/AppHeader";




const MainAppPage = () => {
  const [search, setSearch] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);

  onMount(async () => {
    loadVPNServers().catch(err => {
      setError("PrivateVPN is facing an outage.")
    })
  })

  const filteredServers = () => {
    if (!search()) {
      return servers()
    }
    return servers().filter((server) => {
      return server.fullName.toLowerCase().includes(search().toLowerCase());
    })
  }

  return (
    <>
    <div class="m-x-8"><AppHeader/></div>
    <div class="m-x-8">

      <Switch>
        <Match when={!state.paidUser && state.isLoggedIn}><GetSubscriptionMessage/></Match>
        <Match when={!state.isLoggedIn}><WelcomeMessage/></Match>
      </Switch>

      <Show when={state.paidUser}>
        <SearchCountry onChange={setSearch}/>
      </Show>

      <div class="flex items-center w-full opacity-40 text-12px font-medium m-b-2">
        <div class="flex-1">Available Regions</div>
        <img src="assets/info-circle.svg" class="w-16px" />
      </div>
      <Show when={!state.paidUser}>
        <div class="text-12px font-medium color-red text-center m-t-4">You do not have a paid plan!</div>
      </Show>
      <Show when={!state.isLoggedIn}>
        <div class="text-12px font-medium color-red text-center m-t-4">Sorry, You are not logged in.</div>
      </Show>
      <Show when={state.isLoggedIn && state.paidUser}>
        <Show when={error()}>
          <div class="text-12px font-medium color-red text-center m-t-4">{error()}</div>
        </Show>
        <RegionsList servers={filteredServers()}/>
      </Show>
    </div>
    </>
  )
}


const SearchCountry = (props: {onChange?: (text: string) => void}) => {
  return (
    <div class="m-y-6 w-full">
      <Search placeholder="Search for country or city" onText={props.onChange}/>
    </div>
  )
}



const RegionsList = (props: {servers: Server[]}) => {
  const [expandedIndex, setExpandedIndex] = createSignal<null | number>(null);

  const onExpand = (i: number, toggle = true) => {
    if (toggle && expandedIndex() === i) return setExpandedIndex(null);
    setExpandedIndex(i)
  }

  const groupedServers = () => {
    const servers = props.servers;

    const grouped: {[key: string]: Server[]} = {};

    for (let i = 0; i < servers.length; i++) {
      const server = servers[i];
      if (!grouped[server.fullName]) {
        grouped[server.fullName] = [];
      }
      grouped[server.fullName].push(server);
    }

    return {
      keys: Object.keys(grouped),
      values: Object.values(grouped)
    }
  }

  return (
    <div class="flex flex-col gap-8px">
      <For each={groupedServers().values}>
        {(servers, i) => <RegionItem servers={servers} countryName={groupedServers().keys[i()]} expanded={expandedIndex() === i()} onExpand={(t) => onExpand(i(), t)} />}
      </For>
    </div>
  )
}

const GetSubscriptionMessage = () => {
  return (
    <div class="bg-white rd-8px p-x-16px p-y-8px items-center justify-center flex flex-col m-b-6">
      <div class="flex gap-2">
        <img src="assets/user-octagon.svg" class="w-30px" />
        <div class="leading-4">
          <div class="font-bold text-14px color-#00091F">Unlock all features</div>
          <div class="text-12px color-#00091F/60">Buy a plan for just $3.69/m</div>
        </div>
      </div>

      <div class="flex gap-10px w-full m-t-8px">
        <A href="#" class="text-center flex-1 h-30px flex items-center justify-center bg-#305efb font-semibold text-12px rd-4px color-white">GET SUBSCRIPTION</A>
      </div>      
    </div>
  )
}


const RegionItem = (props: {servers: Server[], countryName: string, expanded: boolean, onExpand: (toggle: boolean) => void;}) => {

  const selected = createMemo(() => props.countryName === selectedRegionId());

  const onPowerClick = () => {
    if (selected()) {
      if (connecting()) {
        cancelConnecting()
        return;
      }
      changeLocation(null);
    }
    else {
      const randomServer = props.servers[Math.floor(Math.random() * props.servers.length)];
      changeLocation(randomServer);
    }
  }

  createEffect(on(selected, () => {
    if (selected()) {
      props.onExpand(false);
    }
  }))

  const country = () => props.servers[0].location.country.toLowerCase();

  return (
    <div class="rd-16px bg-white ">

      <div style={props.expanded ? {"box-shadow": "rgba(0, 0, 0, 0.04) 0px 8px 11px"} : ""} class="overflow-hidden transition-duration-120 bg-white rd-16px h-56px w-full flex items-center p-x-12px gap-8px">
        <img src={`assets/flag-icons/${country()}.svg`} class="w-42px" />
        <div class="leading-4 font-medium text-14px flex-1">
          <div>{props.countryName}</div>
          <div class="color-#00091F/60 text-10px">{props.servers.length} Locations</div>
        </div>



        <div class="flex m-l-auto gap-8px">
          <Show when={selected()}><div class="text-11px font-medium bg-#EAEAEC p-y-4px p-x-8px flex items-center rd-12px">Connected</div></Show>
          <div onClick={onPowerClick} classList={{["bg-#0673F0"]: selected(), ["bg-#F0F0F2"]: !selected()}} class="shrink-0 transition-duration-120 cursor-pointer p-4px rd-12px "><img src={selected() ? "assets/power.svg" : "assets/power-black.svg"} class="w-20px" /></div>
          <div onClick={props.onExpand} class="cursor-pointer p-4px bg-#F0F0F2 rd-12px shrink-0"><img src="assets/arrow-up.svg" class="w-20px transition-duration-120" classList={{"rotate-90": !props.expanded}} /></div>
        </div>

          
      </div>

      <div class="grid grid-rows-[0fr] transition-duration-120" classList={{["grid-rows-[1fr]"]: props.expanded}}>
        <div class="overflow-hidden">
          <div class="flex flex-col gap-12px p-b-12px p-t-12px">
            <For each={props.servers}>
              {(server, i) => <RegionLocationItem server={server} index={i()}  />}
            </For>
          </div>
        </div>
      </div>

      
    </div>
  )
}

const RegionLocationItem = (props: {server: Server, index: number}) => {

  const selected = () => {
    return  props.server.id === selectedLocationId();
  }

  const onPowerClick = (event: MouseEvent) => {
    event.preventDefault()
    if (selected()) {
      if (connecting()) {
        cancelConnecting()
        return;
      }
      changeLocation(null)
    }
    else {
      changeLocation(props.server)
    }
  }

  return (
    <div class="h-32px flex p-x-12px" >
      <div class="leading-4 flex-1 self-center flex ">
        <div class="text-14px font-medium" onClick={() => centerMap([props.server.location.longitude, props.server.location.latitude], 8)}>{props.server.fullName}#{props.index + 1}</div>
        {/* <div class="text-10px font-medium color-white/40">{props.location.name}</div> */}
      </div>
      {/* <Show when={selected()}><div class="text-11px font-medium bg-#16161C p-y-4px p-x-8px flex items-center rd-12px m-r-2">Connected</div></Show> */}
      <div class="flex gap-4px items-center m-r-4">
        <div>100%</div>
        <img src="assets/green-signal.svg" class="w-16px" />
      </div>
      <div onClick={onPowerClick} classList={{["bg-#0673F0"]: selected(), ["bg-#F0F0F2"]: !selected()}} class="shrink-0 transition-duration-120 cursor-pointer p-4px bg-#F0F0F2 rd-12px m-l-auto self-center"><img src={selected() ? "assets/power.svg" : "assets/power-black.svg"} class="w-20px" /></div>

    </div>
  )
}



export default MainAppPage;