import { auth } from "@/store/auth"
import { state } from "@/store/electron"
import { Avatar } from "./Avatar"

const ProfileInfo = () => {

  return (
    <div class="bg-#F0F0F2 h-68px p-8px rd-16px flex items-center gap-8px p-r-8 w-224px">
      <img src="assets/profile.svg" class="w-52px"/>
      <div>
        <div class="font-medium text-14px color-#0F0E1A">{auth.user?.displayName}</div>
        <div class="text-#0F0E1A text-11px font-medium">{state.paidUser ? "Premium Subscription" : "No Subscription"}</div>
      </div>
    </div>
  )
}

export {ProfileInfo}