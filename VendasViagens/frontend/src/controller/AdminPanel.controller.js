import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminPanelController(updatePackage) {
    const { token, URL, user } = useAuth();
    const navigation = useNavigation();
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [packageData, setPackageData] = useState({
            id : updatePackage ? updatePackage.id : null,
            title: updatePackage ? updatePackage.title :    '',
            destination: updatePackage ? updatePackage.destination : '',
            origin: updatePackage ? updatePackage.origin : '',
            departureDate: updatePackage ? updatePackage.departureDate : '',
            returnDate: updatePackage ? updatePackage.returnDate : '',
            description: updatePackage ? updatePackage.description : '',
            numberOfTravelers: updatePackage ? updatePackage.numberOfTravelers : '1'
        });
    
    const updatePackageInDB = async () => {
        setIsLoading(true);
        setError(null);
        console.log('Updating package with data:', packageData);
        
        try {
            const response = await fetch(`${URL}/travel-packages/${packageData.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(packageData),
            });
            
            
            const data = await response.json();
            console.log('Response received:', response.status, response.ok);
           
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao atualizar pacote');
            }
            if (data.success) {
                return { success: true, data: data.data };
            } else {
                throw new Error(data.message || 'Erro ao atualizar pacote');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeBasicPackage = (field, value) => {
  setPackageData(prev => {

    const newData = {
      ...prev,
      [field]: value
    };
    
    if (prev.id && !newData.id) {
      newData.id = prev.id;
    }
    
    return newData;
  });
};

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

    const handleSavePackage = async () => {
        
        if (!packageData.destination || !packageData.origin) {
            setError('Destino e Origem são obrigatórios');
            return { success: false };
        }
        if (!packageData.departureDate || !packageData.returnDate) {
            setError('Datas de partida e retorno são obrigatórias');
            return { success: false };
        }
        setIsLoading(true);
        const result = await createBasicPackage({
            ...packageData,
            numberOfTravelers: parseInt(packageData.numberOfTravelers) || 1
        });
        setIsLoading(false);
        
        if (result.success) {
            handleChangeBasicPackage('id', result.data.id);
            return { success: true, data: result.data };
        } else {
            setError(result.error);
            return { success: false, error: result.error };
        }
        
    };
   
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
        deletePackage,
        error,
        setError,
        handleSavePackage,
        fetchAllPackages,
        fetchPackageById,
        isLoading,
        user,
        packageData,
        handleChangeBasicPackage,
        updatePackageInDB
    };
}
