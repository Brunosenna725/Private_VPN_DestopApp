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

          <img src="assets/invite-graphic.svg" class="w-296px self-center" />
          <div class="text-24px leading-26px font-600 p-x-8 m-t-2">Get 3 months instantly by referring a friend!</div>


          <div class="m-x-8 m-t-4 flex flex-col items-center">

          <div class="text-#00091FCC text-14px font-400 m-b-2">
            As a Private subscriber, you'll get 3 months free for every successful referral. The friends who join via your link and keep using PrivateVPN for a month will also receive a reward —<br/><br/>1 or 3 free months depending on their plan.
          </div>


            <AddNewNumberButton />
          </div>
        </div>
      </div>
    </Show>
  )
}

const CardItem = (props: {name: string}) => {


  return (
    <div class="bg-white rd-8px h-50px items-center flex p-l-12px gap-2 overflow-hidden cursor-pointer">
      <img src={"assets/phone-in-box.svg"} />
      <div class="flex-1 leading-18px">
        <div class="font-500 text-16px b-l-3px b-l-#3E5FFF p-l-1">Number</div>
        <div class="font-500 text-13px color-#00091F66 flex gap-2">
          +1 6 135 782 05 • 
          <img src="assets/flag-icons/us.svg" alt="" />
        </div>
      </div>
      <div class="p-4px bg-#F0F0F2 rd-8px shrink-0 m-r-2"><img src="assets/arrow-up.svg" class="w-20px rotate-90 "  /></div>

    </div>
  )
}


const AddNewNumberButton = () => {
  return (
    <A href="#" class="m-t-1 w-300px rd-8px bg-#185BFF h-56px shrink-0 m-b-30px color-white flex items-center p-x-12px cursor-pointer items-center justify-center gap-2">
      <img src="assets/giftDark.svg" class="invert w-20px" />
      <div class="text-14px font-medium text-center">Invite a Friend</div>
    </A>
  )
}



export default VPNLinksAppPane;