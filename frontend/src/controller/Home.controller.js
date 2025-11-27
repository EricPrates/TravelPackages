import { useEffect, useState, useReducer } from "react";
import { useAuth } from "../AuthContext";


const initialState = {
    allPackages: [], 
    filteredPackages: [], 
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
            
                allPackages: action.payload.packages || [],
                filteredPackages: action.payload.packages || [], 
            };
        case 'FETCH_PACKAGES_FAILURE':
            return {
                ...state,
         
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
    const { token, URL, user, isLoading } = useAuth();
    const [state, dispatch] = useReducer(packagesReducer, initialState);

    
    const fetchPackagesData = async () => {
        dispatch({ type: 'FETCH_PACKAGES_REQUEST' });
        console.log('🔵 Iniciando fetch de pacotes...');
        console.log('🔵 URL:', `${URL}/travel-packages`);
        isLoading = true
        
        
        try {
            console.log('🔵 Fazendo fetch...');
            const response = await fetch(`${URL}/travel-packages/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('🔵 Response:', response.status, response.ok);
            
            if (!response.ok) {
                
                throw new Error('Failed to fetch travel packages data');
            }

            const data = await response.json();
            
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
        isLoading = false
    };

    
    const setSearchQuery = (query) => {
        dispatch({ 
            type: 'SET_SEARCH_QUERY', 
            payload: { searchQuery: query } 
        });
    };

    useEffect(() => {
        console.log('🔍 HomeController useEffect - token:', token);
        if (token) {
            console.log('✅ Token existe, chamando fetchPackagesData');
            fetchPackagesData();
        } else {
            console.log('❌ Token não existe');
        }
    }, [token]);

    return {
        state: {
            packages: state.filteredPackages,
            allPackages: state.allPackages, 
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