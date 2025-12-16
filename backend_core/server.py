
import csv
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_FILE = 'patients.csv'

# ADDED: 'patient_photo' and 'patient_csv' to the end
CSV_HEADERS = [
    'username', 'password', 'name', 'email', 'sex', 'model',
    'height_cm', 'weight_kg', 'body_fat_pct', 
    'bpm_resting', 'spo2_pct', 'bp_sys_dia', 'ecg_pattern', 
    'lung_fvc', 'peak_flow', 'breathing_rate', 
    'temp_c', 'glucose_mg', 'hydration_pct',
    'patient_photo', 'patient_csv' 
]

def init_db():
    # We check if file exists. If not, create it.
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(CSV_HEADERS)
            # Default Admin
            writer.writerow(['admin', 'bio123', 'Dr. Ari', 'admin@y314.com', 'male', 'human_male.glb'] + ['']*(len(CSV_HEADERS)-6))

def get_user(username):
    init_db()
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['username'] == username:
                return row
    return None

def add_user(data):
    init_db()
    if get_user(data['username']):
        return False
    
    with open(DB_FILE, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        row = []
        for header in CSV_HEADERS:
            # Safe get: if data is missing, put empty string
            row.append(data.get(header, ''))
        
        writer.writerow(row)
    return True

@app.route('/')
def home():
    return "Y314 Core Online."

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = get_user(data.get('username'))
    if user and user['password'] == data.get('password'):
        return jsonify({"success": True, "user": user})
    return jsonify({"success": False, "message": "Invalid Credentials"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('username') or not data.get('password') or not data.get('sex'):
        return jsonify({"success": False, "message": "Username, Password, and Sex are required."}), 400
        
    sex = data.get('sex').lower()
    if sex == 'female':
        data['model'] = 'human_female.glb'
    else:
        data['model'] = 'human_male.glb'

    success = add_user(data)
    if success:
        return jsonify({"success": True, "message": "Patient Registered"})
    else:
        return jsonify({"success": False, "message": "User ID taken"}), 409

if __name__ == '__main__':
    init_db()
    print("🚀 Y314 Database Linked: patients.csv")
    app.run(debug=True, port=5000)
