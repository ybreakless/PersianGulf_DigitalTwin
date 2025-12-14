class LifeExpectancyModel:
    """
    The Prognostic Engine.
    Estimates life expectancy and 'Biological Age' acceleration.
    """

    def __init__(self):
        # Base expectancy (global average approx)
        self.base_expectancy = 82.0 
        
        # Years lost/gained per factor (Simplified Actuarial Data)
        self.coefficients = {
            "smoker": -10.5,
            "obesity": -4.2,
            "high_blood_pressure": -5.1,
            "diabetes": -6.5,
            "active_lifestyle": +3.5,
            "good_diet": +2.2
        }

    def predict_lifespan(self, current_age: int, risk_factors: list) -> dict:
        """
        risk_factors: List of strings e.g. ["smoker", "high_blood_pressure"]
        """
        predicted_age = self.base_expectancy
        
        # Apply penalties/bonuses
        for factor in risk_factors:
            if factor in self.coefficients:
                predicted_age += self.coefficients[factor]
        
        # Calculate Biological Age (How old the body 'feels')
        # If you are 30 but expect to die at 60, your bio-age is effectively higher.
        years_lost = self.base_expectancy - predicted_age
        biological_age = current_age + (years_lost * 0.5)
        
        return {
            "chronological_age": current_age,
            "predicted_lifespan": round(predicted_age, 1),
            "biological_age": round(biological_age, 1),
            "years_lost_to_lifestyle": round(years_lost, 1)
        }