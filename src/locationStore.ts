import { createEffect, createSignal, on } from "solid-js";
import { onConnected, onDisconnected, onProgress, sendCancel, sendConnect, sendDisconnect } from "./store/electron";
import { servers, Server } from "./store/vpnClient";
import { centerMap } from "./components/Map";

export const [selectedRegionId, setSelectedRegionId] = createSignal<string | null>(null);
export const [selectedLocationId, setSelectedLocationId] = createSignal<string | null>(null);
export const [connecting, setConnecting] = createSignal(false);
export const [connected, setConnected] = createSignal(false);
export const [connectingProgress, setConnectingProgress] = createSignal(0);

export const changeLocation = async (server: Server | null) => {
  if (connecting()) return;
  setConnecting(true);

  if (selectedLocationId()) {
    await sendDisconnect();
    setSelectedLocationId(null);
    setSelectedRegionId(null);
    setConnected(false);
    setConnectingProgress(0);
  }

  if (!server) {
    centerMap([0, 0]);
    setConnecting(false);
    return
  };
  sendConnect(server.ip, server.protocols.OpenVPN.TCP, server.id);
  setSelectedLocationId(server.id);
  setSelectedRegionId(server.fullName);

}

onConnected(() => {
  setConnected(true);
  setConnecting(false);
  setConnectingProgress(0);

  const server = servers().find((server) => server.id === selectedLocationId())
  if (server) {
    centerMap([server.location.longitude, server.location.latitude], 8);
  }
})

onDisconnected(() => {
  setConnected(false);
  setSelectedLocationId(null);
  setSelectedRegionId(null);
})

onProgress((progress) => {
  setConnectingProgress(progress)
})

export const cancelConnecting = () => {
  setSelectedLocationId(null);
  setSelectedRegionId(null);
  setConnecting(false);
  sendCancel()
}