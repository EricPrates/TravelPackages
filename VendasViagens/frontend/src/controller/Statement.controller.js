import { useEffect, useState, useReducer } from "react";
import { useAuth } from "../AuthContext";


const initialState = {
    transactions: [], 
    isLoading: false,
    error: null,
   
};


function packagesReducer(state, action) {
    switch (action.type) {
        case 'FETCH_TRANSACTIONS_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'FETCH_TRANSACTIONS_SUCCESS':
            return {
                ...state,
                isLoading: false,
                transactions: action.payload.transactions || [],
            };
        case 'FETCH_TRANSACTIONS_FAILURE':
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
    const { token, URL, user, isLoading } = useAuth();
    const [state, dispatch] = useReducer(packagesReducer, initialState);

    
    const fetchTransactions = async () => {
        dispatch({ type: 'FETCH_TRANSACTIONS_REQUEST' });
        try {
           
            const response = await fetch(`${URL}/wallet/statement`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
             
                },
            });
            if (!response.ok) {
                throw new Error('Erro ao buscar transações');
            }
            console.log(response.data);
            
          const data = await response.json();
        
            
            if (data.success) {
                dispatch({ 
                    type: 'FETCH_TRANSACTIONS_SUCCESS', 
                    payload: { 
                        transactions: data.data.transactions 
                    }
                });
            } else {
                throw new Error(data.message || 'Unknown error occurred');
                
            }
        } catch (error) {
            dispatch({ 
                type: 'FETCH_TRANSACTIONS_FAILURE', 
                payload: { error: error.message } 
            });
        }
    };

    
  

    useEffect(() => {
     fetchTransactions();
    }, []);

    return {
     
      fetchTransactions,
      isLoading: state.isLoading,
      transactions: state.transactions,
      error: state.error,
}
}