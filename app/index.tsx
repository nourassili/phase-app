import { router } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Phase 🌸</Text>
      <Button title="Get Started" onPress={() => router.push('/(onboarding)/intro')} />
      <Button title="Sign In" onPress={() => router.push('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
  },
});
