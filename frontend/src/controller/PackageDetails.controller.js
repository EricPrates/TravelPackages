
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';


export default function PackageDetailsController() {
    const { user, token, URL } = useAuth();


    const [purchases, setPurchases] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
    const [filters, setFilters] = useState({ status: 'all', destination: 'all', period: 'all' });
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [errorHistory, setErrorHistory] = useState(null);

    const userId = user?.id;

    async function fetchPurchaseHistory({ page = 1, limit = 10, status, destination, from, to } = {}) {
        setIsLoadingHistory(true);
        setErrorHistory(null);
        try {
            if (!token || !userId) throw new Error('Usuário não autenticado');

            const params = new URLSearchParams({
                userId: String(userId),
                page: String(page),
                limit: String(limit),
            });
            if (status) params.append('status', status);
            if (destination) params.append('destination', destination);
            if (from && to) {
                params.append('from', from);
                params.append('to', to);
            }

            const response = await fetch(`${URL}/purchases?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || `Erro ${response.status}`);
            }

            const data = await response.json();
         
            if (!payload || !Array.isArray(payload.purchases)) {
                throw new Error('Resposta inválida do servidor.');
            }

            setPurchases(payload);
            setPagination(payload);
            setFilters(payload.filters);
        } catch (err) {
            setErrorHistory(err.message || 'Erro ao carregar histórico');
        } finally {
            setIsLoadingHistory(false);
        }
    }

    useEffect(() => {
        // carrega primeira página do histórico
        fetchPurchaseHistory({ page: 1, limit: 10 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, userId]);

    // Helpers da tela de detalhes
    const verifyType = (item) => {
        if (item.type === 'FLIGHT') return '✈️ Voo';
        if (item.type === 'HOTEL') return '🏨 Hotel';
        if (item.type === 'CAR_RENTAL') return '🚗 Aluguel de Carro';
        if (item.type === 'ACTIVITY') return '🎯 Atividade';
        return item.type;
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'AVAILABLE': return '#10B981';
            case 'CONFIRMED': return '#3B82F6';
            case 'CANCELLED': return '#EF4444';
            case 'PENDING': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'FLIGHT': return '#3B82F6';
            case 'HOTEL': return '#8B5CF6';
            case 'CAR_RENTAL': return '#F59E0B';
            case 'ACTIVITY': return '#10B981';
            default: return '#6B7280';
        }
    };

    // Requisição de compra
    const purchaseRequest = async ({ packageId, quantity = 1, paymentChoice, cashAmount = 0, milesAmount = 0 }) => {
        const endpoint = `${URL}/purchases`;
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                packageId,
                quantity,
                paymentChoice, // 'cash' | 'miles' | 'mixed'
                cashAmount,
                milesAmount,
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Falha na compra.');
        return data;
    };

    const purchasePackageWithMoney = async ({ packageId, quantity = 1 }) =>
        purchaseRequest({ packageId, quantity, paymentChoice: 'cash' });

    const purchasePackageWithMiles = async ({ packageId, quantity = 1 }) =>
        purchaseRequest({ packageId, quantity, paymentChoice: 'miles' });

    const purchasePackageMixed = async ({ packageId, quantity = 1, cashAmount = 0, milesAmount = 0 }) =>
        purchaseRequest({ packageId, quantity, paymentChoice: 'mixed', cashAmount, milesAmount });

    return {
    
        purchases,
        pagination,
        filters,
        isLoadingHistory,
        errorHistory,
        fetchPurchaseHistory,

        verifyType,
        getStatusColor,
        getTypeColor,
     
        purchasePackageWithMoney,
        purchasePackageWithMiles,
        purchasePackageMixed,
    };
}
