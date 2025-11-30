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
        case 'DEPOSIT_CASH_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'DEPOSIT_CASH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                balanceCash: action.payload.newBalance,
            };
        case 'DEPOSIT_CASH_FAILURE':
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };
        default:
            return state;
    }
}
export default function WalletScreenController() {
    const { token, URL, user } = useAuth();
    const [wallet, dispatch] = useReducer(walletReducer, inicialWallet);
    const userId = user?.id;
    const [error, setError] = useState(null);
    const [amount, setAmount] = useState(0);
    const fetchWalletData = async () => {
        dispatch({ type: 'FETCH_WALLET_REQUEST' });
        try {
            const response = await fetch(`${URL}/wallet/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch wallet data');
            }

            const data = await response.json();
            if (data.success) {
                dispatch({ type: 'FETCH_WALLET_SUCCESS', payload: data.data });
            } else {
                dispatch({ type: 'FETCH_WALLET_FAILURE', payload: data.message });
            }
        } catch (error) {
            dispatch({ type: 'FETCH_WALLET_FAILURE', payload: error });
        }
    };

    useEffect(() => {
        fetchWalletData();

    }, []);

    const depositCash = async (amount) => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setLocalError('Por favor, insira um valor válido');
            return;
        }

        dispatch({ type: 'DEPOSIT_CASH_REQUEST' });
        try {
            const response = await fetch(`${URL}/wallet/add-funds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount }),

            });
            setAmount('');
            setError(null);
             fetchWalletData();
            if (!response.ok) {
                throw new Error('Falha em depositar dinheiro');
            }
            const data = await response.json();
            if (data.success) {
                dispatch({ type: 'DEPOSIT_CASH_SUCCESS', payload: { newBalance: data.newBalance } });
            } else {
                dispatch({ type: 'DEPOSIT_CASH_FAILURE', payload: data.message });
            }
        } catch (error) {
            dispatch({ type: 'DEPOSIT_CASH_FAILURE', payload: error.message });
        }
       
    };
    const handleDeposit = () => {
        depositCash(amount);
    };
    return {
        error: wallet.error,
        isLoading: wallet.isLoading,
        balanceCash: wallet.balanceCash,
        balanceMiles: wallet.balanceMiles,
        id: wallet.id,
        userId: wallet.userId,
        fetchWalletData,
        setAmount,
        handleDeposit,
    };

}
