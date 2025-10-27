// app/calendar.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Calendar, DateData } from 'react-native-calendars';

import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Colors, Spacing, BorderRadius, Animation } from '../constants/Design';
import { 
  getPeriodPrediction, 
  getCyclePhase, 
  formatDate, 
  addDaysToDate 
} from '../utils/dateHelpers';
import { DayLog, FlowIntensity, CyclePhase } from '../types';

const { width } = Dimensions.get('window');

interface PeriodDay {
  date: string;
  flow: FlowIntensity;
  symptoms: string[];
}

interface CalendarMarking {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    selectedColor?: string;
    dots?: Array<{ key: string; color: string }>;
    customStyles?: {
      container?: object;
      text?: object;
    };
  };
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [periodDays, setPeriodDays] = useState<PeriodDay[]>([]);
  const [lastPeriodDate, setLastPeriodDate] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity>('none');
  const [calendarMarkings, setCalendarMarkings] = useState<CalendarMarking>({});

  useEffect(() => {
    loadCalendarData();
  }, []);

  useEffect(() => {
    generateCalendarMarkings();
  }, [periodDays, lastPeriodDate, prediction]);

  const loadCalendarData = async () => {
    try {
      const storedPeriodDays = await AsyncStorage.getItem('periodDays');
      const storedLastPeriod = await AsyncStorage.getItem('lastPeriodDate');
      
      if (storedPeriodDays) {
        setPeriodDays(JSON.parse(storedPeriodDays));
      }
      
      if (storedLastPeriod) {
        setLastPeriodDate(storedLastPeriod);
        const pred = getPeriodPrediction(storedLastPeriod);
        setPrediction(pred);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const generateCalendarMarkings = () => {
    const markings: CalendarMarking = {};
    
    // Mark period days
    periodDays.forEach(day => {
      const color = getFlowColor(day.flow);
      markings[day.date] = {
        marked: true,
        selectedColor: color,
        customStyles: {
          container: {
            backgroundColor: color,
            borderRadius: 8,
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      };
    });

    // Mark predicted days
    if (prediction && lastPeriodDate) {
      // Predicted period
      const nextPeriodStart = new Date(prediction.nextPeriodDate);
      for (let i = 0; i < 5; i++) {
        const date = formatDate(addDaysToDate(nextPeriodStart, i));
        if (!markings[date]) {
          markings[date] = {
            marked: true,
            selectedColor: Colors.primary + '40',
            customStyles: {
              container: {
                backgroundColor: Colors.primary + '40',
                borderRadius: 8,
                borderWidth: 2,
                borderColor: Colors.primary,
              },
              text: {
                color: Colors.primary,
                fontWeight: '600',
              },
            },
          };
        }
      }

      // Fertile window
      const fertileStart = new Date(prediction.fertileWindowStart);
      const fertileEnd = new Date(prediction.fertileWindowEnd);
      let currentDate = fertileStart;
      
      while (currentDate <= fertileEnd) {
        const dateStr = formatDate(currentDate);
        if (!markings[dateStr]) {
          markings[dateStr] = {
            marked: true,
            selectedColor: Colors.success + '30',
            customStyles: {
              container: {
                backgroundColor: Colors.success + '30',
                borderRadius: 8,
              },
              text: {
                color: Colors.success,
                fontWeight: '500',
              },
            },
          };
        }
        currentDate = addDaysToDate(currentDate, 1);
      }

      // Ovulation day
      markings[prediction.ovulationDate] = {
        marked: true,
        selectedColor: Colors.warning,
        customStyles: {
          container: {
            backgroundColor: Colors.warning,
            borderRadius: 8,
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      };
    }

    // Mark selected date
    if (selectedDate) {
      markings[selectedDate] = {
        ...markings[selectedDate],
        selected: true,
        selectedColor: markings[selectedDate]?.selectedColor || Colors.primary,
      };
    }

    setCalendarMarkings(markings);
  };

  const getFlowColor = (flow: FlowIntensity): string => {
    switch (flow) {
      case 'light': return Colors.primary + '60';
      case 'medium': return Colors.primary;
      case 'heavy': return Colors.primaryDark;
      default: return Colors.surface;
    }
  };

  const getFlowIcon = (flow: FlowIntensity): string => {
    switch (flow) {
      case 'light': return '🌸';
      case 'medium': return '🌺';
      case 'heavy': return '🌹';
      default: return '⚪';
    }
  };

  const getCyclePhaseInfo = (date: string) => {
    if (!lastPeriodDate) return null;
    
    const phase = getCyclePhase(date, lastPeriodDate);
    const dayInCycle = Math.floor((new Date(date).getTime() - new Date(lastPeriodDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return { phase, dayInCycle };
  };

  const handleDatePress = (day: DateData) => {
    setSelectedDate(day.dateString);
    Haptics.selectionAsync();
    
    // Check if this date already has flow data
    const existingDay = periodDays.find(p => p.date === day.dateString);
    if (existingDay) {
      setSelectedFlow(existingDay.flow);
    } else {
      setSelectedFlow('none');
    }
    setShowFlowModal(true);
  };

  const handleFlowSelection = async (flow: FlowIntensity) => {
    try {
      const updatedPeriodDays = periodDays.filter(p => p.date !== selectedDate);

      if (flow !== 'none') {
        updatedPeriodDays.push({
          date: selectedDate,
          flow,
          symptoms: [],
        });

        // Update last period date if this is a new period start
        if (!lastPeriodDate ||
            (lastPeriodDate && new Date(selectedDate) > new Date(lastPeriodDate))) {
          setLastPeriodDate(selectedDate);
          await AsyncStorage.setItem('lastPeriodDate', selectedDate);

          const pred = getPeriodPrediction(selectedDate);
          setPrediction(pred);
        }
      }

      setPeriodDays(updatedPeriodDays);
      await AsyncStorage.setItem('periodDays', JSON.stringify(updatedPeriodDays));

      setSelectedFlow(flow);
      setShowFlowModal(false);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error saving flow data:', error);
    }
  };

  const cycleInfo = getCyclePhaseInfo(selectedDate);
  const selectedDayData = periodDays.find(p => p.date === selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.secondary + '20', Colors.background]}
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
            <Typography variant="h3" color="primary" weight="semiBold" style={styles.title}>
              🌙 Cycle Calendar
            </Typography>
            <Typography variant="body" color="secondary" style={styles.subtitle}>
              Track your cycle, predict your next period
            </Typography>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(200).springify()}
            style={styles.calendarCard}
          >
            <Card style={styles.calendarContainer}>
              <Calendar
                current={selectedDate}
                onDayPress={handleDatePress}
                markingType="custom"
                markedDates={calendarMarkings}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: Colors.text.secondary,
                  selectedDayBackgroundColor: Colors.primary,
                  selectedDayTextColor: Colors.text.inverse,
                  todayTextColor: Colors.primary,
                  dayTextColor: Colors.text.primary,
                  textDisabledColor: Colors.text.tertiary,
                  arrowColor: Colors.primary,
                  monthTextColor: Colors.text.primary,
                  textDayFontWeight: '500',
                  textMonthFontWeight: '600',
                  textDayHeaderFontWeight: '600',
                }}
              />
            </Card>
          </Animated.View>

          {prediction && (
            <Animated.View 
              entering={FadeInUp.delay(300).springify()}
              style={styles.predictionSection}
            >
              <Typography variant="h4" color="primary" weight="semiBold" style={styles.sectionTitle}>
                Predictions
              </Typography>
              <View style={styles.predictionCards}>
                <Card style={styles.predictionCard}>
                  <Typography variant="body" color="secondary" style={styles.predictionLabel}>
                    Next Period
                  </Typography>
                  <Typography variant="h4" color="primary" weight="semiBold">
                    {formatDate(prediction.nextPeriodDate, 'MMM dd')}
                  </Typography>
                  <Typography variant="caption" color="tertiary">
                    {formatDate(prediction.nextPeriodDate, 'EEEE')}
                  </Typography>
                </Card>
                
                <Card style={styles.predictionCard}>
                  <Typography variant="body" color="secondary" style={styles.predictionLabel}>
                    Fertile Window
                  </Typography>
                  <Typography variant="body" color="success" weight="semiBold">
                    {formatDate(prediction.fertileWindowStart, 'MMM dd')} - {formatDate(prediction.fertileWindowEnd, 'MMM dd')}
                  </Typography>
                </Card>
              </View>
            </Animated.View>
          )}

          {cycleInfo && (
            <Animated.View 
              entering={FadeInUp.delay(400).springify()}
              style={styles.cycleInfoSection}
            >
              <Card style={styles.cycleInfoCard}>
                <Typography variant="body" color="secondary" style={styles.selectedDateTitle}>
                  {formatDate(selectedDate, 'EEEE, MMMM dd')}
                </Typography>
                
                <View style={styles.cycleDetails}>
                  <View style={styles.cyclePhase}>
                    <Typography variant="caption" color="tertiary">
                      CYCLE PHASE
                    </Typography>
                    <Typography variant="h4" color="primary" weight="semiBold" style={styles.phaseText}>
                      {cycleInfo.phase.charAt(0).toUpperCase() + cycleInfo.phase.slice(1)}
                    </Typography>
                  </View>
                  
                  <View style={styles.cycleDayInfo}>
                    <Typography variant="caption" color="tertiary">
                      DAY IN CYCLE
                    </Typography>
                    <Typography variant="h4" color="secondary" weight="semiBold">
                      Day {cycleInfo.dayInCycle}
                    </Typography>
                  </View>
                </View>

                {selectedDayData && (
                  <View style={styles.flowInfo}>
                    <Typography variant="body" color="secondary" style={styles.flowLabel}>
                      Flow: {getFlowIcon(selectedDayData.flow)} {selectedDayData.flow.charAt(0).toUpperCase() + selectedDayData.flow.slice(1)}
                    </Typography>
                  </View>
                )}
                
                <Button
                  title={selectedDayData ? "Update Flow" : "Log Flow"}
                  onPress={() => setShowFlowModal(true)}
                  variant="outline"
                  size="sm"
                  style={styles.flowButton}
                />
              </Card>
            </Animated.View>
          )}

          <View style={styles.legendSection}>
            <Typography variant="h4" color="primary" weight="semiBold" style={styles.sectionTitle}>
              Legend
            </Typography>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                <Typography variant="caption" color="secondary">Period</Typography>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.success + '60' }]} />
                <Typography variant="caption" color="secondary">Fertile Window</Typography>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                <Typography variant="caption" color="secondary">Ovulation</Typography>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.primary + '40', borderWidth: 2, borderColor: Colors.primary }]} />
                <Typography variant="caption" color="secondary">Predicted</Typography>
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={showFlowModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFlowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              entering={FadeInDown.springify()}
              style={styles.modalContent}
            >
              <Card style={styles.modalCard}>
                <Typography variant="h4" color="primary" weight="semiBold" style={styles.modalTitle}>
                  Log Flow for {formatDate(selectedDate, 'MMM dd')}
                </Typography>
                
                <View style={styles.flowOptions}>
                  {(['none', 'light', 'medium', 'heavy'] as FlowIntensity[]).map((flow) => (
                    <Pressable
                      key={flow}
                      style={[
                        styles.flowOption,
                        selectedFlow === flow && styles.selectedFlowOption
                      ]}
                      onPress={() => setSelectedFlow(flow)}
                    >
                      <Typography variant="h3" style={styles.flowOptionIcon}>
                        {getFlowIcon(flow)}
                      </Typography>
                      <Typography 
                        variant="body" 
                        weight="medium"
                        color={selectedFlow === flow ? 'inverse' : 'primary'}
                      >
                        {flow.charAt(0).toUpperCase() + flow.slice(1)}
                      </Typography>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <Button
                    title="Cancel"
                    onPress={() => setShowFlowModal(false)}
                    variant="ghost"
                    style={styles.modalButton}
                  />
                  <Button
                    title="Save"
                    onPress={() => handleFlowSelection(selectedFlow)}
                    variant="primary"
                    style={styles.modalButton}
                  />
                </View>
              </Card>
            </Animated.View>
          </View>
        </Modal>
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
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  calendarCard: {
    marginBottom: Spacing.xl,
  },
  calendarContainer: {
    padding: Spacing.md,
  },
  predictionSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  predictionCards: {
    gap: Spacing.md,
  },
  predictionCard: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  predictionLabel: {
    marginBottom: Spacing.xs,
  },
  cycleInfoSection: {
    marginBottom: Spacing.xl,
  },
  cycleInfoCard: {
    padding: Spacing.lg,
  },
  selectedDateTitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  cycleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  cyclePhase: {
    alignItems: 'center',
  },
  phaseText: {
    marginTop: Spacing.xs,
  },
  cycleDayInfo: {
    alignItems: 'center',
  },
  flowInfo: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  flowLabel: {
    textAlign: 'center',
  },
  flowButton: {
    alignSelf: 'center',
  },
  legendSection: {
    marginBottom: Spacing.xl,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  modalCard: {
    padding: Spacing.xl,
    borderRadius: 0,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  flowOptions: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  flowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.glass.border,
  },
  selectedFlowOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  flowOptionIcon: {
    marginRight: Spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});