class ImmuneDefenseSim:
    def __init__(self, t_cell_count: int, pathogen_load: int):
        self.t_cells = t_cell_count
        self.pathogens = pathogen_load

    def run_battle_simulation(self, efficiency_rate: float = 0.8):
        kill_count = int(self.t_cells * efficiency_rate)
        self.pathogens = max(0, int((self.pathogens - kill_count) * 1.2))
        return {
            "remaining_pathogens": self.pathogens,
            "status": "Infection Cleared" if self.pathogens == 0 else "Active Infection"
        }

    def optimize_via_sirna(self):
        return "siRNA Treatment Applied: Viral Replication Halted."
