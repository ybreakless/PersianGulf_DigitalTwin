# backend_core/biological_engine/cell_cycle_simulator.py
import random

class CellCycleMonitor:
    def __init__(self, p53_gene_status: str = "functional"):
        self.p53_status = p53_gene_status
        self.phases = ["G1", "S", "G2", "M"]
        self.division_count = 0
        self.current_phase_index = 0

    def simulate_mitosis(self, time_steps: int, cellular_stress: float):
        history = []
        for t in range(time_steps):
            if self.p53_status == "mutated" or cellular_stress < 0.5:
                # Proceed to divide
                self.current_phase_index = (self.current_phase_index + 1) % 4
                if self.phases[self.current_phase_index] == "M":
                    self.division_count += 1
                history.append(f"Step {t}: Phase {self.phases[self.current_phase_index]}")
            else:
                history.append(f"Step {t}: Arrested at G1 (Repairing)")
                cellular_stress -= 0.1
        
        return {
            "divisions": self.division_count, 
            "cancer_risk": "HIGH" if self.division_count > time_steps/2 else "LOW",
            "log": history
        }