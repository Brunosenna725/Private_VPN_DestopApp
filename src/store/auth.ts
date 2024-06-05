import api from "@/api";
import { UserPlan, UserWithAvatar } from "@surfskip/api-types";
import { createStore } from "solid-js/store";
import { setIsLoggedIn, setPaidUser, setToken, state } from "./electron";
import { loadVPNLinks } from "./vpnLinks";
import { client } from "./vpnClient";

interface AuthStore {
  loading: boolean;
  user: null | UserWithAvatar,
  plans: null | UserPlan[]
}
export const [auth, setAuth] = createStore<AuthStore>({
  loading: true,
  user: null,
  plans: null
});



export const activePlan = () => {
  const activePlan = auth.plans?.find(plan => new Date(plan.endDate) > new Date());
  return activePlan;
};

export const hasPaidPlan = () => {
  return !!(activePlan()?.plan && activePlan()?.plan !== "FREE");
};




export const authenticate = async () => {
  if (localStorage["auth-cache"]) {
    setAuth({
      loading: false,
      ...JSON.parse(localStorage["auth-cache"])
    })
  }
  const res = await api.users.authenticate.get().catch(() => {});
  if (res?.data?.success) {
    localStorage["auth-cache"] = JSON.stringify({
      user: !res?.data?.success ? null : res?.data.result.user,
      plans: !res?.data?.success ? null : res?.data.result.plans
    });
  }
  setAuth({
    loading: false,
    user: !res?.data?.success ? null : res?.data.result.user,
    plans: !res?.data?.success ? null : res?.data.result.plans
  });

  if (res && res.data?.success) {
    setIsLoggedIn(true);
    setPaidUser(hasPaidPlan())
    loadVPNLinks()
  } 
  else {
    await api.users.logout.delete();
    localStorage.removeItem("auth-cache");
    setIsLoggedIn(false);
    setToken(null);
    setPaidUser(false);
  }
};


const TenMinutesToMilliSeconds = 10 * 60 * 1000;

window.setInterval(() => authenticate(), TenMinutesToMilliSeconds);


export const isAuthenticated = () => !!auth.user;