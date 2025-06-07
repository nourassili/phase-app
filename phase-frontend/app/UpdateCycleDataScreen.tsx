import { UpdatePeriod } from "@/components/Experience/UpdatePeriod";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function UpdateCycleDataScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Update Cycle Data</Text>
      <Text style={styles.description}>
        Manually adjust your last period start date and average lengths here.
        This is useful for correcting initial setup data.
      </Text>
      <UpdatePeriod />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5D3A66",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginBottom: 24,
    marginTop: 8,
  },
});
