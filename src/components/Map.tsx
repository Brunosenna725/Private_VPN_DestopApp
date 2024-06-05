import { onMount, createSignal, For, createEffect } from "solid-js";
import MapGL, { Viewport, Control, Marker, Popup } from 'solid-map-gl';
import * as maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Server, servers} from "../store/vpnClient";
import { changeLocation, selectedLocationId, setSelectedLocationId, setSelectedRegionId } from "@/locationStore";

const [viewport, setViewport] = createSignal({
  center: [7.375557319070417, 37.019738922886205],
  zoom: 2,
} as Viewport);


export const centerMap = (loc: [number, number], zoom = 2) => {
  setViewport({
    center: loc,
    zoom
  })
}

const MapComponent = () => {
  const [showPopup, setShowPopup] = createSignal(true)

  const onMarkerClick = (server: Server) => {
    changeLocation(server);
    centerMap([server.location.longitude, server.location.latitude], 8)
    setShowPopup(false);
    setShowPopup(true);
  }

  return (
    <MapGL
      class="w-full h-full"
      mapLib={maplibre} // <- Pass MapLibre package here
      options={{ style: 'https://raw.githubusercontent.com/ThePrivateCompany/map-styles/main/light-style.json', maxZoom: '3', minZoom:'2', attributionControl: false }}
      viewport={viewport()}
      onViewportChange={(evt: Viewport) => setViewport(evt)}
    >
      <Control type="attribution" custom="hidden" position="top-right" />
      <For each={servers()}>
        {(server) =>(
          <>
            <Marker showPopup={showPopup()} popup={{anchor: "top-left",  offset: [-12, 3] }} options={{element: <div onClick={(e) => {onMarkerClick(server)}}><CustomMarker/></div>}} lngLat={[server.location.longitude, server.location.latitude]}>
              <div class="flex flex-col color-black leading-16px">
                <div class="font-medium text-14px">{server.fullName}</div>
                <div class="font-medium text-11px color-#00091F/60">{server.id === selectedLocationId() ? "Connected" : "Not Connected"}</div>
              </div>
            </Marker>

          </>
        )}
      </For>
    </MapGL>
  )
}

const CustomMarker = () => {
  return <img src="assets/pin.svg" alt="" />
}

export {MapComponent}