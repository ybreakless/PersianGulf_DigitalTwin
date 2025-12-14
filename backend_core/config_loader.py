import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # --- Project Metadata ---
    PROJECT_NAME: str = "BioTwin_Integrated_Platform"
    VERSION: str = "3.0.0-ALPHA"
    
    # --- Directory Paths ---
    # These use os.path to work on Windows, Mac, or Linux automatically
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    
    ASSETS_DIR: str = os.path.join(BASE_DIR, "assets")
    MODELS_DIR: str = os.path.join(ASSETS_DIR, "models")
    DATA_LAKE_DIR: str = os.path.join(BASE_DIR, "data_lake")
    
    # --- Simulation Constants ---
    MAX_SIMULATION_TIME_YEARS: int = 10
    DEFAULT_RADIATION_DOSE_GY: float = 10.0
    
    class Config:
        env_file = ".env"

# Create a global settings object to be used everywhere
settings = Settings()

# Ensure critical folders exist
os.makedirs(settings.MODELS_DIR, exist_ok=True)
os.makedirs(settings.DATA_LAKE_DIR, exist_ok=True)