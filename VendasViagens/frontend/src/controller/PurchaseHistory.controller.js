import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function PurchaseHistoryController() {
    const { user, token, URL } = useAuth();

    const [purchases, setPurchases] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [filters, setFilters] = useState({ status: 'all', destination: 'all', period: 'all' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const userId = user?.id;

    async function fetchPurchaseHistory({ status, destination, from, to } = {}) {
        setIsLoading(true);
        setError(null);
        try {
            if (!token || !userId) throw new Error('Usuário não autenticado');

            const params = new URLSearchParams({
                userId: String(userId)
            });
            if (status) params.append('status', status);
            if (destination) params.append('destination', destination);
            if (from && to) { params.append('from', from); params.append('to', to); }

            const resp = await fetch(`${URL}/purchases?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const json = await resp.json().catch(() => ({}));
            if (!resp.ok) throw new Error(json?.message || `Erro ${resp.status}`);

            const payload = json?.data;
            if (!payload || !Array.isArray(payload.purchases)) throw new Error('Resposta inválida do servidor');

            setPurchases(payload.purchases);
            setTotalItems(payload.totalItems || 0);
            setFilters(payload.filters);
        } catch (err) {
            setError(err.message || 'Erro ao carregar histórico');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        fetchPurchaseHistory();
    };

    useEffect(() => {
        fetchPurchaseHistory();
    }, [token, userId]);

    return {
        purchases,
        totalItems,
        filters,
        isLoading,
        error,
        refreshing,
        fetchPurchaseHistory,
        onRefresh
    };
}