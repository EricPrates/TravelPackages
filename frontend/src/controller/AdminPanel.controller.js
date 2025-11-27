import { useState } from 'react';
import { useAuth } from '../AuthContext';

export default function AdminPanelController() {
    const { token, URL, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);


    async function createBasicPackage(packageData) {
        setIsLoading(true);
        setError(null);
        console.log('Creating package with data:', packageData);
        
        try {
            const response = await fetch(`${URL}/travel-packages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(packageData),
            });
            console.log('Response received:', response.status, response.ok);
            console.log(user);
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao criar pacote');
            }

            if (data.success) {
                return { success: true, data: data.data };
            } else {
                throw new Error(data.message || 'Erro ao criar pacote');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }


    async function fetchAllPackages() {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${URL}/travel-packages`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao buscar pacotes');
            }

            if (data.success) {
                return { success: true, data: data.data };
            } else {
                throw new Error(data.message || 'Erro ao buscar pacotes');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }


    async function fetchPackageById(packageId) {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${URL}/travel-packages/${packageId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao buscar pacote');
            }

            if (data.success) {
                return { success: true, data: data.data };
            } else {
                throw new Error(data.message || 'Erro ao buscar pacote');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }


    async function deletePackage(packageId) {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${URL}/travel-packages/${packageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao deletar pacote');
            }

            if (data.success) {
                return { success: true, message: data.message };
            } else {
                throw new Error(data.message || 'Erro ao deletar pacote');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }

    return {
        createBasicPackage,
        fetchAllPackages,
        fetchPackageById,
        deletePackage,
        isLoading,
        error,
        user,
    };
}
