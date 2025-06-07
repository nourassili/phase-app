import { Welcome } from "@/components/Dashboard/Welcome";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { Button, View } from "react-native";

export default function Home() {
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#5D3A66",
      }}
    >
      <Welcome />
      <Button title="Log out" onPress={() => handleSignOut()} />
    </View>
  );
}
