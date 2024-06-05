import { A } from "@solidjs/router"
import { createSignal, onMount } from "solid-js"
import { sendLoginVisible } from "./store/electron";

const Page = () => {

  onMount(() => {
    sendLoginVisible();
  })

  return (
    <div class="flex h-full">
      <Sidebar/>
      <MainBar/>
    </div>
  )
}

const Sidebar = () => {
  const [email, setEmail] = createSignal("")

  const onRegisterClick = () => {
    const shell = window.require('electron').shell as typeof import('electron')["shell"];
    shell.openExternal("https://web.surfskip.com/register?callback=true&url=" + encodeURIComponent("privatevpn://?email=" + email()));
  }

  return (
    <div style={{"box-shadow": "0 0 24px 8px #00000040"}} class="bg-#F0F5F5 h-full w-432px flex flex-col items-center  overflow-auto relative color-#00091F">
      <div class="flex flex-col m-auto items-center">
        <img src="assets/login-logo.svg" class="w-72px shrink-0" />

        <div class="text-26px text-center font-bold m-t-4">Register To PrivateVPN!</div>
        <div class="text-16px text-center m-t-16px">A privacy software trusted by experts.</div>
        <div class="text-16px text-center">Take back your own privacy!</div>


        <div class="flex flex-col gap-4 m-t-8">
          <Input placeholder="E-Mail" type="email" onInput={setEmail} />
        </div>


        <div class="flex flex-col gap-6px m-t-20px m-b-4">
          <button onClick={onRegisterClick} class="font-medium cursor-pointer bg-#185BFF color-white rd-8px h-56px w-300px shrink-0 flex items-center justify-center">Register My Account</button>
        </div>

        <SignInWithTitle/>

        <div class="flex flex-col gap-6px m-t-20px m-b-4">
          <A href="/login" class=" cursor-pointer bg-white rd-8px h-56px w-300px shrink-0 flex items-center justify-center flex items-center justify-center gap-2">
            <img src="assets/google-logo-black.svg" class="w-16px"/>
            <div class="font-medium text-#00091F">Sign In With Google</div>
          </A>
        </div>


        <span class=" m-t-12px text-14px ">
          Already have an account? 
          <A href="/login" class="color-#185BFF">Sign In</A>
        </span>
      </div>
    </div>
  )

}

const Input = (props: {placeholder: string; type?: string, onInput?: (text: string) => void}) => {
  return (
    <input type={props.type} onInput={e => props.onInput?.(e.currentTarget.value)} class="outline-none p-x-4 rd-16px h-56px w-300px bg-transparent b-#00091F33/20 b-1px" placeholder={props.placeholder} />
  )
} 


const SignInWithTitle = () => {
  return (
    <div class="flex w-full items-center gap-2">
      <div class="h-1px flex-1 bg-#00091F33/20"></div>
      <div class="color-#90979F text-12px font-medium">Or, Sign In With</div>
      <div class="h-1px flex-1 bg-#00091F33/20"></div>
    </div>
  )
}

const MainBar = () => {
  return <div class="flex-1 bg-#F0F5F5">
  </div>
}


export default Page;