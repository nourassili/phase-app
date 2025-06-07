
from datetime import date, timedelta
from app.models import CycleInput, PhaseInfo

LUTEAL_PHASE_DURATION = 14

def calculate_current_phase(input_data: CycleInput, target_date: date = date.today()) -> PhaseInfo:
   
    last_period_start = input_data.last_period_start_date
    cycle_length = input_data.average_cycle_length
    period_duration = input_data.average_period_duration

    
    period_end_date = last_period_start + timedelta(days=period_duration - 1)
    
    estimated_ovulation_date = last_period_start + timedelta(days=cycle_length - LUTEAL_PHASE_DURATION -1)
    
    fertile_window_start_date = estimated_ovulation_date - timedelta(days=5)
    fertile_window_end_date = estimated_ovulation_date

    follicular_phase_start_date = period_end_date + timedelta(days=1)
    
    luteal_phase_start_date = fertile_window_end_date + timedelta(days=1)
    next_period_start_date = last_period_start + timedelta(days=cycle_length)
    luteal_phase_end_date = next_period_start_date - timedelta(days=1)



    if last_period_start <= target_date <= period_end_date:
        return PhaseInfo(
            phase_name="Menstruation",
            phase_start_date=last_period_start,
            phase_end_date=period_end_date,
            message="This is the start of your cycle, characterized by bleeding."
        )
    
    if follicular_phase_start_date <= target_date < fertile_window_start_date:
        return PhaseInfo(
            phase_name="Follicular Phase",
            phase_start_date=follicular_phase_start_date,
            phase_end_date=fertile_window_start_date - timedelta(days=1),
            message="Your body is preparing for ovulation. Estrogen levels are rising."
        )

    if fertile_window_start_date <= target_date <= fertile_window_end_date:
        return PhaseInfo(
            phase_name="Fertile Window",
            phase_start_date=fertile_window_start_date,
            phase_end_date=fertile_window_end_date,
            message="You are at your most fertile. Ovulation is likely occurring now."
        )

    if luteal_phase_start_date <= target_date <= luteal_phase_end_date:
        return PhaseInfo(
            phase_name="Luteal Phase",
            phase_start_date=luteal_phase_start_date,
            phase_end_date=luteal_phase_end_date,
            message="Your body is preparing for the next period. Progesterone levels are high."
        )
    
    return PhaseInfo(
        phase_name="Luteal Phase", 
        phase_start_date=luteal_phase_start_date,
        phase_end_date=luteal_phase_end_date,
        message="Cycle data may be out of date."
    )