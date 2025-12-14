import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# Professional Import Structure
from .models.patient_schema import PatientTwin, OrganStats, GeneticProfile
from .biological_engine.cell_cycle_simulator import CellCycleMonitor
from .biological_engine.immune_system_optimizer import ImmuneDefenseSim
from .biological_engine.dna_transcription_sim import GeneticSequencer

# Setup Logging (So you can debug like a pro)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BioTwin_Kernel")

app = FastAPI(
    title="BioTwin Integrated Platform",
    description="High-fidelity biological simulation engine.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engines with Default Parameters
bio_engine = CellCycleMonitor(p53_gene_status="functional")
immune_engine = ImmuneDefenseSim(t_cell_count=1200, pathogen_load=5000)
dna_engine = GeneticSequencer()

@app.get("/")
def system_status():
    return {"status": "ONLINE", "mode": "RESEARCH_GRADE", "gpu_acceleration": "DISABLED"}

@app.post("/api/v1/simulate/{patient_id}", response_model=PatientTwin)
def run_full_simulation(patient_id: str, radiation_dose_gy: Optional[float] = 0.0):
    logger.info(f"Initiating Simulation for Patient: {patient_id}")

    try:
        # 1. Run Cellular Simulation (Stochastic Model)
        mitosis_results = bio_engine.simulate_mitosis(time_steps=50, cellular_stress=0.75)
        
        # 2. Run Immune Simulation
        battle_results = immune_engine.run_battle_simulation(efficiency_rate=0.85)

        # 3. Construct the Professional Object
        # In a real app, this data would come from the CSV readers
        twin = PatientTwin(
            id=patient_id,
            age=34,
            biological_sex="Female",
            organs={
                "Heart": OrganStats(name="Heart", health_index=88.5, blood_perfusion=98.0, cancer_risk_score=0.1),
                "Liver": OrganStats(name="Liver", health_index=mitosis_results['cancer_risk_score'], blood_perfusion=92.0, cancer_risk_score=mitosis_results['cancer_risk_score'])
            },
            genetics=GeneticProfile(
                dna_snippet="ATCG...",
                detected_mutations=["BRCA1_Variant_Unknown"],
                epigenetic_age=36.2
            ),
            simulation_log=mitosis_results['log'][-5:] # Keep last 5 logs to save space
        )
        
        return twin

    except Exception as e:
        logger.error(f"Simulation Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
