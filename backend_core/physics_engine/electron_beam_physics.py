import math

class ElectronBeamSolver:
    """
    Simulates Ultra-High Dose Rate (FLASH) Radiotherapy.
    Calculates cell survival probability using the Linear-Quadratic (LQ) Model.
    """

    def __init__(self):
        # Standard constants for tissue sensitivity
        # Alpha: Single-hit kill probability (Gy^-1)
        # Beta: Accumulation damage probability (Gy^-2)
        self.alpha_tumor = 0.35 
        self.beta_tumor = 0.035
        self.alpha_healthy = 0.15 
        self.beta_healthy = 0.03

    def calculate_survival(self, dose_gy: float, is_tumor: bool, oxygen_level: float = 1.0) -> float:
        """
        Calculates the fraction of cells that survive the radiation.
        
        :param dose_gy: Radiation dose in Gray (Gy).
        :param is_tumor: True if target is tumor, False if healthy tissue.
        :param oxygen_level: 0.0 to 1.0 (Hypoxic tumors are harder to kill).
        """
        alpha = self.alpha_tumor if is_tumor else self.alpha_healthy
        beta = self.beta_tumor if is_tumor else self.beta_healthy

        # Oxygen Enhancement Ratio (OER) adjustment
        # Hypoxic cells (low oxygen) are 2-3x more resistant to radiation
        oer_factor = 1.0 + (2.0 * oxygen_level) 
        effective_dose = dose_gy * (oer_factor / 3.0) 

        # The LQ Equation: S = exp(-alpha*D - beta*D^2)
        exponent = -1 * (alpha * effective_dose + beta * (effective_dose ** 2))
        survival_fraction = math.exp(exponent)
        
        return survival_fraction

    def run_flash_simulation(self, target_volume_cm3: float, dose_gy: float) -> dict:
        """
        Runs a comparative simulation: Tumor vs. Healthy Tissue
        """
        tumor_survival = self.calculate_survival(dose_gy, is_tumor=True, oxygen_level=0.4) # Tumors are often hypoxic
        healthy_survival = self.calculate_survival(dose_gy, is_tumor=False, oxygen_level=1.0)

        tumor_reduction = (1 - tumor_survival) * 100
        collateral_damage = (1 - healthy_survival) * 100

        return {
            "dose_applied_gy": dose_gy,
            "tumor_ablation_percent": round(tumor_reduction, 2),
            "healthy_tissue_damage_percent": round(collateral_damage, 2),
            "therapeutic_ratio": round(tumor_reduction / collateral_damage, 2) if collateral_damage > 0 else 100
        }