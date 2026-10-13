import Constants from "expo-constants";
import { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { WebView } from "react-native-webview";
import { useTranslation } from "react-i18next";
import Typography from "@/components/Typography";
import NativeMap from "./index.native";
import { AddressMapProps } from "./types";
import CenterPin from "./CenterPin";

// Google Maps is used when configured. The testing fallback needs no cloud key.
export default function AddressMap(props: AddressMapProps) {
  return Constants.expoConfig?.extra?.androidGoogleMapsEnabled ? (
    <NativeMap {...props} />
  ) : (
    <OpenMap {...props} />
  );
}
function OpenMap({
  pin,
  onSelect,
  height,
  interactive = true,
  onMoving,
}: AddressMapProps) {
  const { t } = useTranslation();
  const web = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const html = useMemo(
    () => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""><style>html,body,#map{height:100%;margin:0;background:#eef1ea}.pin{width:20px;height:20px;background:#c78063;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px #0005}.leaflet-control-attribution{font-size:9px!important}</style></head><body><div id="map"></div><script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="" onerror="window.ReactNativeWebView.postMessage(JSON.stringify({type:'error'}))"></script><script>
if(window.L){const map=L.map('map',{zoomControl:false,attributionControl:false,maxBounds:[[28.5,46.4],[30.12,48.8]],maxBoundsViscosity:1,dragging:${interactive},touchZoom:${interactive},doubleClickZoom:${interactive},scrollWheelZoom:${interactive}}).setView([29.3759,47.9774],12); L.control.attribution({position:'bottomleft',prefix:false}).addTo(map);
L.tileLayer(${JSON.stringify(process.env.EXPO_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png")},{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
let marker;const icon=L.divIcon({className:'',html:'<div class="pin"></div>',iconSize:[26,26],iconAnchor:[13,13]});
window.setAddressPin=function(p){if(!p)return;const center=map.getCenter();const latlng=[p.latitude,p.longitude];if(!${interactive}){if(marker)marker.setLatLng(latlng);else marker=L.marker(latlng,{icon}).addTo(map);}if(Math.abs(center.lat-p.latitude)>0.000001||Math.abs(center.lng-p.longitude)>0.000001)map.setView(latlng,16);};
function emit(p){window.ReactNativeWebView.postMessage(JSON.stringify({type:'pin',latitude:p.lat,longitude:p.lng}));}
map.on('movestart',function(){if(${interactive})window.ReactNativeWebView.postMessage(JSON.stringify({type:'moving'}));});
map.on('moveend',function(){if(${interactive})emit(map.getCenter());});window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}));
new ResizeObserver(function(){map.invalidateSize();}).observe(document.getElementById('map'));}
</script></body></html>`,
    [interactive],
  );
  useEffect(() => {
    if (ready)
      web.current?.injectJavaScript(
        `window.setAddressPin && window.setAddressPin(${JSON.stringify(pin)});true;`,
      );
  }, [pin, ready]);
  return (
    <View
      style={{ height, width: "100%" }}
      pointerEvents={interactive ? "auto" : "none"}
    >
      <WebView
        ref={web}
        source={{ html, baseUrl: "https://shopsimplist.com/" }}
        userAgent="ShopSimplist/1.0 (+https://shopsimplist.com)"
        cacheEnabled
        mixedContentMode="never"
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["https://*", "about:blank"]}
        style={{ flex: 1, backgroundColor: "#eef1ea" }}
        onLoadStart={() => setReady(false)}
        onError={() => setFailed(true)}
        onMessage={(event) => {
          try {
            const value = JSON.parse(event.nativeEvent.data);
            if (value.type === "ready") {
              setFailed(false);
              setReady(true);
            } else if (value.type === "error") setFailed(true);
            else if (value.type === "moving") onMoving?.(true);
            else if (
              value.type === "pin" &&
              Number.isFinite(value.latitude) &&
              Number.isFinite(value.longitude)
            ) {
              onSelect({
                latitude: value.latitude,
                longitude: value.longitude,
              });
              onMoving?.(false);
            }
          } catch {
            /* Ignore unsupported messages. */
          }
        }}
        onShouldStartLoadWithRequest={(request) => {
          if (
            request.url.startsWith("https://www.openstreetmap.org/copyright")
          ) {
            void Linking.openURL(request.url);
            return false;
          }
          return (
            request.url === "about:blank" ||
            request.url === "https://shopsimplist.com/"
          );
        }}
      />
      {interactive && <CenterPin />}
      {failed && (
        <Pressable
          onPress={() => {
            setFailed(false);
            setReady(false);
            web.current?.reload();
          }}
          style={{
            position: "absolute",
            left: 16,
            top: 16,
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#fff",
          }}
        >
          <Typography.Text size="sm">
            {t("notifications.retry")}
          </Typography.Text>
        </Pressable>
      )}
    </View>
  );
}
