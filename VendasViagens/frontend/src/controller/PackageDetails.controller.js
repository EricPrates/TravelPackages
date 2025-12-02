import { useState, useEffect } from 'react';
import { Alert } from 'react-native'; 
import { useNavigation } from '@react-navigation/native'; 
import { useAuth } from '../AuthContext';

export default function PackageDetailsController(travelPackage) { 
  const { user, token, URL } = useAuth();
  const navigation = useNavigation();  
  
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState(null);
  const [mixedError, setMixedError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [milesAmount, setMilesAmount] = useState('');
  const [milesRequired, setMilesRequired] = useState(0);

  const { id, totalMoneyPrice, totalMilesPrice } = travelPackage;  
  const userId = user?.id;
  const totalMoney = Number(totalMoneyPrice);
  const totalMiles = Number(totalMilesPrice);
  const packageId = id;
  const verifyMilesRequired = () => {
  const cash = parseFloat(cashAmount) || 0;
  
  if (cash >= totalMoney) {
    setMilesRequired(0);
    return;
  }
  

  const remainingMoney = totalMoney - cash;

  const conversionRate = totalMiles / totalMoney;  
  
  const remainingMiles = remainingMoney * conversionRate;
  
  setMilesRequired(Math.ceil(remainingMiles));
};
    useEffect(() => {
  verifyMilesRequired();
}, [cashAmount]);

const handleDelete = async () => {
    try {
        setIsLoading(true);
   
        
        const res = await fetch(`${URL}/travel-packages/${packageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

    

        let data = null;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
         
        }

        if (!res.ok) {
            throw new Error(data?.message || 'Falha ao deletar o pacote.');
        }

        Alert.alert('Sucesso', data?.message || 'Pacote deletado com sucesso!');
        navigation.navigate('Home');
    } catch (err) {
        console.error('Erro ao deletar:', err);
        Alert.alert('Erro', err.message || 'Falha ao deletar o pacote.');
    } finally {
        setIsLoading(false);
    }
};



  const validateMixed = () => {
    const cash = parseFloat(cashAmount) || 0;
    const miles = Math.floor(parseFloat(milesAmount) || 0);

    if (cash <= 0 && miles <= 0) {
      return 'Informe um valor em dinheiro ou milhas para a compra mista.';
    }
    if (cash > totalMoney) {
      return `O valor em dinheiro não pode exceder R$ ${totalMoney.toFixed(2)}.`;
    }
    if (miles > totalMiles) {
      return `O valor em milhas não pode exceder ${totalMiles.toLocaleString()}.`;
    }
    return '';
  };

  const handleMixedInputsChange = (setter, value) => {
    setter(value);
    setMixedError(validateMixed());
  };

  const handlePurchase = async (type) => {
    try {
      if (type === 'mixed') {
        const err = validateMixed();
        if (err) {
          setMixedError(err);
          Alert.alert('Erro', err);
          return;
        }
      }

      setIsLoading(true);
      let response;

      if (type === 'cash') {
        response = await purchasePackageWithMoney({ packageId: id, quantity: 1 });
      } else if (type === 'miles') {
        response = await purchasePackageWithMiles({ packageId: id, quantity: 1 });
      } else {
        const cash = parseFloat(cashAmount) || 0;
        const miles = Math.floor(parseFloat(milesAmount) || 0);
        response = await purchasePackageMixed({ packageId: id, quantity: 1, cashAmount: cash, milesAmount: miles });
      }

      Alert.alert('Sucesso', response?.message || 'Compra realizada com sucesso!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha na compra');
    } finally {
      setIsLoading(false);
    }
  };

 

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
        paymentChoice,
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
    // Estados
    mixedError,
    cashAmount,
    milesAmount,
    isLoading,
    isLoadingHistory,
    errorHistory,
    milesRequired,
    
    // Setters
    setMixedError,
    setCashAmount,
    setMilesAmount,
    setMilesRequired,
    
    // Funções
    validateMixed,
    handleMixedInputsChange,
    handlePurchase,
    verifyType,
    getStatusColor,
    getTypeColor,
    purchasePackageWithMoney,
    purchasePackageWithMiles,
    purchasePackageMixed,
    verifyMilesRequired,
    handleDelete,
  };
}
