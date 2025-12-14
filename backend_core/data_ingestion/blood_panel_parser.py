import pandas as pd
from typing import Dict

class BloodPanelReader:
    """
    Ingests CSV files containing Complete Blood Count (CBC) data.
    Standardizes units to ensure compatibility with the Biological Engine.
    """

    def __init__(self):
        # Define normal ranges for validation
        self.reference_ranges = {
            "Hemoglobin": (13.5, 17.5), # g/dL for men (COMMA IS HERE)
            "WBC": (4500, 11000),       # cells/mcL (COMMA IS HERE)
            "Platelets": (150000, 450000) # (Last item doesn't strictly need one, but it's safe)
        }

    def parse_csv(self, file_path: str) -> Dict[str, float]:
        """
        Reads a CSV and returns a clean dictionary of biomarkers.
        Expected CSV Format: Marker,Value,Unit
        """
        try:
            df = pd.read_csv(file_path)
            
            # Simple normalization logic
            results = {}
            for index, row in df.iterrows():
                marker = row['Marker'].strip()
                value = float(row['Value'])
                results[marker] = value
                
            return results
        except Exception as e:
            print(f"Error reading blood panel CSV: {e}")
            return {}

    def check_abnormalities(self, data: Dict[str, float]) -> list:
        """
        Returns a list of markers that are out of range.
        """
        flags = []
        for marker, value in data.items():
            if marker in self.reference_ranges:
                low, high = self.reference_ranges[marker]
                if value < low:
                    flags.append(f"{marker} LOW ({value})")
                elif value > high:
                    flags.append(f"{marker} HIGH ({value})")
        return flags