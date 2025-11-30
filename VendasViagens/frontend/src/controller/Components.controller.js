import { useCallback, useEffect, useReducer, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useRoute } from '@react-navigation/native';

const initialState = {
    allComponents: [],
    isLoading: false,
    error: null,
};
function componentsReducer(state, action) {
    switch (action.type) {
        case 'FETCH_COMPONENTS_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'FETCH_COMPONENTS_SUCCESS':
            return {
                ...state,
                isLoading: false,
                allComponents: action.payload.allComponents || [],

            };
        case 'FETCH_COMPONENTS_FAILURE':
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
            };
        default:
            return state;
    }
}

export default function ComponentsController() {
    const { token, URL } = useAuth();
    const [state, dispatch] = useReducer(componentsReducer, initialState);
    const route = useRoute();
    const { travelPackage, type } = route.params || {};
    const packageId = travelPackage?.id;
    const [error, setError] = useState(null);
    const addComponentToPackage = async (type, packageId, item) => {
        try {
           


            const componentData = {
                type,
                packageId,
                // Dados do voo (Amadeus)
                airline: item.airline,
                flightNumber: item.flightNumber,
                departure: item.departure,
                arrival: item.arrival,
                duration: item.duration,
                numberOfStops: item.numberOfStops,
                // Dados de hotel
                hotel: item.hotel,
                checkin: item.checkin,
                checkout: item.checkout,
                // Dados gerais
                name: item.name,
                description: item.description,
                amadeusId: item.id,
                moneyPrice: item.moneyPrice,
                milesPrice: item.milesPrice,
                // Outros
                origin: item.departure?.iataCode || item.origin,
                destination: item.arrival?.iataCode || item.destination,
                departureDate: item.departure?.at || item.departureDate,
                returnDate: item.arrival?.at || item.returnDate,
                vehicle: item.vehicle,
            };


            const response = await fetch(`${URL}/package-components/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(componentData),
            });
            const data = await response.json();
            if(response.ok){
                setError(null);
            } else {
                setError('Erro ao adicionar componente ao pacote');
            }
        } catch (error) {
            setError(`Erro para adicionar componente: ${error.message}`);
        }
    };

    const fetchComponents = useCallback(async () => {
        if (!packageId || !type) {

            dispatch({
                type: 'FETCH_COMPONENTS_FAILURE',
                payload: { error: 'Pacote ou tipo de componente não especificado' }
            });
            return;
        }


        dispatch({ type: 'FETCH_COMPONENTS_REQUEST' });

        try {
            const url = `${URL}/travel-packages/${packageId}/options?type=${type}`;
            console.log('📡 URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('📥 Response status:', response.status, response.ok);

            if (!response.ok) {
                let errorMessage = `Erro HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.error('❌ Error data:', errorData);
                } catch (e) {
                    console.error('❌ Could not parse error response');
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ Data received:', data.success ? `${data.options?.length || 0} items` : 'failed');

            if (data.success) {
                dispatch({
                    type: 'FETCH_COMPONENTS_SUCCESS',
                    payload: { allComponents: data.options || [] }
                });
            } else {
                throw new Error(data.message || 'Resposta da API indica falha');
            }
        } catch (error) {
            console.error('❌ Error fetching components:', error.message);


            dispatch({
                type: 'FETCH_COMPONENTS_FAILURE',
                payload: { error: error.message }
            });
        }
    }, [URL, token, packageId, type]);
    useEffect(() => {
        if (packageId && type) {
            fetchComponents();
        }
    }, [fetchComponents]);

    return {
        travelPackage,
        type,
        isLoading: state.isLoading,
        error: state.error,
        allComponents: state.allComponents || [],
        fetchComponents,
        dispatch,
        addComponentToPackage,
        error,
    };
}