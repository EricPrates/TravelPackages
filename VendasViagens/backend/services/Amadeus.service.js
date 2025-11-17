const credentials = {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET
};
let tokenCache = {
    token: null,
    expiry: null
}

export const getAccessToken = async () => {
    try {
        if (tokenCache.token) {
            return tokenCache.token;
        }
      
        const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=client_credentials&client_id=${credentials.apiKey}&client_secret=${credentials.apiSecret}`
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na autenticação: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
         tokenCache = {
            token: data.access_token,
            expiry: Date.now() + (data.expires_in * 1000) - 300000 // Expira 5min antes
        };
        
        return data.access_token;
        
    } catch (error) {
        console.error("Erro ao obter token de acesso:", error.message);
        throw error;
    }
};
export const getFlightData = async () => {
    try {
     
        
        const token = await getAccessToken();
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 7);
        const formatteDate = futureDate.toISOString().split('T')[0];
        const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=GRU&destinationLocationCode=GIG&departureDate=${formatteDate}&adults=1`;
        
        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
     
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log("❌ Erro detalhado:", errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
       
        return data;

    } catch (error) {
        console.error(" Erro nos voos:", error.message);
        throw error;
    }
};



