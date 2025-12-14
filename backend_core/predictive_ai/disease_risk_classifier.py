import numpy as np
import os
import pickle
from sklearn.ensemble import RandomForestClassifier

class RiskClassifier:
    """
    The Diagnostic Engine.
    Uses a Random Forest to predict the probability of specific diseases
    based on a vector of patient biomarkers.
    """

    def __init__(self, model_path="assets/models/risk_rf.pkl"):
        self.model_path = model_path
        self.model = None
        self.labels = ["Healthy", "Cardiovascular_Risk", "Diabetes_Type2", "Oncology_Alert"]
        
        # Load pre-trained model if it exists, else use heuristics
        if os.path.exists(model_path):
            with open(model_path, "rb") as f:
                self.model = pickle.load(f)

    def predict_disease_prob(self, patient_vector: list) -> dict:
        """
        Input: [Age, BMI, Systolic_BP, Glucose, Cholesterol, Smoker_Flag]
        Output: Dictionary of probabilities for each disease class.
        """
        # If we have a trained AI, use it
        if self.model:
            # Reshape for single sample prediction
            input_data = np.array(patient_vector).reshape(1, -1)
            probs = self.model.predict_proba(input_data)[0]
            
            result = {}
            for i, label in enumerate(self.labels):
                result[label] = round(probs[i], 4)
            return result

        # --- FALLBACK HEURISTICS (If no AI trained yet) ---
        # Useful for testing without training data
        return self._heuristic_logic(patient_vector)

    def _heuristic_logic(self, vec: list) -> dict:
        """
        Temporary logic rule-set until the AI is trained.
        Vec: [Age, BMI, BP, Glucose, Chol, Smoke]
        """
        age, bmi, bp, gluc, chol, smoke = vec
        
        cardio_score = 0.1
        if bp > 140: cardio_score += 0.3
        if chol > 240: cardio_score += 0.3
        if smoke: cardio_score += 0.2
        
        diabetes_score = 0.05
        if gluc > 120: diabetes_score += 0.5
        if bmi > 30: diabetes_score += 0.3
        
        return {
            "Healthy": max(0, 1 - (cardio_score + diabetes_score)),
            "Cardiovascular_Risk": min(0.99, cardio_score),
            "Diabetes_Type2": min(0.99, diabetes_score),
            "Oncology_Alert": 0.15 # Baseline risk
        }