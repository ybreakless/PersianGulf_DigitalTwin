# backend_core/biological_engine/microbiome_analyzer.py
import math

class GutBiomeAnalyzer:
    def __init__(self, bacteria_sample: dict):
        self.sample = bacteria_sample

    def calculate_shannon_index(self) -> float:
        total = sum(self.sample.values())
        if total == 0: return 0.0
        
        entropy = 0.0
        for count in self.sample.values():
            pi = count / total
            if pi > 0: entropy += pi * math.log(pi)
        return -round(entropy, 3)