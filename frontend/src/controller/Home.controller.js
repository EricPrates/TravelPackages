import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

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


export default function HomeController() {
    const { token, URL, user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [travelPackage, dispatch] = useReducer(packageReduce, inicialPackage);
    

     const fetchPackageData = async () => {
        dispatch({type:'FETCH_PACKAGE_REQUEST'});
        try {
            const response = await fetch(`${URL}/travel-packages/${searchQuery}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch Travel-Package data');
            }

            const data = await response.json();
            if(data.success){
                dispatch({type: 'FETCH_PACKAGE_SUCCESS', payload: data.data});
            } else {
                dispatch({type: 'FETCH_PACKAGE_FAILURE', payload: data.message});
            }
        } catch (error) {
            dispatch({type: 'FETCH_PACKAGE_FAILURE', payload: error});
        }
    };

    useEffect(() => {
        if (token) {
            fetchPackageData();
        }
   
}, [token]);
return {
        state: { searchQuery },
        actions: { setSearchQuery },
        error: travelPackage.error,
        isLoading: travelPackage.isLoading,
        title: travelPackage.title,
        destination: travelPackage.destination,
        origin: travelPackage.origin,
        departureDate: travelPackage.departureDate,
        returnDate: travelPackage.returnDate,
        description: travelPackage.description,
        numberOfTravelers: travelPackage.numberOfTravelers,
        availableSlots: travelPackage.availableSlots,
        totalMilesPrice: travelPackage.totalMilesPrice,
        totalMoneyPrice: travelPackage.totalMoneyPrice,
        status: travelPackage.status,
        images: travelPackage.images,
    };
}
