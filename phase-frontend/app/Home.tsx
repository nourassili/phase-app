import { supabase } from "@/utils/supabase";
import { Button, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "white" }}>Welcome!</Text>
      <Button title="Log out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}
