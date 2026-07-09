import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExploreScreen } from '../screens/ExploreScreen';
import { TogetherScreen } from '../screens/TogetherScreen';
import type { ExploreStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="Together" component={TogetherScreen} />
    </Stack.Navigator>
  );
}
