import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function PurchaseHistoryController() {
    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { user, token, URL } = useAuth();

    const userId = user?.id;

    const fetchPurchaseHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!token || !userId) {
                throw new Error('Usuário não autenticado');
            }

            const response = await fetch(`${URL}/purchases/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

       
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Resposta da API:', data); 
            
          
            if (data.success && data.data) {
                setPurchases(data.data);
            } else if (Array.isArray(data)) {
            
                setPurchases(data);
            } else {
                throw new Error(data.message || 'Estrutura de dados inválida');
            }
        } catch (err) {
            console.error('Erro ao buscar histórico:', err);
            setError(err.message || 'Erro ao carregar histórico');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPurchaseHistory();
    };

    useEffect(() => {
        fetchPurchaseHistory();
    }, [token, userId]); 

    return {
        purchases,
        isLoading,
        error,
        refreshing,
        fetchPurchaseHistory,
        onRefresh
    };
}