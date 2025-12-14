import os

class FastA_Parser:
    """
    Reads .FASTA or .TXT files from DNA sequencing machines (like Illumina).
    Extracts the raw nucleotide sequence string.
    """

    def load_sequence_from_file(self, file_path: str) -> str:
        """
        Parses a standard FASTA file.
        Lines starting with '>' are headers (metadata).
        Other lines are the DNA sequence.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Genomic file not found: {file_path}")

        sequence_buffer = []
        
        with open(file_path, 'r') as file:
            for line in file:
                line = line.strip()
                if not line:
                    continue
                
                if line.startswith(">"):
                    # This is metadata (e.g., ">Patient_001_Chr1")
                    # We can store it or skip it
                    continue 
                else:
                    # This is actual DNA data
                    sequence_buffer.append(line)
        
        # Join all lines into one massive string
        full_sequence = "".join(sequence_buffer)
        return full_sequence.upper() # Ensure standard uppercase

    def validate_dna(self, sequence: str) -> bool:
        """
        Checks if the file contains valid DNA characters (A, T, C, G, N).
        """
        valid_chars = set("ATCGN")
        return all(char in valid_chars for char in sequence)