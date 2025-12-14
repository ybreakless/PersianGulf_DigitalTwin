
export class APIConnector {
    constructor(baseUrl = "http://127.0.0.1:8000/api/v1") {
        this.baseUrl = baseUrl;
    }

    async runSimulation(patientId) {
        try {
            console.log(`[API] Requesting simulation for ${patientId}...`);
            const response = await fetch(`${this.baseUrl}/simulate/${patientId}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error("Backend Connection Failed");
            return await response.json();
        } catch (error) {
            console.error("[API CRITICAL]", error);
            return null;
        }
    }
}
