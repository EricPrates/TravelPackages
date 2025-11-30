import { useState, useEffect, useReducer } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
const inicialState = {
    purchase:null,
    isLoading: false,
    error: null,
};
const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_PURCHASE_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'FETCH_PURCHASE_SUCCESS':
            return {
                ...state,
                isLoading: false,
                purchase: action.payload.purchase || null,
            };
        case 'FETCH_PURCHASE_FAILURE':
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
            };
        default:
            return state;
    }
};

export default function PurchaseDetailsController(route) {
    const navigation = useNavigation();
    const [state, dispatch] = useReducer(reducer, inicialState);
    const {token, URL} = useAuth();
    const {purchaseId} = route.params;


    const fetchPurchaseById = async () => {
        dispatch({ type: 'FETCH_PURCHASE_REQUEST' });
        try {

            const response = await fetch(`${URL}/purchases/${purchaseId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(response);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.data) {
                const purchase = {
                    ...data.data,
                    totalMoneyPrice: parseFloat(data.data.totalMoneyPrice || 0),
                    totalMilesPrice: parseFloat(data.data.totalMilesPrice || 0),
                    paidInMoney: parseFloat(data.data.paidInMoney || 0),
                    paidInMiles: parseFloat(data.data.paidInMiles || 0)
                };
                
                dispatch({ 
                    type: 'FETCH_PURCHASE_SUCCESS', 
                    payload: { purchase } 
                });
            } else {
                throw new Error(data.message || 'Estrutura de dados inválida');
            }
        } catch (err) {
            dispatch({ 
                type: 'FETCH_PURCHASE_FAILURE', 
                payload: { error: err.message || 'Erro ao carregar histórico' } 
            });
        }
    };

   

    useEffect(() => {
        if (purchaseId) {
        fetchPurchaseById();
        }
    }, []); 

    return {
        purchase: state.purchase,
        isLoading: state.isLoading,
        error: state.error,
        fetchPurchaseById,

    };
}