import { A, Outlet, useMatch } from "@solidjs/router"
import { initProgress, sendMainPageVisible, state } from "./store/electron"
import { ProfileInfo } from "./components/ProfileInfo"
import { Match, Show, Switch, lazy, onMount } from "solid-js"
import { WelcomeMessage } from "./components/WelcomeMessage"
import { cancelConnecting, changeLocation, connected, connecting, connectingProgress, selectedLocationId, selectedRegionId, setSelectedLocationId, setSelectedRegionId } from "./locationStore"
import { MapComponent } from "./components/Map"
import { servers } from "./store/vpnClient"
import { RadicalProgressbar } from "./RadicalProgressbar"

const Page = () => {
  
  onMount(() => {
    sendMainPageVisible();
  })

  return (
    <div class="flex h-full">
      <SmallSidebar/>
      <Sidebar/>
      <MainBar/>
    </div>
  )
}




const SmallSidebar = () => {

  const Item = (props: {selected?:  boolean, icon: string, href: string, customMatch?: string}) => {
    const selected = useMatch(() => props.customMatch ||props.href)
    return (
      <A href={props.href} classList={{["bg-#0673F0"]: !!selected()}} class="shrink-0 h-50px w-full flex items-center justify-center transition-duration-120">
        <img src={"assets/" + props.icon + "Dark.svg"} classList={{["invert"]: !!selected()}} />
      </A>
    )
  }

  return (
    <div class="w-57px shrink-0 flex flex-col bg-#EFF4F4 b-r-1.5px b-#E2E2E4 gap-2 p-t-4 overflow-auto z-111111111111">
      <Item selected icon="Location" href="/app"/>
      {/* <Item icon="user-octagon" href="#"/> */}
      <Item icon="settings" href="/app/settings"/>
      <Item icon="credit-card" href="/app/my-cards"/>
      <Item icon="mail" href="/app/my-inbox"/>
      <Item icon="clipboard" href="/app/my-numbers"/>
      <Item icon="link" href="/app/links" customMatch="/app/links/*"/>
      <Item icon="scanner2" href="/app/data-monitored"/>
      <Item icon="image" href="/app/private-data-vault"/>
      <Item icon="gift" href="/app/invite"/>
      <Item icon="logout" href="/logout"/>
    </div>
  )
}


const Sidebar = () => {


  return (
    <div style={{"box-shadow": "0 0 24px 8px #00000040"}} class="bg-#F0F5F5 h-full w-360px shrink-0 flex flex-col overflow-auto relative color-#00091F z-11111111">
      <Outlet/>
    </div>
  )

}


const MainBar = () => {
  return (
    <div class="flex-1 relative">
      <div class="absolute top-3 right-4 flex gap-2 z-111111">
        <Show when={state.isLoggedIn}><ProfileInfo/></Show>
        <Show when={!state.isLoggedIn}><WelcomeMessage/></Show>
      </div>
      <div class="h-full w-full">
        <PageComponents/>
        <MapComponent/>
        <Show when={selectedLocationId() && !connected()}><ConnectingScreen/></Show>
        <Show when={initProgress() !== null}><InitScreen/></Show>
      </div>
      <div class="absolute bottom-3 left-4 flex gap-2">
        <DownloadInfo/>
        <UploadInfo/>
        <Show when={selectedRegionId() && connected()}><RegionInfo/></Show>
      </div>
    </div>
  )
}

const MyCardsPage = lazy(() => import("./MyCardsPage"))
const MyInboxPage = lazy(() => import("./MyInboxPage"))
const MyNumbersPage = lazy(() => import("./MyNumbersPage"))
const LinkPage = lazy(() => import("./LinkPage"));
const DataMonitoredPage = lazy(() => import("./DataMonitoredPage"));
const PrivateDataVaultPage = lazy(() => import("./PrivateDataVaultPage"));
const InvitePage = lazy(() => import("./InvitePage"))

const PageComponents = () => {
  const cardsPage = useMatch(() => "/app/my-cards");
  const inboxPage = useMatch(() => "/app/my-inbox");
  const numbersPage = useMatch(() => "/app/my-numbers");
  const vpnLinksPage = useMatch(() => "/app/links/*");
  const dataMonitoredPage = useMatch(() => "/app/data-monitored");
  const privateVaultPage = useMatch(() => "/app/private-data-vault");

  const invitePage = useMatch(() => "/app/invite");

  return (
    <Switch>
      <Match when={cardsPage()}><div class="bg-#F0F5F5 absolute inset-0 z-1111111"><MyCardsPage/></div></Match>
      <Match when={inboxPage()}><div class="bg-#F0F5F5 absolute inset-0 z-1111111"><MyInboxPage/></div></Match>
      <Match when={numbersPage()}><div class="bg-#F0F5F5 absolute inset-0 z-1111111"><MyNumbersPage/></div></Match>
      <Match when={vpnLinksPage()}><div class="bg-#F0F5F5 absolute inset-0 z-1111111"><LinkPage/></div></Match>
      <Match when={dataMonitoredPage()}><div class="bg-#F0F5F5 absolute inset-0 z-1111111"><DataMonitoredPage/></div></Match>
      <Match when={privateVaultPage()}><div class="bg-#F0F5F5 absolute inset-0 z-1111111"><PrivateDataVaultPage/></div></Match>
      <Match when={invitePage()}><div class="bg-#F0F5F5 absolute inset-0 z-1111111"><InvitePage/></div></Match>
    </Switch>
  )
}


