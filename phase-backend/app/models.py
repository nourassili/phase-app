

from pydantic import BaseModel, Field
from datetime import date
from typing import Literal

class CycleInput(BaseModel):
    last_period_start_date: date = Field(..., description="The first day of the user's last menstrual period.")
    average_cycle_length: int = Field(..., gt=0, description="The user's average cycle length in days.")
    average_period_duration: int = Field(..., gt=0, description="The user's average period duration in days.")

    class Config:
        json_schema_extra = {
            "example": {
                "last_period_start_date": "2025-06-01",
                "average_cycle_length": 28,
                "average_period_duration": 5
            }
        }

class PhaseInfo(BaseModel):
    phase_name: Literal[
        "Menstruation", 
        "Follicular Phase", 
        "Fertile Window", 
        "Luteal Phase"
    ] = Field(..., description="The name of the current menstrual cycle phase.")
    phase_start_date: date = Field(..., description="The start date of the current phase.")
    phase_end_date: date = Field(..., description="The end date of the current phase.")
    message: str = Field(..., description="A user-friendly message about the current phase.")