import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';


export default function IntroScreen() {
return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
    <Text style={{ fontSize: 22, marginBottom: 8 }}>Welcome to Phase! 🌿</Text>
    <Text style={{ fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
    We help you align fitness with your cycle.
    </Text>
    <Button title="Get Started" onPress={() => router.push('/(onboarding)/onboarding')} />
  </View>
  );
}