import {createStore} from 'solid-js/store';
import type StoreType from 'electron-store';
import { createSignal } from 'solid-js';


const ipcRenderer = window.require("electron").ipcRenderer;

export const sendLoggedInEvent = () => {
  ipcRenderer.send("logged_in");
}

const Store = window.require?.('electron-store');
const store = new Store() as StoreType;

const newState = () => {
  return {
    isLoggedIn: store.get("logged_in"),
    paidUser: store.get("paid_user"),
    token: store.get("token") as string,
    appver: store.get("appver") as string,
    ovpnver: store.get("ovpnver") as string,
    constate: store.get("constate") as string
  }
}

const [state, setState] = createStore(newState());

// Use this function to update the state.
const refreshState = () => {
  setState(newState());
}


const setToken = (token: string | null) => {
  store.set("token", token);
  refreshState();
  ipcRenderer.send("token_set")
}
const setPaidUser = (value: boolean) => {
  store.set("paid_user", value);
  refreshState();
}

const setIsLoggedIn = (value: boolean) => {
  store.set("logged_in", value);
}

const sendConnect = (ip: string, port: string, serverId: string) => {
  ipcRenderer.send("onConnect", ip, port, serverId);
}
const sendDisconnect = async () => {
  return await ipcRenderer.invoke('onDisconnect')
}
const sendCancel = () => {
  return ipcRenderer.send('onCancel')
}

const onProgress = (callback: (number: number) => void) => {
  ipcRenderer.on('onProgress', (event, progress) => callback(progress))
}
const onConnected = (callback: () => void) => {
  ipcRenderer.on('onConnected', callback)
}
const onDisconnected = (callback: () => void) => {
  ipcRenderer.on('onDisconnected', callback)
}


const [initProgress, setInitProgress] = createSignal<null | number>(null)

ipcRenderer.on('showInitScreen', () => {
  setInitProgress(0)
})
ipcRenderer.on('initProgress', (event, progress) => {
  setInitProgress(progress)
})


ipcRenderer.on('hideInitScreen', () => {
  setInitProgress(null)
})

const sendLoginVisible = () => {
  ipcRenderer.send("login_visible");
}
const sendMainPageVisible = () => {
  ipcRenderer.send("page_visible");
}

export {
  state,
  setToken,
  setPaidUser,
  setIsLoggedIn,
  sendConnect,
  sendDisconnect,
  sendCancel,
  onProgress,
  onConnected,
  onDisconnected,
  initProgress,
  sendLoginVisible,
  sendMainPageVisible
};