// app/symptoms.tsx

import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, SafeAreaView, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';

const SYMPTOMS = [
  { id: 'cramps', name: 'Cramps', icon: '😣', category: 'physical' },
  { id: 'bloating', name: 'Bloating', icon: '🤰', category: 'physical' },
  { id: 'headache', name: 'Headache', icon: '🤕', category: 'physical' },
  { id: 'fatigue', name: 'Fatigue', icon: '😴', category: 'physical' },
  { id: 'moodSwings', name: 'Mood Swings', icon: '😤', category: 'emotional' },
  { id: 'anxiety', name: 'Anxiety', icon: '😰', category: 'emotional' },
  { id: 'irritability', name: 'Irritability', icon: '😠', category: 'emotional' },
  { id: 'sadness', name: 'Sadness', icon: '😢', category: 'emotional' },
  { id: 'hotFlashes', name: 'Hot Flashes', icon: '🔥', category: 'hormonal' },
  { id: 'nightSweats', name: 'Night Sweats', icon: '💦', category: 'hormonal' },
  { id: 'irregularPeriods', name: 'Irregular Periods', icon: '📅', category: 'hormonal' },
  { id: 'breastTenderness', name: 'Breast Tenderness', icon: '🤱', category: 'hormonal' },
];

export default function SymptomsScreen() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<Record<string, number>>({});

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const setSymptomIntensity = (symptomId: string, level: number) => {
    setIntensity(prev => ({ ...prev, [symptomId]: level }));
  };

  const saveSymptoms = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const symptomData = {
        date: today,
        symptoms: selectedSymptoms.map(id => ({
          id,
          name: SYMPTOMS.find(s => s.id === id)?.name,
          intensity: intensity[id] || 1,
        })),
      };
      
      // Get existing data
      const existingData = await AsyncStorage.getItem('symptomHistory');
      const history = existingData ? JSON.parse(existingData) : [];
      
      // Remove today's entry if it exists, then add new one
      const filteredHistory = history.filter((entry: any) => entry.date !== today);
      filteredHistory.push(symptomData);
      
      await AsyncStorage.setItem('symptomHistory', JSON.stringify(filteredHistory));
      
      Alert.alert('Success', 'Symptoms logged successfully!', [
        { text: 'OK', onPress: () => {
          setSelectedSymptoms([]);
          setIntensity({});
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save symptoms. Please try again.');
    }
  };

  const renderSymptom = (symptom: typeof SYMPTOMS[0]) => {
    const isSelected = selectedSymptoms.includes(symptom.id);
    const symptomIntensity = intensity[symptom.id] || 1;

    return (
      <View key={symptom.id} style={styles.symptomContainer}>
        <Pressable
          style={[
            styles.symptomCard,
            isSelected && styles.selectedSymptom,
          ]}
          onPress={() => toggleSymptom(symptom.id)}
        >
          <Text style={styles.symptomIcon}>{symptom.icon}</Text>
          <Text style={styles.symptomName}>{symptom.name}</Text>
        </Pressable>
        
        {isSelected && (
          <View style={styles.intensityContainer}>
            <Text style={styles.intensityLabel}>Intensity:</Text>
            <View style={styles.intensityButtons}>
              {[1, 2, 3, 4, 5].map(level => (
                <Pressable
                  key={level}
                  style={[
                    styles.intensityButton,
                    symptomIntensity === level && styles.selectedIntensity,
                  ]}
                  onPress={() => setSymptomIntensity(symptom.id, level)}
                >
                  <Text style={[
                    styles.intensityText,
                    symptomIntensity === level && styles.selectedIntensityText,
                  ]}>
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const groupedSymptoms = SYMPTOMS.reduce((acc, symptom) => {
    if (!acc[symptom.category]) acc[symptom.category] = [];
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, typeof SYMPTOMS>);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Log Symptoms' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.date}>Today: {new Date().toLocaleDateString()}</Text>
        
        {Object.entries(groupedSymptoms).map(([category, symptoms]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <View style={styles.symptomsGrid}>
              {symptoms.map(renderSymptom)}
            </View>
          </View>
        ))}
      </ScrollView>

      {selectedSymptoms.length > 0 && (
        <View style={styles.footer}>
          <Pressable style={styles.saveButton} onPress={saveSymptoms}>
            <Text style={styles.saveButtonText}>
              Save {selectedSymptoms.length} Symptom{selectedSymptoms.length !== 1 ? 's' : ''}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  symptomsGrid: {
    gap: 12,
  },
  symptomContainer: {
    marginBottom: 8,
  },
  symptomCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedSymptom: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  symptomIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  symptomName: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 16,
  },
  intensityLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIntensity: {
    backgroundColor: '#8B5CF6',
  },
  intensityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedIntensityText: {
    color: 'white',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
