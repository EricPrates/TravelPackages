import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function DashboardController() {
    const { token, URL } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('30'); // 30, 90, 365 dias

    const fetchDashboard = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Calcular datas
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(period));

            const from = startDate.toISOString().split('T')[0];
            const to = endDate.toISOString().split('T')[0];

            const response = await fetch(`${URL}/dashboard?from=${from}&to=${to}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao buscar dashboard');
            }

            if (data.success) {
                setDashboardData(data.data);
            } else {
                throw new Error(data.message || 'Erro ao buscar dashboard');
            }
        } catch (err) {
            console.error('Erro ao buscar dashboard:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [period]);

    return {
        dashboardData,
        isLoading,
        error,
        period,
        setPeriod,
        fetchDashboard
    };
}
