import numpy as np

class ClinicalAnomalyDetector:
    """
    The Sentinel Engine.
    Detects outliers in patient data that might indicate rare conditions
    or sensor errors in the digital twin.
    """

    def __init__(self):
        # Mean and Std Dev for standard blood markers (Population Norms)
        self.norms = {
            "white_blood_cells": {"mean": 7000, "std": 2000},
            "hemoglobin": {"mean": 15, "std": 2},
            "platelets": {"mean": 300000, "std": 50000}
        }

    def detect_outliers(self, biomarker_data: dict) -> list:
        """
        Uses Z-Score analysis to find anomalies.
        Z = (Value - Mean) / StdDev
        If Z > 3 (3 sigma), it's a 99.7% statistical outlier.
        """
        anomalies = []
        
        for marker, value in biomarker_data.items():
            if marker in self.norms:
                stats = self.norms[marker]
                z_score = (value - stats["mean"]) / stats["std"]
                
                if abs(z_score) > 3.0:
                    severity = "CRITICAL" if abs(z_score) > 4.5 else "WARNING"
                    anomalies.append({
                        "marker": marker,
                        "value": value,
                        "z_score": round(z_score, 2),
                        "severity": severity,
                        "message": f"Value is {z_score:.1f} standard deviations from norm."
                    })
                    
        return anomalies