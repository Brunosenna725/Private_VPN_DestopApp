import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import { connected, connecting, selectedLocationId, selectedRegionId } from "@/locationStore";

const AppHeader = () => {
  const [showSidebar, setShowSidebar] = createSignal(false);
  const [connectedAt, setConnectedAt] = createSignal<null | number>(null)
  const [time, setTime] = createSignal("00 : 00 : 00");
  const pad = (n: number) => n.toString().padStart(2, "0");

  let timerId = window.setInterval(() => {
    if (!connectedAt())  {
      setTime("00 : 00 : 00");
      return;
    }
    const now = Date.now();
    const diff = now - connectedAt()!;
    const date = new Date(diff);

    setTime(`${pad(date.getUTCHours())} : ${pad(date.getUTCMinutes())} : ${pad(date.getUTCSeconds())}`);
    
  }, 1000)

  createEffect(() => {
    if (connected()) {
      setConnectedAt(Date.now())
    }
    if (!connected()) {
      setConnectedAt(null)
    }
    onCleanup(() => {

    })
  })
  
  onCleanup(() => {
    window.clearInterval(timerId)
  })


  

  return (
    <>
    <div class="m-t-8 flex w-full">
      <img onclick={() => setShowSidebar(true)} class="showSidebarBtn cursor-pointer bg-#E2E7E9 rd-12px p-8px self-center" src="assets/category.svg" />
   
      <div class="flex flex-col items-center text-center flex-1">
          <Show when={!selectedLocationId()}><div class="text-12px font-semibold color-#E7505C">VPN Not Connected</div></Show>
          <Show when={selectedRegionId() && connecting()}><div class="text-12px font-semibold color-#E7505C">Connecting...</div></Show>
          <Show when={selectedRegionId() && connected()}><div class="text-12px font-semibold color-green">Connected!</div></Show>
        <div class="text-12px">Connected Time</div>
        <div class="font-bold text-24px">{time()}</div>
      </div>

      <img class="bg-#E2E7E9 rd-12px p-8px self-center cursor-pointer" src="assets/crown.svg" />
    </div>
    </>
  )
}


export {AppHeader};