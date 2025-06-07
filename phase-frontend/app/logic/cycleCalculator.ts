export interface CycleInput {
  last_period_start_date: string; 
  average_cycle_length: number;
  average_period_duration: number;
}

export interface PhaseInfo {
  phase_name: string;
  phase_start_date: string;
  phase_end_date: string;
  message: string;
}

const LUTEAL_PHASE_DURATION = 14;

export const calculateCurrentPhase = (inputData: CycleInput): PhaseInfo => {
  const targetDate = new Date();
  const lastPeriodStart = new Date(
    inputData.last_period_start_date + "T00:00:00"
  );

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const periodEndDate = addDays(
    lastPeriodStart,
    inputData.average_period_duration - 1
  );
  const estimatedOvulationDate = addDays(
    lastPeriodStart,
    inputData.average_cycle_length - LUTEAL_PHASE_DURATION - 1
  );
  const fertileWindowStartDate = addDays(estimatedOvulationDate, -5);
  const lutealPhaseStartDate = addDays(estimatedOvulationDate, 1);
  const nextPeriodStartDate = addDays(
    lastPeriodStart,
    inputData.average_cycle_length
  );

  if (targetDate >= lastPeriodStart && targetDate <= periodEndDate) {
    return {
      phase_name: "Menstruation",
      phase_start_date: formatDate(lastPeriodStart),
      phase_end_date: formatDate(periodEndDate),
      message: "This is the start of your cycle, characterized by bleeding.",
    };
  }

  if (targetDate > periodEndDate && targetDate < fertileWindowStartDate) {
    return {
      phase_name: "Follicular Phase",
      phase_start_date: formatDate(addDays(periodEndDate, 1)),
      phase_end_date: formatDate(addDays(fertileWindowStartDate, -1)),
      message:
        "Your body is preparing for ovulation. Estrogen levels are rising.",
    };
  }

  if (
    targetDate >= fertileWindowStartDate &&
    targetDate <= estimatedOvulationDate
  ) {
    return {
      phase_name: "Fertile Window",
      phase_start_date: formatDate(fertileWindowStartDate),
      phase_end_date: formatDate(estimatedOvulationDate),
      message:
        "You are at your most fertile. Ovulation is likely occurring now.",
    };
  }

  if (targetDate > estimatedOvulationDate && targetDate < nextPeriodStartDate) {
    return {
      phase_name: "Luteal Phase",
      phase_start_date: formatDate(lutealPhaseStartDate),
      phase_end_date: formatDate(addDays(nextPeriodStartDate, -1)),
      message:
        "Your body is preparing for the next period. Progesterone levels are high.",
    };
  }

  return {
    phase_name: "Cycle End",
    phase_start_date: formatDate(nextPeriodStartDate),
    phase_end_date: formatDate(nextPeriodStartDate),
    message:
      "Your next cycle is about to begin. Log your new period to update.",
  };
};
