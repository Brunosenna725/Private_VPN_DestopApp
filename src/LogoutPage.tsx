import { onMount } from "solid-js";
import api from "./api";
import { setIsLoggedIn, setPaidUser, setToken, state } from "./store/electron";
import { useNavigate } from "@solidjs/router";

const Page = () => {
  const navigate = useNavigate();
  
  onMount(async() => {
    if (!state.isLoggedIn) {
      navigate("/");
      return
    }
    await api.users.logout.delete().catch(() => {});
    localStorage.removeItem("auth-cache");
    setToken(null);
    setIsLoggedIn(false);
    setPaidUser(false);
    location.reload();
  })


  return (
    <></>
  )
}

export default Page;