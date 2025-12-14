class ProteinSynthesizer:
    def __init__(self):
        self.codon_table = {
            'AUG': 'Met', 'UUU': 'Phe', 'UUC': 'Phe', 'UUA': 'Leu', 
            'UUG': 'Leu', 'UAA': 'STOP', 'UAG': 'STOP', 'UGA': 'STOP'
        }

    def translate_rna(self, mrna_seq: str) -> list:
        protein = []
        for i in range(0, len(mrna_seq), 3):
            codon = mrna_seq[i:i+3]
            if codon in self.codon_table:
                if self.codon_table[codon] == 'STOP': break
                protein.append(self.codon_table[codon])
        return protein
