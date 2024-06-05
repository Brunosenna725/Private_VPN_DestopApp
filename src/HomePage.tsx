import { A, Navigate } from "@solidjs/router"
import { Show, onMount } from "solid-js"
import { isAuthenticated } from "./store/auth"
import { sendLoginVisible } from "./store/electron"

const Page = () => {

  onMount(() => {
    sendLoginVisible();
  })
  return (
    <Show when={!isAuthenticated()} fallback={<Navigate href="/app" />}>
      <div class="flex h-full">
        <Sidebar/>
        <MainBar/>
      </div>
    </Show>
  )
}

const Sidebar = () => {
  return (
    <div style={{"box-shadow": "0 0 24px 8px #00000040"}} class="bg-#F0F5F5 h-full w-432px flex flex-col items-center  overflow-auto relative color-#00091F">
      <div class="flex flex-col m-auto items-center">
        <img src="assets/login-Illustration.svg" class="w-300px shrink-0" />
          
        <div class="text-26px text-center max-w-220px font-bold leading-32px">Secure Browsing With No Limits</div>
        <div class="text-16px text-center m-t-16px max-w-270px">with Our encrypted VPN tunnel, your data stay safe, even over public or untrusted Internet connections.</div>

        <div class="flex flex-col gap-6px m-t-40px">
          <A href="/login" class="font-medium cursor-pointer bg-#E2E7E9 rd-8px h-56px w-300px shrink-0 flex items-center justify-center">Login</A>
          <A href="/register" class="font-medium cursor-pointer bg-#185BFF color-white rd-8px h-56px w-300px shrink-0 flex items-center justify-center">Sign Up</A>
        </div>

        <A href="#" class="color-#185BFF m-b-60px m-t-12px text-12px font-medium">Subscription and privacy info</A>
      </div>
    </div>
  )

}




const MainBar = () => {
  return <div class="flex-1 bg-#F0F5F5">
  </div>
}


export default Page;