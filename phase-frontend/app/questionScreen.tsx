import { Questionnaire } from "@/components/AuthLogIn/Questionnaire";
import { View } from "react-native";

export default function questionScreen() {
  return (
    <View style={{ backgroundColor: "white" }}>
      <Questionnaire />
    </View>
  );
}
