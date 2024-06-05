import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import { render } from "solid-js/web";

import { Route, Router, hashIntegration, Routes } from "@solidjs/router";
import { Show, lazy, onMount } from "solid-js";
import { sendLoggedInEvent, state } from "./store/electron";
import { auth, authenticate } from "./store/auth";

const Home = lazy(() => import("./HomePage"));
const Register = lazy(() => import("./RegisterPage"));
const Login = lazy(() => import("./LoginPage"));
const AppPage = lazy(() => import("./AppPage"));

const MainAppPane = lazy(() => import("./MainAppPane"));
const SettingsAppPane = lazy(() => import("./SettingsAppPane"));
const VPNLinksAppPane = lazy(() => import("./VPNLinksAppPane"));
const VPNLinksCreateAppPane = lazy(() => import("./VPNLinksCreateAppPane"));
const DataMonitoredAppPane = lazy(() => import("./DataMonitoredAppPane"));
const PrivateDataVaultAppPane = lazy(() => import("./PrivateDataVaultAppPane"));
const MyCardsAppPane = lazy(() => import("./MyCardsAppPane"));
const MyNumbersAppPane = lazy(() => import("./MyNumbersAppPane"));
const InviteAppPane = lazy(() => import("./InviteAppPane"));
const MyInboxAppPane = lazy(() => import("./MyInboxAppPane"));
const Logout = lazy(() => import("./LogoutPage"));



render(() => {
  authenticate();
  if (state.isLoggedIn) {
    sendLoggedInEvent();
  }


  return (
    <Show when={!auth.loading}>
      <Router source={hashIntegration()}>
        <Routes>
          <Route path="/" component={Home} />
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <Route path="/app" component={AppPage}>
            <Route path="/" component={MainAppPane} />
            <Route path="/settings" component={SettingsAppPane} />
            <Route path="/my-cards" component={MyCardsAppPane} />
            <Route path="/my-numbers" component={MyNumbersAppPane} />
            <Route path="/invite" component={InviteAppPane} />
            <Route path="/my-inbox" component={MyInboxAppPane} />
            <Route path="/data-monitored" component={DataMonitoredAppPane} />
            <Route path="/private-data-vault" component={PrivateDataVaultAppPane} />
            <Route path="/links" component={VPNLinksAppPane} />
            <Route path="/links/create" component={VPNLinksCreateAppPane} />
          </Route>
        </Routes>
      </Router>
    </Show>
  )

}, document.getElementById("root") as HTMLElement);