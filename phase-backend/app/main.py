

from fastapi import FastAPI, Body
from app.models import CycleInput, PhaseInfo
from app.logic.cycle_calculator import calculate_current_phase
from datetime import date

app = FastAPI(
    title="Menstrual Cycle Calculator API",
    description="An API to calculate the current phase of the menstrual cycle.",
    version="1.0.0",
)

@app.get("/", tags=["Health Check"])
def read_root():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "ok", "message": "Welcome to the Cycle Calculator API!"}


@app.post("/v1/calculate-phase", response_model=PhaseInfo, tags=["Cycle Calculator"])
def get_current_phase(input_data: CycleInput):
    """
    Calculates the current menstrual cycle phase based on user data.

    This endpoint receives the user's last period start date, average cycle length,
    and average period duration, then returns the current phase details.
    """

    phase_information = calculate_current_phase(input_data)
    
    return phase_information