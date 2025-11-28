
import { use, useCallback, useEffect, useReducer, useState } from 'react';
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
    const { token, URL, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [state, dispatch] = useReducer(componentsReducer, initialState);
    const route = useRoute();
   // const { travelPackage, type } = route.params || {};
   const travelPackage = { id: 3 };
   const type = 'flights';
   const id = travelPackage.id;

    const fetchComponents = useCallback(async () => {
        console.log('Fetching components for package:', travelPackage, 'of type:', type);
        dispatch({type:'FETCH_COMPONENTS_REQUEST'});
        try {
            const response = await fetch(`${URL}/travel-packages/${id}/options?type=${type}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                
            });
            console.log('Response:', response.status, response.ok);
            
            if (!response.ok) {
                
                throw new Error('Failed to fetch components data');
            }

            const data = await response.json();
            
            if (data.success) {
                dispatch({ 
                    type: 'FETCH_COMPONENTS_SUCCESS', 
                    payload: { allComponents: data.data } 
                   
                });
                
            } else {
                throw new Error(data.message || 'Unknown error occurred');
                
            }
        } catch (error) {
            dispatch({ 
                type: 'FETCH_COMPONENTS_FAILURE', 
                payload: { error: error.message } 
            });
        }
    }, [URL, token, travelPackage.id, type]);
useEffect(() => {
    if (travelPackage && type)
        fetchComponents();
    }, [fetchComponents, travelPackage.id, type,  state.error]);
  
    return {
        travelPackage,
        type,
        isLoading: state.isLoading || isLoading,
        error: state.error || error,
        allComponents: state.allComponents || [], 
        fetchComponents,
        dispatch 
    };

   


}