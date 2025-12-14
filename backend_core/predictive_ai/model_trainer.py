import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

class AI_Trainer:
    """
    Generates synthetic medical data and trains the Random Forest model.
    Run this script once to 'teach' the AI before starting the server.
    """
    
    def __init__(self, save_path="assets/models/risk_rf.pkl"):
        self.save_path = save_path
        # Features: [Age, BMI, BP, Glucose, Chol, Smoker]
        self.X_data = [] 
        self.y_data = [] # Labels: 0=Healthy, 1=Cardio, 2=Diabetes, 3=Oncology

    def generate_synthetic_data(self, n_samples=5000):
        print(f"Generating {n_samples} synthetic patient records...")
        
        for _ in range(n_samples):
            # Randomize attributes
            age = np.random.randint(20, 90)
            bmi = np.random.normal(25, 5)
            bp = np.random.normal(120, 15)
            gluc = np.random.normal(100, 20)
            chol = np.random.normal(200, 40)
            smoker = np.random.choice([0, 1], p=[0.8, 0.2])
            
            features = [age, bmi, bp, gluc, chol, smoker]
            
            # Determine "Ground Truth" label based on logic
            label = 0 # Healthy
            if bp > 140 or (chol > 240 and smoker):
                label = 1 # Cardio
            elif gluc > 126 or (bmi > 35 and age > 45):
                label = 2 # Diabetes
            elif age > 60 and np.random.random() > 0.9:
                label = 3 # Random cancer risk in old age
                
            self.X_data.append(features)
            self.y_data.append(label)

    def train_and_save(self):
        # Convert to numpy arrays
        X = np.array(self.X_data)
        y = np.array(self.y_data)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        
        # Initialize and Train
        print("Training Random Forest Classifier...")
        clf = RandomForestClassifier(n_estimators=100, max_depth=10)
        clf.fit(X_train, y_train)
        
        # Validate
        accuracy = clf.score(X_test, y_test)
        print(f"Model Training Complete. Validation Accuracy: {accuracy*100:.2f}%")
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.save_path), exist_ok=True)
        
        # Save Model
        with open(self.save_path, "wb") as f:
            pickle.dump(clf, f)
        print(f"Model saved to {self.save_path}")

# --- EXECUTION BLOCK ---
if __name__ == "__main__":
    trainer = AI_Trainer()
    trainer.generate_synthetic_data()
    trainer.train_and_save()