const ConnectingScreen = () => {

  const location = () => {
    return servers().find(server => server.id === selectedLocationId())
  }
  const cancelConnection = () => {
    cancelConnecting()
  }

  return (
    <div class="absolute inset-0 bg-#16161C/57 items-center justify-center flex flex-col z-1111111111">

      <div class="text-center flex flex-col gap-4px">
        <div class="text-12px color-white">Status</div>
        <Show when={connecting()}><div class="text-16px font-bold color-#E63946">Connecting...</div></Show>
        <Show when={connected()}><div class="text-16px font-bold color-green">Connected!</div></Show>
      </div>

      <div class="mt-6 flex flex-col items-center">
        <img src={`assets/flag-icons/${location()?.location.country.toLowerCase()}.svg`} class="w-42px object-cover" />
        <div class="font-medium text-14px m-t-2 color-white">{location()?.fullName}</div>
      </div>

      <div class="flex relative items-center justify-center m-t-18">
        <div style={{"box-shadow": "#48D9B9 0px 10px 28px", "background-image": "url('assets/world.svg')", "background-size": "184px", "background-position": 'center'}} class=" absolute bg-no-repeat rd-50% items-center justify-center flex w-170px h-170px"/>
        <RadicalProgressbar progress={connectingProgress()}/>
       <img src="assets/init-connection-bubble.svg" class="w-98px h-53px absolute -right-45px bottom-37px z-1111"/> 
      </div>

      <div onClick={cancelConnection} class="cursor-pointer m-t-12 rd-16px w-300px h-56px flex items-center justify-center bg-white text-#00091F font-medium text-14px">Cancel Connection</div>

    </div>
  )
}



const InitScreen = () => {
  return (
    <div class="fixed inset-0 bg-#16161C/56 items-center justify-center flex flex-col z-11111111111111">
      <div class="text-center flex flex-col gap-4px">
        <div class="text-16px font-bold color-white">Preparing PrivateVPN Desktop...</div>
      </div>

      <div class="flex relative items-center justify-center m-t-18">
        <div style={{"box-shadow": "#48D9B9 0px 10px 28px", "background-image": "url('assets/world.svg')", "background-size": "184px", "background-position": 'center'}} class=" absolute bg-no-repeat rd-50% items-center justify-center flex w-170px h-170px"/>
        <RadicalProgressbar progress={initProgress()!}/>
      </div>
    </div>
  )
}


const DownloadInfo = () => {
  return (
    <div class="bg-white h-56px p-12px rd-16px gap-8px flex b-b-white/20 b-b-1px" style={{"box-shadow": "#00091F0D 0px 8px 24px"}}>
      <img src="assets/download.svg" class="w-28px"/>
      <div class="leading-4">
        <div class="font-medium text-10px color-#00091F66/40">Download:</div>
        <div class="font-medium text-14px color-#00091F">0 MB</div>
      </div>
    </div>
  )
} 
const UploadInfo = () => {
  return (
    <div class="bg-white h-56px p-12px rd-16px gap-8px flex  b-b-white/20 b-b-1px " style={{"box-shadow": "#00091F0D 0px 8px 24px"}}>
      <img src="assets/upload.svg" class="w-28px"/>
      <div class="leading-4">
        <div class="font-medium text-10px color-#00091F66/40">Upload:</div>
        <div class="font-medium text-14px color-#00091F">0 MB</div>
      </div>
    </div>
  )
} 

const RegionInfo = () => {

  const location = () => {
    return servers().find(server => server.id === selectedLocationId())
  }

  return (
    <div class="bg-white h-56px p-12px rd-16px gap-8px flex  b-b-white/20 b-b-1px" style={{"box-shadow": "#00091F0D 0px 8px 24px"}}>

      <img src={`assets/flag-icons/${location()?.location.country.toLowerCase()}.svg`} class="w-42px h-32px shrink-0"/>

      <div class="leading-4 flex flex-col items-center justify-center">
        <div class="font-medium text-14px color-#00091F">{selectedRegionId()}</div>
        {/* <div class="font-medium text-10px color-white/40">{region().location?.name}</div> */}
      </div>

      <div class="leading-4 m-l-8">
        <div class="font-medium text-10px color-#00091F66/40">Stealth</div>
        <div class="font-medium text-14px color-#00091F">0%</div>
      </div>

    </div>
  )
} 





export default Page;