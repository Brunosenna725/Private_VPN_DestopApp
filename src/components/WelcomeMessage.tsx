import { A } from "@solidjs/router"

const WelcomeMessage = () => {
  return (
    <div class="bg-white rd-8px p-x-16px p-y-8px items-center justify-center flex flex-col m-b-6">
      <div class="flex gap-2">
        <img src="assets/user-octagon.svg" class="w-30px" />
        <div class="leading-4">
          <div class="font-extrabold text-14px color-#00091F">Welcome to PrivateVPN!</div>
          <div class="text-12px color-#00091F/60">Log in or sign up to continue</div>
        </div>
      </div>

      <div class="flex gap-10px w-full m-t-8px">
        <A href="/register" class="text-center flex-1 h-30px flex items-center justify-center bg-#185BFF font-semibold text-12px rd-4px color-white">SIGN UP</A>
        <A href="/login" class="text-center flex-1 h-30px flex items-center justify-center bg-#E2E7E9 font-semibold text-12px rd-4px">LOG IN</A>
      </div>      
    </div>
  )
}

export {WelcomeMessage}