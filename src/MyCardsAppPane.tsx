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

          <img src="assets/card-graphic.svg" class="w-296px self-center" />
          <div class="text-30px font-600 p-x-8 flex items-center">
            My Cards
            <div class=" m-l-auto p-4px bg-#E8E9EA rd-8px shrink-0 m-r-2"><img src="assets/arrow-up.svg" class="w-20px rotate-90 " /></div>  
          </div>


          <div class="w-302px self-center m-b-2 m-t-3">
            <Search placeholder="Search for specific Links" onText={setSearch} />
          </div>


          <div class="m-x-4 flex flex-col items-center">
            <div class="w-full rd-15px p-3 p-t-2 flex flex-col gap-2">
              <CardItem name="Cards" />
            </div>
            <AddNewCardButton />
          </div>
        </div>
      </div>
    </Show>
  )
}

const CardItem = (props: {name: string}) => {


  return (
    <div class="bg-white rd-8px h-50px items-center flex p-l-12px gap-2 overflow-hidden cursor-pointer">
      <img src={"assets/card2.svg"} />
      <div class="flex-1 leading-18px">
        <div class="font-500 text-16px">{props.name}</div>
        <div class="font-500 text-13px color-#00091F66">*1793 • Expires on 01/29</div>
      </div>
      <div class="p-4px bg-#F0F0F2 rd-8px shrink-0 m-r-2"><img src="assets/arrow-up.svg" class="w-20px rotate-90 "  /></div>

    </div>
  )
}


const AddNewCardButton = () => {
  return (
    <A href="#" class="m-t-1 w-300px rd-8px bg-#E8E9EA h-56px shrink-0 m-b-30px color-#00091F flex items-center p-x-12px cursor-pointer">
      <div class="text-14px font-medium flex-1 text-center">Create new card</div>
    </A>
  )
}



export default VPNLinksAppPane;