import time
import random
from typing import Generator

class WearableDeviceConnector:
    """
    Simulates a live WebSocket connection to a patient's smart watch.
    Streams Vital Signs in real-time.
    """

    def __init__(self, device_id: str = "WATCH-001"):
        self.device_id = device_id
        self.is_connected = False

    def connect(self):
        print(f"Connecting to device {self.device_id}...")
        self.is_connected = True
        print("Connection Established.")

    def stream_data(self) -> Generator[dict, None, None]:
        """
        Yields a continuous stream of JSON data packets.
        """
        if not self.is_connected:
            raise ConnectionError("Device not connected")

        while True:
            # Simulate sensor noise and variability
            heart_rate = random.randint(60, 95)
            spo2 = random.randint(96, 99)
            
            packet = {
                "timestamp": time.time(),
                "heart_rate_bpm": heart_rate,
                "spo2_percent": spo2,
                "activity_status": "Walking" if heart_rate > 85 else "Resting"
            }
            
            yield packet
            time.sleep(1) # Simulate 1-second update interval