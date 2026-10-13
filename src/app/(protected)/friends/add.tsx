import { Redirect } from "expo-router";
export default function AddFriendPage() {
  return (
    <Redirect
      href={{
        pathname: "/(protected)/(tabs)/search",
        params: { type: "people", q: "" },
      }}
    />
  );
}
