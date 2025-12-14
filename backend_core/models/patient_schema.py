from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class OrganStats(BaseModel):
    name: str
    health_index: float = Field(..., ge=0.0, le=100.0, description="0=Dead, 100=Perfect")
    blood_perfusion: float
    cancer_risk_score: float

class GeneticProfile(BaseModel):
    dna_snippet: str
    detected_mutations: List[str]
    epigenetic_age: float

class PatientTwin(BaseModel):
    id: str
    age: int
    biological_sex: str
    organs: Dict[str, OrganStats]
    genetics: GeneticProfile
    simulation_log: List[str] = []
