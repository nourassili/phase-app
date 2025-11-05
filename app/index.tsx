// app/index.tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Pressable, 
  SafeAreaView, 
  ScrollView,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  interpolate,
  FadeInUp,
  FadeInDown
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Colors, Spacing, BorderRadius, Animation } from '../constants/Design';
import { getPeriodPrediction, formatDate } from '../utils/dateHelpers';

const { width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FeatureCardProps {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  gradient: string[];
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  href,
  icon,
  title,
  subtitle,
  gradient,
  delay
}) => {
  const router = useRouter();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, Animation.spring.gentle));
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, Animation.spring.gentle);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bouncy);
  };

  const handlePress = () => {
    router.push(href as any);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      style={[styles.featureCard, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <LinearGradient
        colors={gradient}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Typography variant="h2" color="inverse" style={styles.cardIcon}>
          {icon}
        </Typography>
        <Typography variant="h4" color="inverse" weight="semiBold" style={styles.cardTitle}>
          {title}
        </Typography>
        <Typography variant="body" color="inverse" style={styles.cardSubtitle}>
          {subtitle}
        </Typography>
      </LinearGradient>
    </AnimatedPressable>
  );
};

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [nextPeriod, setNextPeriod] = useState<string | null>(null);
  
  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName') || 'Beautiful';
      const lastPeriod = await AsyncStorage.getItem('lastPeriodDate');
      
      setUserName(name);
      
      if (lastPeriod) {
        const prediction = getPeriodPrediction(lastPeriod);
        setNextPeriod(prediction.nextPeriodDate);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.headerGradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            entering={FadeInUp.delay(100).springify()}
            style={styles.welcomeSection}
          >
            <Typography variant="caption" color="inverse" style={styles.greeting}>
              {getGreeting()}
            </Typography>
            <Typography variant="h2" color="inverse" weight="bold" style={styles.welcomeTitle}>
              {userName}
            </Typography>
            <Typography variant="body" color="inverse" style={styles.welcomeSubtitle}>
              Your wellness companion through every phase of life
            </Typography>
          </Animated.View>
          
          {nextPeriod && (
            <Animated.View 
              entering={FadeInUp.delay(300).springify()}
              style={styles.insightCard}
            >
              <Card style={styles.insightCardInner} glassEffect>
                <Typography variant="caption" color="tertiary" style={styles.insightLabel}>
                  NEXT PERIOD
                </Typography>
                <Typography variant="h4" color="primary" weight="semiBold">
                  {formatDate(nextPeriod, 'MMM dd')}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {formatDate(nextPeriod, 'EEEE')}
                </Typography>
              </Card>
            </Animated.View>
          )}
          
          <Animated.View 
            entering={FadeInDown.delay(500).springify()}
            style={styles.featuresSection}
          >
            <Typography variant="h3" color="inverse" weight="semiBold" style={styles.featuresTitle}>
              Track Your Journey
            </Typography>
            
            <View style={styles.featuresGrid}>
              <FeatureCard
                href="/symptoms"
                icon="✨"
                title="Log Symptoms"
                subtitle="Track your daily wellness with beautiful, intuitive logging"
                gradient={['#FF6B9D', '#FF8FA3']}
                delay={600}
              />
              
              <FeatureCard
                href="/calendar"
                icon="🌙"
                title="Cycle Calendar"
                subtitle="Visualize your cycle with our elegant calendar interface"
                gradient={['#8B5CF6', '#A78BFA']}
                delay={800}
              />
              
              <FeatureCard
                href="/chat"
                icon="💭"
                title="Health Assistant"
                subtitle="Get personalized insights and support from our AI companion"
                gradient={['#06B6D4', '#67E8F9']}
                delay={1000}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  headerGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing['4xl'],
  },
  welcomeSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  greeting: {
    marginBottom: Spacing.xs,
    opacity: 0.9,
  },
  welcomeTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  insightCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  insightCardInner: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  insightLabel: {
    marginBottom: Spacing.xs,
  },
  featuresSection: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  featuresTitle: {
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: Spacing.lg,
  },
  featureCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    padding: Spacing.xl,
    minHeight: 140,
    justifyContent: 'center',
  },
  cardIcon: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cardTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cardSubtitle: {
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
});
