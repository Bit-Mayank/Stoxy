import axios from "axios";


class ApiClient {
    constructor() {
        this.api = axios.create({
            baseURL: "https://www.alphavantage.co",
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
    }

    // Helper to build query string from params object
    buildQuery(params) {
        return Object.entries(params)
            .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
            .join('&');
    }

    async get(params = {}, config = {}) {
        const apiKey = process.env.API_KEY;
        // const apiKey = "demo"
        console.log("APIKEY:", apiKey);
        let finalParams = { ...params, apikey: apiKey };

        // If using demo key, force symbol to IBM for all functions that use symbols
        if (apiKey === 'demo' && finalParams.symbol !== undefined) {
            finalParams.symbol = 'IBM';
        }

        const query = this.buildQuery(finalParams);
        const url = `/query?${query}`;
        console.log(url);
        const response = await this.api.get(url, config);
        return response.data;
    }
}

const apiClient = new ApiClient();
export default apiClient;