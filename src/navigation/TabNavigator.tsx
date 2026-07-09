import { View, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/HomeScreen';
import { TrainScreen } from '../screens/TrainScreen';
import { CoachScreen } from '../screens/CoachScreen';
import { FoodScreen } from '../screens/FoodScreen';
import { ExploreStack } from './ExploreStack';
import { colors, shadows } from '../theme';
import type { RootTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

function CoachTabButton({ onPress, children }: BottomTabBarButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.coachButtonWrap}>
      <View style={[styles.coachButton, shadows.coachTab]}>
        {children}
      </View>
    </Pressable>
  );
}

export function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 16),
          paddingHorizontal: 6,
          height: 64 + Math.max(insets.bottom, 16),
        },
        tabBarActiveTintColor: colors.plum,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Train"
        component={TrainScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Coach"
        component={CoachScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />
          ),
          tabBarButton: (props) => (
            <CoachTabButton {...props}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.white} />
            </CoachTabButton>
          ),
          tabBarActiveTintColor: colors.white,
          tabBarInactiveTintColor: colors.white,
        }}
      />
      <Tab.Screen
        name="Food"
        component={FoodScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  coachButtonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -16 }],
  },
});
