import { createSignal } from 'solid-js';
import {Client} from '../../api-client';
import { state } from './electron';
import clm from 'country-locale-map';



export const client = new Client();


export interface Server {
  protocols: any;
  location: {
    country: string;
    latitude: number;
    longitude: number;
  }
  fullName: string;
  ip: string; 
  id: string; 
  port: string; 
  tier: any 
}

export const [servers, setServers] = createSignal<Server[]>([]);

export const loadVPNServers = async () => {
  await client.login(state.token)

  const res = await client.listVPNServers()
  const servers = res.servers
  console.log(servers)

  let customServers: Server[] = [];
  for (let i = 0; i < servers.length; i++) {
    const server = servers[i];
    customServers.push({...server, fullName: clm.getCountryNameByAlpha2(server.location.country)!})
  }
  setServers(customServers);
}
