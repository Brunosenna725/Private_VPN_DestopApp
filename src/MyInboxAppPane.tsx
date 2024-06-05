import { A, Navigate } from "@solidjs/router"
import { For, Match, Setter, Show, Switch, createSignal, onMount } from "solid-js";
import { state } from "./store/electron";
import { Search } from "./components/Search";




const VPNLinksAppPane = () => {
  const [search, setSearch] = createSignal("")

  return (
    <Show when={state.isLoggedIn} fallback={<Navigate href="/login" />}>
      <div class="flex h-full overflow-auto flex-col m-t-24">
        <div class="flex flex-col overflow-x-hidden">

          <img src="assets/inbox-graphic.svg" class="w-296px self-center" />
          <div class="text-30px font-600 p-x-8 flex items-center">
            My Inbox
            <div class=" m-l-auto p-4px bg-#E8E9EA rd-8px shrink-0 m-r-2"><img src="assets/arrow-up.svg" class="w-20px rotate-90 " /></div>
          </div>


          <div class="m-x-4 flex flex-col items-center">
            <div class="w-full rd-15px p-3 p-t-2 flex flex-col gap-2">
              <CardItem name="Cards" />
            </div>
            <AddNewEmailButton />
            <A href="#" class="color-#0E7AF5 text-14px font-500 m-t--4">Connect email</A>
          </div>
        </div>
      </div>
    </Show>
  )
}

const CardItem = (props: { name: string }) => {


  return (
    <div class="bg-white rd-8px h-50px items-center flex p-l-12px gap-2 overflow-hidden cursor-pointer">
      <div class="font-500 text-16px b-l-3px b-l-#C41EC8 p-l-1">Number</div>
    </div>
  )
}


const AddNewEmailButton = () => {
  return (
    <A href="#" class="m-t-1 w-300px rd-8px bg-#E8E9EA h-56px shrink-0 m-b-30px color-#00091F flex items-center p-x-12px cursor-pointer">
      <div class="text-14px font-medium flex-1 text-center">Create new Email</div>
    </A>
  )
}



export default VPNLinksAppPane;