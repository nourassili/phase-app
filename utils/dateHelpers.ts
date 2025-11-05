// utils/dateHelpers.ts
import { addDays, format, differenceInDays, startOfDay, isSameDay } from 'date-fns';
import { CyclePhase, PeriodPrediction } from '../types';

export const formatDate = (date: Date | string, formatString = 'yyyy-MM-dd'): string => {
  return format(new Date(date), formatString);
};

export const getDaysBetween = (startDate: Date | string, endDate: Date | string): number => {
  return differenceInDays(new Date(endDate), new Date(startDate));
};

export const addDaysToDate = (date: Date | string, days: number): Date => {
  return addDays(new Date(date), days);
};

export const isToday = (date: Date | string): boolean => {
  return isSameDay(new Date(date), new Date());
};

export const getPeriodPrediction = (
  lastPeriodDate: string,
  avgCycleLength: number = 28,
  avgPeriodLength: number = 5
): PeriodPrediction => {
  const lastPeriod = new Date(lastPeriodDate);
  const nextPeriodDate = addDaysToDate(lastPeriod, avgCycleLength);
  
  // Ovulation typically occurs 14 days before next period
  const ovulationDate = addDaysToDate(nextPeriodDate, -14);
  
  // Fertile window is typically 5 days before and 1 day after ovulation
  const fertileWindowStart = addDaysToDate(ovulationDate, -5);
  const fertileWindowEnd = addDaysToDate(ovulationDate, 1);
  
  // Calculate confidence based on cycle regularity (simplified)
  const confidence = 0.85; // This would be calculated based on historical data
  
  return {
    nextPeriodDate: formatDate(nextPeriodDate),
    fertileWindowStart: formatDate(fertileWindowStart),
    fertileWindowEnd: formatDate(fertileWindowEnd),
    ovulationDate: formatDate(ovulationDate),
    confidence,
  };
};

export const getCyclePhase = (
  currentDate: string,
  lastPeriodDate: string,
  avgCycleLength: number = 28,
  avgPeriodLength: number = 5
): CyclePhase => {
  const current = new Date(currentDate);
  const lastPeriod = new Date(lastPeriodDate);
  const daysSinceLastPeriod = getDaysBetween(lastPeriod, current);
  
  if (daysSinceLastPeriod <= avgPeriodLength) {
    return 'menstrual';
  } else if (daysSinceLastPeriod <= 13) {
    return 'follicular';
  } else if (daysSinceLastPeriod >= 12 && daysSinceLastPeriod <= 16) {
    return 'ovulation';
  } else {
    return 'luteal';
  }
};

export const getCalendarMarking = (
  date: string,
  lastPeriodDate: string,
  avgCycleLength: number = 28,
  avgPeriodLength: number = 5
) => {
  const phase = getCyclePhase(date, lastPeriodDate, avgCycleLength, avgPeriodLength);
  
  switch (phase) {
    case 'menstrual':
      return {
        color: '#FF6B9D',
        textColor: 'white',
        marked: true,
      };
    case 'ovulation':
      return {
        color: '#F59E0B',
        textColor: 'white',
        marked: true,
      };
    case 'follicular':
      return {
        color: '#E0F2FE',
        textColor: '#0369A1',
        marked: true,
      };
    case 'luteal':
      return {
        color: '#F3E8FF',
        textColor: '#7C3AED',
        marked: true,
      };
    default:
      return {};
  }
};