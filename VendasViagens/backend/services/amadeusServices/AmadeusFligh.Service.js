
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



