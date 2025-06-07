export interface PhaseInfo {
  phase_name:
    | "Menstruation"
    | "Follicular Phase"
    | "Fertile Window"
    | "Luteal Phase";
  phase_start_date: string;
  phase_end_date: string;
  message: string;
}
export interface PhaseDisplayCardProps {
  phaseInfo: PhaseInfo;
}
