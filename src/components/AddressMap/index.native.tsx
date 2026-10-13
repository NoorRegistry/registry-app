import { useCallback, useEffect, useRef, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Platform, View } from "react-native";
import Constants from "expo-constants";
import { useFocusEffect } from "expo-router";
import CenterPin from "./CenterPin";
import { AddressMapProps } from "./types";
const kuwait = {
  latitude: 29.3759,
  longitude: 47.9774,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};
export default function AddressMap({
  pin,
  onSelect,
  height,
  interactive = true,
  onMoving,
}: AddressMapProps) {
  const map = useRef<MapView>(null);
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const [initialRegion] = useState(() =>
    pin ? { ...pin, latitudeDelta: 0.006, longitudeDelta: 0.006 } : kuwait,
  );
  const center = useRef(pin ?? kuwait);
  useEffect(() => {
    // A gesture updates the form's selected coordinate. Only external changes
    // (such as Use my location) should recenter the camera.
    if (
      pin &&
      (Math.abs(pin.latitude - center.current.latitude) > 0.000001 ||
        Math.abs(pin.longitude - center.current.longitude) > 0.000001)
    ) {
      center.current = pin;
      map.current?.animateToRegion(
        { ...pin, latitudeDelta: 0.006, longitudeDelta: 0.006 },
        350,
      );
    }
  }, [pin]);
  return (
    <View style={{ height, width: "100%" }}>
      {focused && (
        <MapView
          key={interactive ? "picker" : "preview"}
          ref={map}
          provider={
            Platform.OS === "ios" &&
            Constants.expoConfig?.extra?.iosGoogleMapsEnabled
              ? PROVIDER_GOOGLE
              : undefined
          }
          style={{ height, width: "100%" }}
          scrollEnabled={interactive}
          zoomEnabled={interactive}
          rotateEnabled={false}
          pitchEnabled={false}
          initialRegion={initialRegion}
          onRegionChange={() => interactive && onMoving?.(true)}
          onRegionChangeComplete={(region) => {
            center.current = {
              latitude: region.latitude,
              longitude: region.longitude,
            };
            if (interactive) {
              onSelect(center.current);
              onMoving?.(false);
            }
          }}
          showsCompass={false}
          showsMyLocationButton={false}
        >
          {!interactive && pin && (
            <Marker coordinate={pin} pinColor="#C78063" />
          )}
        </MapView>
      )}
      {interactive && <CenterPin />}
    </View>
  );
}
