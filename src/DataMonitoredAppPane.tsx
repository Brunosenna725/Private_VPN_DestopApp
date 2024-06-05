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

          <img src="assets/data-monitored-graphic.svg" class="w-296px self-center" />
          <div class="text-30px font-600 p-x-8 ">Data Monitored</div>

          <div class="m-x-4 flex flex-col items-center">
            <div class="w-full rd-15px p-3 p-t-2">
              <MailItem />
            </div>
            <AddNewMailButton />
          </div>
        </div>
      </div>
    </Show>
  )
}

const MailItem = () => {


  return (
    <div class="bg-white rd-8px h-50px items-center flex p-l-12px gap-2 overflow-hidden cursor-pointer">
      <img src="assets/file.svg" alt="" />
      <div class="flex-1 font-400 text-15px">Example@private.com</div>
      <div class="p-4px bg-#F0F0F2 rd-8px shrink-0 m-r-2"><img src="assets/arrow-up.svg" class="w-20px rotate-90 "  /></div>

    </div>
  )
}


const AddNewMailButton = () => {
  return (
    <A href="#" class="m-t-1 w-300px rd-8px bg-#E8E9EA h-56px shrink-0 m-b-30px color-#00091F flex items-center p-x-12px cursor-pointer">
      <div class="text-14px font-medium flex-1 text-center">Add new mail</div>
    </A>
  )
}



export default VPNLinksAppPane;