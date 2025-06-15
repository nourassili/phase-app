import { StyleSheet, Text, View } from 'react-native';

export default function TipsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Here are your wellness tips!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
});
