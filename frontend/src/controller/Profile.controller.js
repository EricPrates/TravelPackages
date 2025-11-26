import { useEffect, useReducer, useState } from "react";
import { useAuth } from "../AuthContext";

const inicialWallet = {
    id: null,
    userId: null,
    token: null,
    balanceCash: 0,
    balanceMiles: 0,
    isLoading: false,
    error: null,
}

function walletReducer(state, action) {
    switch (action.type) {
        case 'FETCH_WALLET_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'FETCH_WALLET_SUCCESS':
            return {
                ...state,
                isLoading: false,
                balanceCash: action.payload.balanceCash || 0,
                balanceMiles: action.payload.balanceMiles || 0,
                id: action.payload.id || null,
                userId: action.payload.userId || null,
            };
        case 'FETCH_WALLET_FAILURE':
            return {
                ...state,
                isLoading: false,
                error: action.payload,
                
            };
        default:
            return state;
    }
}
export default function ProfileController(){
    const { token, URL } = useAuth();
    const [wallet, dispatch] = useReducer(walletReducer,inicialWallet);
    const {userId} = useAuth();
    
     const fetchWalletData = async () => {
        console.log('entrei');
        
        dispatch({type:'FETCH_WALLET_REQUEST'});
        try {
            const response = await fetch(`${URL}/wallet${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch wallet data');
            }

            const data = await response.json();
            console.log(data);
            if(data.success){
                dispatch({type: 'FETCH_WALLET_SUCCESS', payload: data.data});
            } else {
                dispatch({type: 'FETCH_WALLET_FAILURE', payload: data.message});
            }
        } catch (error) {
            dispatch({type: 'FETCH_WALLET_FAILURE', payload: error});
        }
    };

    useEffect(() => {
        if (token) {
            fetchWalletData();
        }
   
}, [token]);

    return {
        error: wallet.error,
        isLoading: wallet.isLoading,
        balanceCash: wallet.balanceCash,
        balanceMiles: wallet.balanceMiles,
        id: wallet.id,
        userId: wallet.userId,
        actions: { fetchWalletData },
      };

}
