import random

class CellCycleMonitor:
    def __init__(self, p53_gene_status: str = "functional"):
        self.p53_status = p53_gene_status
        self.phases = ["G1", "S", "G2", "M"]
        self.current_phase_index = 0
        self.mutation_load = 0.0

    def simulate_mitosis(self, time_steps: int, cellular_stress: float):
        history = []
        divisions = 0
        
        for t in range(time_steps):
            # Stochastic check: Even with stress, sometimes cells get lucky (or unlucky)
            random_factor = random.uniform(0.0, 0.2)
            effective_stress = cellular_stress - random_factor

            # p53 Logic: If mutated, it ignores stress checks
            checkpoint_passed = False
            if self.p53_status == "mutated":
                checkpoint_passed = True
            elif effective_stress < 0.6:
                checkpoint_passed = True

            if checkpoint_passed:
                self.current_phase_index = (self.current_phase_index + 1) % 4
                phase = self.phases[self.current_phase_index]
                if phase == "M":
                    divisions += 1
                history.append(f"T{t}: {phase} -> OK")
            else:
                self.mutation_load += 0.05
                history.append(f"T{t}: ARREST -> Repairing DNA")

        # Calculate a Risk Score (0 to 100)
        risk = (divisions / time_steps) * 100 + (self.mutation_load * 50)
        
        return {
            "divisions": divisions,
            "cancer_risk_score": min(100.0, round(risk, 2)),
            "log": history
        }
