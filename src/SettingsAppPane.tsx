import { A } from "@solidjs/router"
import { For, Match, Setter, Show, Switch, createSignal } from "solid-js";
import { state } from "./store/electron";



const SettingsAppPane = () => {

  return (
    <div class="flex flex-col overflow-auto h-full m-t-4">
      <div class="text-24px font-medium p-x-8 ">Settings</div> 

      <div class="p-x-8 m-t-4 flex flex-col gap-2 h-full flex-1">
        <SettingItem title="Quick Connect" description="Quick connect button connects you to selected server." />
        <div class="text-18px font-medium">Security</div> 
        <SettingItem title="Microphone Alert" description="Books And Alerts You When The Microphone Is Activated To Prevent Hackers From Spying On You." />
        <SettingItem title="Webcam Alert" description="Books And Alerts You When The Webcam Is Activated To Prevent Hackers From Spying On You." />
        {/* <SettingItem title="VPN Accelerator" description="VPN accelerator enables a set unique performance enhancing technologies which can increase VPN speed up to 400%." />
        <SettingItem title="VPN Accelerator notifications" description="Get notified when vpn accelerator switches you to a faster server." />
        <SettingItem title="Split Tunneling" description="Allows certain apps or IPs to be excluded from the vpn traffic." />
        <SettingItem title="Ad & Tracker Blocker" description="Blocks advertisements, trackers and snoopers in a hearth beat. no more cookies." />
        <SettingItem title="Malware Protection" description="Protection against hackers, viruses and other malicious  attempts to get in to your device." />
        <SettingItem title="Wifi Reader" description="Confirms that the wIFI network your connecting to is save. protects against data sharing on that wifi." /> */}
      </div>

      <div class="m-t-16px m-b-16px">
          <div class="text-10px font-medium text-center color-black/70">PrivateVPN App: {state.appver}</div>
          <div class="text-10px font-medium text-center color-black/70">OpenVPN: {state.ovpnver}</div>
        </div>
    </div>
  )
}


interface Setting {
  title: string;
  description: string;
}
const SettingItem = (props: Setting) => {
  const [enabled, setEnabled] = createSignal<boolean>(false);
  return (
    <div class="bg-white rd-8px p-x-3 p-y-2 flex items-center gap-8px cursor-pointer" onClick={() => setEnabled(!enabled())}>
      <div>
        <div class="flex gap-7px items-center">
          <div class="text-14px font-medium flex-1">{props.title}</div>
        </div>
        <div class="color-#00091F66 text-10px font-medium">
          {props.description}
        </div>
      </div>
      <Toggle enabled={enabled()} />
    </div>
  );
};

const Toggle = (props: {enabled: boolean, onChange?: (value: boolean) => void}) => {

  return (
    <div onClick={() => props.onChange?.(!props.enabled)} classList={{["bg-#185BFF"]: props.enabled, ["bg-#D8DEE0"]: !props.enabled}} class="transition-duration-180 shrink-0 cursor-pointer  h-20px w-32px rd-30px flex items-center">
      <div classList={{["m-l-14px"]: props.enabled, ["m-l-2px"]: !props.enabled}} class="transition-duration-120 bg-#F7F7F7 rd-full h-16px w-16px"></div>
    </div>
  )
}



export default SettingsAppPane;