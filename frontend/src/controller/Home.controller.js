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


export default function HomeController() {

    const [searchQuery, setSearchQuery] = useState('');
    const [wallet, dispatch] = useReducer(packageReduce, inicialPackage);
    useEffect(() => {
        const response = async () => {


        }
    }, [searchQuery]);
    return {
        state: { searchQuery },
        actions: { setSearchQuery },
    };

}
