const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');

async function testOrs() {
    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
        console.error("ORS_API_KEY not found in .env");
        return;
    }
    console.log("Found ORS_API_KEY (first 5 chars):", apiKey.substring(0, 5) + "...");

    const orsBaseUrl = "https://api.openrouteservice.org/v2/matrix";
    // Simple test payload
    const payload = {
        locations: [[8.681495, 49.41461], [8.687872, 49.420318]], // Example coords
        metrics: ["distance", "duration"]
    };

    try {
        console.log("Testing Walking Matrix...");
        const response = await axios.post(
            `${orsBaseUrl}/foot-walking`,
            payload,
            {
                headers: {
                    Authorization: apiKey,
                    "Content-Type": "application/json; charset=utf-8",
                    Accept: "application/json, application/geo+json",
                },
            }
        );
        console.log("Success! Status:", response.status);
        console.log("Data sample:", JSON.stringify(response.data.durations));
    } catch (error) {
        console.error("Error testing ORS:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testOrs();
