import { useEffect, useState } from "react";

const inicialPackage = {
    title: '',
    destination:'',
    origin:'',
    departureDate:'',
    returnDate:'',
    description:'',
    numberOfTravelers:'',
    availableSlots:'',
    totalMilesPrice:'',
    totalMoneyPrice:'',
    status:'',
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
        default:
            return state;
    }
}


export default function AdminPanelController() {
const { token, URL, user } = useAuth();
    
    const [wallet, dispatch] = useReducer(packageReduce, inicialPackage);
    useEffect(() => {
        const fetchPackageData = async () => {
            dispatch({ type: 'FETCH_PACKAGE_REQUEST' });
            const response = await fetch(`${URL}/travel-packages/`, {
            method: 'POST',
            headers: {
                    'Authorization': `Bearer ${token}`,
                },
        });
            try {
                if (!response.ok) {
                    throw new Error('Failed to fetch package data');
                }
            } catch (error) {
                dispatch({ type: 'FETCH_PACKAGE_FAILURE', payload: { error: error.message } });
            }
        };

        fetchPackageData();
    }, [token]);
    return {
        state: { searchQuery },
        actions: { setSearchQuery },
    };

}
