// Intro.tsx

import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View>
      <Text>Welcome to Phase! 🌿</Text>
      <Text>We help you align fitness with your cycle.</Text>
      <Button title="Get Started" onPress={() => router.push('/auth')} />
    </View>
  );
}
