import math

class HemodynamicsSolver:
    """
    Simulates blood flow physics using Poiseuille's Law.
    Essential for predicting heart attacks and stroke risks.
    """

    def __init__(self):
        # Standard blood viscosity (Pascal-seconds)
        self.viscosity = 0.0035 
        
    def calculate_flow_rate(self, radius_mm: float, pressure_diff_mmhg: float, length_cm: float) -> float:
        """
        Calculates Blood Flow Rate (Q) in mL/min.
        Poiseuille's Equation: Q = (pi * r^4 * deltaP) / (8 * viscosity * length)
        """
        # Convert units to SI (meters, pascals)
        radius_m = radius_mm / 1000.0
        length_m = length_cm / 100.0
        pressure_pa = pressure_diff_mmhg * 133.322 # mmHg to Pascals

        numerator = math.pi * (radius_m ** 4) * pressure_pa
        denominator = 8 * self.viscosity * length_m
        
        flow_m3_s = numerator / denominator
        
        # Convert cubic meters/sec to mL/min
        flow_ml_min = flow_m3_s * 60 * 1_000_000
        return round(flow_ml_min, 2)

    def simulate_arterial_blockage(self, blockage_percentage: float):
        """
        Simulates the drop in blood flow when an artery is clogged by cholesterol.
        """
        normal_radius = 2.0 # mm (Coronary artery)
        blocked_radius = normal_radius * (1 - (blockage_percentage / 100.0))
        
        healthy_flow = self.calculate_flow_rate(normal_radius, 100, 5)
        restricted_flow = self.calculate_flow_rate(blocked_radius, 100, 5)
        
        return {
            "blockage_percent": blockage_percentage,
            "healthy_flow_ml_min": healthy_flow,
            "restricted_flow_ml_min": restricted_flow,
            "flow_reduction_percent": round((1 - restricted_flow/healthy_flow) * 100, 2)
        }