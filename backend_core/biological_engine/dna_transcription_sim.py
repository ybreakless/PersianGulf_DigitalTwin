class GeneticSequencer:
    def transcribe(self, dna: str) -> str:
        return dna.replace("T", "U")

    def analyze_risk(self, dna: str) -> list:
        risks = []
        if "BRCA1" in dna: risks.append("Breast Cancer Risk")
        return risks
