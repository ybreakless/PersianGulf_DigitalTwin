import logging
import json
import os
from datetime import datetime

# Setup Professional Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("BioTwin_Core")

def save_json_state(data: dict, filename: str, folder: str) -> str:
    """
    Saves the Master Patient JSON safely to the disk.
    """
    try:
        # Add a timestamp to version control the file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        full_filename = f"{filename}_{timestamp}.json"
        path = os.path.join(folder, full_filename)
        
        with open(path, 'w') as f:
            json.dump(data, f, indent=4)
            
        logger.info(f"State successfully saved to: {path}")
        return path
    except Exception as e:
        logger.error(f"Failed to save state: {e}")
        return ""