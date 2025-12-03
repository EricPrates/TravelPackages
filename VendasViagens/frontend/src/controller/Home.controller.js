import { useEffect, useState, useReducer, useCallback} from "react";
import { useAuth } from "../AuthContext";


const initialState = {
    allPackages: [],
    filteredPackages: [],
    isLoading: false,
    error: null,
    searchQuery: ''
};


function packagesReducer(state, action) {
    switch (action.type) {
        case 'FETCH_PACKAGES_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'FETCH_PACKAGES_SUCCESS':
            return {
                ...state,
                isLoading: false,
                allPackages: action.payload.packages || [],
                filteredPackages: action.payload.packages || [],
            };
        case 'FETCH_PACKAGES_FAILURE':
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
            };
        case 'SET_SEARCH_QUERY':
            const searchQuery = action.payload.searchQuery.toLowerCase();


            const filteredPackages = state.allPackages.filter(pkg =>
                pkg.title?.toLowerCase().includes(searchQuery) ||
                pkg.destination?.toLowerCase().includes(searchQuery) ||
                pkg.origin?.toLowerCase().includes(searchQuery) ||
                pkg.description?.toLowerCase().includes(searchQuery)
            );

            return {
                ...state,
                searchQuery: action.payload.searchQuery,
                filteredPackages: searchQuery ? filteredPackages : state.allPackages,
            };
        default:
            return state;
    }
}

export default function HomeController() {
    const { token, URL,  isLoading } = useAuth();
    const [state, dispatch] = useReducer(packagesReducer, initialState);




    const fetchPackagesData = async () => {
        dispatch({ type: 'FETCH_PACKAGES_REQUEST' });
        

        try {

            const response = await fetch(`${URL}/travel-packages/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,

                },
            });


            if (!response.ok) {

                throw new Error('Failed to fetch travel packages data');
            }

            const data = await response.json();
            console.log(data);
            
            console.log('📦 Pacotes recebidos:', data.data?.length);
            if (data.success) {
                dispatch({
                    type: 'FETCH_PACKAGES_SUCCESS',
                    payload: { packages: data.data }
                });

            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        } catch (error) {
            dispatch({
                type: 'FETCH_PACKAGES_FAILURE',
                payload: { error: error.message }
            });
        }
    };


    useEffect(() => {
        if (token){
            fetchPackagesData();
        }
    }, [token]);
    const setSearchQuery = (query) => {
        dispatch({
            type: 'SET_SEARCH_QUERY',
            payload: { searchQuery: query }
        });
    };



    return {
        state: {
            packages: state.filteredPackages,
            allPackages: state.allPackages,
            isLoading: state.isLoading,
            error: state.error,
            searchQuery: state.searchQuery
        },
        actions: {
            setSearchQuery,
            fetchPackagesData,
            clearSearch: () => setSearchQuery('')
        },
        
    };
}