// app/symptoms.tsx
import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Pressable, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  TextInput,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolateColor,
  FadeInUp,
  FadeInDown
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Colors, Spacing, BorderRadius, Animation } from '../constants/Design';
import { Symptom, LoggedSymptom } from '../types';

const { width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SYMPTOMS: Symptom[] = [
  { id: 'cramps', name: 'Cramps', icon: '😣', category: 'physical' },
  { id: 'bloating', name: 'Bloating', icon: '🤰', category: 'physical' },
  { id: 'headache', name: 'Headache', icon: '🤕', category: 'physical' },
  { id: 'fatigue', name: 'Fatigue', icon: '😴', category: 'physical' },
  { id: 'backache', name: 'Back Ache', icon: '🤲', category: 'physical' },
  { id: 'breastTenderness', name: 'Breast Tenderness', icon: '🤱', category: 'physical' },
  
  { id: 'moodSwings', name: 'Mood Swings', icon: '😤', category: 'emotional' },
  { id: 'anxiety', name: 'Anxiety', icon: '😰', category: 'emotional' },
  { id: 'irritability', name: 'Irritability', icon: '😠', category: 'emotional' },
  { id: 'sadness', name: 'Sadness', icon: '😢', category: 'emotional' },
  { id: 'stress', name: 'Stress', icon: '😵‍💫', category: 'emotional' },
  { id: 'happiness', name: 'Happy', icon: '😊', category: 'emotional' },
  
  { id: 'hotFlashes', name: 'Hot Flashes', icon: '🔥', category: 'hormonal' },
  { id: 'nightSweats', name: 'Night Sweats', icon: '💦', category: 'hormonal' },
  { id: 'acne', name: 'Acne', icon: '🔴', category: 'hormonal' },
  { id: 'foodCravings', name: 'Food Cravings', icon: '🍫', category: 'hormonal' },
];

interface SymptomCardProps {
  symptom: Symptom;
  isSelected: boolean;
  intensity: number;
  onToggle: (id: string) => void;
  onIntensityChange: (id: string, intensity: number) => void;
}

const SymptomCard: React.FC<SymptomCardProps> = ({
  symptom,
  isSelected,
  intensity,
  onToggle,
  onIntensityChange,
}) => {
  const scale = useSharedValue(1);
  
  const handlePress = useCallback(() => {
    onToggle(symptom.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [symptom.id, onToggle]);
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95, Animation.spring.gentle);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bouncy);
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const getCategoryColor = () => {
    switch (symptom.category) {
      case 'physical': return Colors.error;
      case 'emotional': return Colors.secondary;
      case 'hormonal': return Colors.accent;
      default: return Colors.primary;
    }
  };

  return (
    <View style={styles.symptomContainer}>
      <AnimatedPressable
        style={[
          styles.symptomCard,
          isSelected && styles.selectedSymptom,
          animatedStyle
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Typography variant="h3" style={styles.symptomIcon}>
          {symptom.icon}
        </Typography>
        <Typography 
          variant="body" 
          weight="medium" 
          style={styles.symptomName}
          color={isSelected ? 'inverse' : 'primary'}
        >
          {symptom.name}
        </Typography>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
          <Typography variant="caption" color="inverse" style={styles.categoryText}>
            {symptom.category}
          </Typography>
        </View>
      </AnimatedPressable>
      
      {isSelected && (
        <Animated.View 
          entering={FadeInUp.springify()}
          style={styles.intensityContainer}
        >
          <Typography variant="caption" color="secondary" style={styles.intensityLabel}>
            Intensity
          </Typography>
          <View style={styles.intensityButtons}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.intensityButton,
                  intensity === level && styles.intensityButtonActive
                ]}
                onPress={() => onIntensityChange(symptom.id, level)}
              >
                <Typography 
                  variant="caption" 
                  weight="medium"
                  color={intensity === level ? 'inverse' : 'secondary'}
                >
                  {level}
                </Typography>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default function SymptomsScreen() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSymptom = useCallback((symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
    
    // Set default intensity when selecting
    if (!selectedSymptoms.includes(symptomId)) {
      setIntensity(prev => ({ ...prev, [symptomId]: 1 }));
    }
  }, [selectedSymptoms]);

  const handleIntensityChange = useCallback((symptomId: string, level: number) => {
    setIntensity(prev => ({ ...prev, [symptomId]: level }));
    Haptics.selectionAsync();
  }, []);

  const saveSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('No Symptoms', 'Please select at least one symptom to log.');
      return;
    }
    
    setSaving(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const symptomData = {
        date: today,
        symptoms: selectedSymptoms.map(id => ({
          id,
          name: SYMPTOMS.find(s => s.id === id)?.name || '',
          icon: SYMPTOMS.find(s => s.id === id)?.icon || '',
          category: SYMPTOMS.find(s => s.id === id)?.category || 'physical',
          intensity: intensity[id] || 1,
        })),
        notes: notes.trim(),
      };
      
      // Get existing data
      const existingData = await AsyncStorage.getItem('symptomHistory');
      const history = existingData ? JSON.parse(existingData) : [];
      
      // Remove today's entry if it exists, then add new one
      const filteredHistory = history.filter((entry: any) => entry.date !== today);
      filteredHistory.push(symptomData);
      
      await AsyncStorage.setItem('symptomHistory', JSON.stringify(filteredHistory));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert('✨ Success', 'Your symptoms have been logged beautifully!', [
        { text: 'Continue', onPress: () => {
          setSelectedSymptoms([]);
          setIntensity({});
          setNotes('');
        }}
      ]);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save symptoms. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSymptoms = SYMPTOMS.filter(symptom =>
    symptom.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['physical', 'emotional', 'hormonal'] as const;
  
  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'physical': return '🌸 Physical';
      case 'emotional': return '💝 Emotional';  
      case 'hormonal': return '🌙 Hormonal';
      default: return category;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            entering={FadeInUp.delay(100).springify()}
            style={styles.headerSection}
          >
            <Typography variant="h3" color="primary" weight="semiBold" style={styles.headerTitle}>
              How are you feeling?
            </Typography>
            <Typography variant="body" color="secondary" style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(200).springify()}
            style={styles.searchSection}
          >
            <Card style={styles.searchCard}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search symptoms..."
                placeholderTextColor={Colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </Card>
          </Animated.View>

          {categories.map((category, categoryIndex) => {
            const categorySymptoms = (searchQuery ? filteredSymptoms : SYMPTOMS)
              .filter(s => s.category === category);
              
            if (categorySymptoms.length === 0) return null;
            
            return (
              <Animated.View 
                key={category}
                entering={FadeInUp.delay(300 + categoryIndex * 100).springify()}
                style={styles.categorySection}
              >
                <Typography variant="h4" color="primary" weight="semiBold" style={styles.categoryTitle}>
                  {getCategoryTitle(category)}
                </Typography>
                <View style={styles.symptomsGrid}>
                  {categorySymptoms.map((symptom: Symptom, symptomIndex: number) => (
                    <Animated.View
                      key={symptom.id}
                      entering={FadeInUp.delay(400 + categoryIndex * 100 + symptomIndex * 50).springify()}
                    >
                      <SymptomCard
                        symptom={symptom}
                        isSelected={selectedSymptoms.includes(symptom.id)}
                        intensity={intensity[symptom.id] || 1}
                        onToggle={toggleSymptom}
                        onIntensityChange={handleIntensityChange}
                      />
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            );
          })}

          {selectedSymptoms.length > 0 && (
            <Animated.View 
              entering={FadeInDown.springify()}
              style={styles.notesSection}
            >
              <Card style={styles.notesCard}>
                <Typography variant="body" color="secondary" style={styles.notesLabel}>
                  Additional notes (optional)
                </Typography>
                <TextInput
                  style={styles.notesInput}
                  placeholder="How are you feeling today? Any additional details..."
                  placeholderTextColor={Colors.text.tertiary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </Card>
            </Animated.View>
          )}

          {selectedSymptoms.length > 0 && (
            <Animated.View 
              entering={FadeInDown.delay(100).springify()}
              style={styles.saveSection}
            >
              <Button
                title={`Save ${selectedSymptoms.length} Symptom${selectedSymptoms.length !== 1 ? 's' : ''}`}
                onPress={saveSymptoms}
                loading={saving}
                fullWidth
                variant="primary"
                size="lg"
              />
            </Animated.View>
          )}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    textAlign: 'center',
  },
  searchSection: {
    marginBottom: Spacing.xl,
  },
  searchCard: {
    padding: 0,
  },
  searchInput: {
    padding: Spacing.base,
    fontSize: 16,
    color: Colors.text.primary,
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryTitle: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  symptomsGrid: {
    gap: Spacing.md,
  },
  symptomContainer: {
    marginBottom: Spacing.sm,
  },
  symptomCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.glass.border,
  },
  selectedSymptom: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  symptomIcon: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  symptomName: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
  },
  categoryText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  intensityContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  intensityLabel: {
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  intensityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.glass.border,
  },
  intensityButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  notesSection: {
    marginBottom: Spacing.xl,
  },
  notesCard: {
    padding: Spacing.lg,
  },
  notesLabel: {
    marginBottom: Spacing.sm,
  },
  notesInput: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveSection: {
    marginBottom: Spacing.xl,
  },
  bottomSpacer: {
    height: Spacing['2xl'],
  },
});
