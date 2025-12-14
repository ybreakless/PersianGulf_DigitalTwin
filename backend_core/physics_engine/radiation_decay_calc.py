import math

class IsotopeDecayCalculator:
    """
    Calculates the remaining radioactivity of an isotope over time.
    Formula: N(t) = N0 * (1/2)^(t / half_life)
    """

    def __init__(self):
        # Half-lives in days
        self.isotope_db = {
            "Iodine-131": 8.02,
            "Cobalt-60": 1925.28, # 5.27 years
            "Technetium-99m": 0.25 # 6 hours
        }

    def get_remaining_activity(self, isotope: str, initial_activity_bq: float, days_elapsed: float) -> float:
        """
        Returns remaining activity in Becquerels (Bq).
        """
        half_life = self.isotope_db.get(isotope)
        if not half_life:
            return -1.0 # Unknown isotope

        decay_factor = 0.5 ** (days_elapsed / half_life)
        remaining = initial_activity_bq * decay_factor
        
        return round(remaining, 4)

# --- TEST BLOCK ---
if __name__ == "__main__":
    calc = IsotopeDecayCalculator()
    rem = calc.get_remaining_activity("Iodine-131", 5000, 16.0) # 16 days = 2 half lives
    print(f"Remaining Iodine-131 Activity: {rem} Bq (Expected: 1250.0)")