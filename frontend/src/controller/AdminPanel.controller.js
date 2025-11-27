import { useReducer, useState } from 'react';
import { useAuth } from './AuthContext';

const inicialPackage = {
    title: '',
    destination: '',
    origin: '',
    departureDate: '',
    returnDate: '',
    description: '',
    numberOfTravelers: '',
    availableSlots: '',
    totalMilesPrice: '',
    totalMoneyPrice: '',
    status: '',
    images: [],
    isLoading: false,
    error: null,
};

function packageReduce(state, action) {
    switch (action.type) {
        case 'FETCH_PACKAGE_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'FETCH_PACKAGE_SUCCESS':
            return {
                ...state,
                isLoading: false,
                title: action.payload.title || '',
                destination: action.payload.destination || '',
                origin: action.payload.origin || '',
                departureDate: action.payload.departureDate || '',
                returnDate: action.payload.returnDate || '',
                description: action.payload.description || '',
                numberOfTravelers: action.payload.numberOfTravelers || '',
                availableSlots: action.payload.availableSlots || '',
                totalMilesPrice: action.payload.totalMilesPrice || '',
                totalMoneyPrice: action.payload.totalMoneyPrice || '',
                status: action.payload.status || '',
                images: action.payload.images || [],
            };
        case 'FETCH_PACKAGE_FAILURE':
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
            };
        case 'RESET_PACKAGE':
            return inicialPackage;
        default:
            return state;
    }
}

export default function AdminPanelController() {
    const { token, URL, user } = useAuth();
    const [tela, setTela] = useState('');
    
    // ✅ CORRIGIDO: Nome correto para o estado
    const [packageState, dispatch] = useReducer(packageReduce, inicialPackage);

    // ✅ CORRIGIDO: Função com nome diferente e body correto
    async function createBasicPackage(packageData) {
        dispatch({ type: 'FETCH_PACKAGE_REQUEST' });
        
        try {
            const response = await fetch(`${URL}/travel-packages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json', // ✅ ADICIONADO
                },
                body: JSON.stringify(packageData), // ✅ ADICIONADO
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar pacote');
            }

            const data = await response.json();
            
            if (data.success) {
                dispatch({ type: 'FETCH_PACKAGE_SUCCESS', payload: data.data });
                return { success: true, data: data.data };
            } else {
                throw new Error(data.message || 'Erro ao criar pacote');
            }
        } catch (error) {
            dispatch({ type: 'FETCH_PACKAGE_FAILURE', payload: { error: error.message } });
            return { success: false, error: error.message };
        }
    }

    // ✅ Função para resetar o formulário
    function resetPackage() {
        dispatch({ type: 'RESET_PACKAGE' });
    }

    return {
        packageState,
        createBasicPackage,
        resetPackage,
        tela,
        setTela,
    };
}