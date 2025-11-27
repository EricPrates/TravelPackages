// ============================================
// FRONTEND - AdminPanelController.js
// ============================================

import { useReducer, useState } from 'react';
import { useAuth } from './AuthContext';

const inicialPackage = {
    title: '',
    destination: '',
    origin: '',
    departureDate: '',
    returnDate: '',
    description: '',
    numberOfTravelers: '',
    availableSlots: '',
    totalMilesPrice: '',
    totalMoneyPrice: '',
    status: '',
    images: [],
    isLoading: false,
    error: null,
};

function packageReduce(state, action) {
    switch (action.type) {
        case 'FETCH_PACKAGE_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'FETCH_PACKAGE_SUCCESS':
            return {
                ...state,
                isLoading: false,
                title: action.payload.title || '',
                destination: action.payload.destination || '',
                origin: action.payload.origin || '',
                departureDate: action.payload.departureDate || '',
                returnDate: action.payload.returnDate || '',
                description: action.payload.description || '',
                numberOfTravelers: action.payload.numberOfTravelers || '',
                availableSlots: action.payload.availableSlots || '',
                totalMilesPrice: action.payload.totalMilesPrice || '',
                totalMoneyPrice: action.payload.totalMoneyPrice || '',
                status: action.payload.status || '',
                images: action.payload.images || [],
            };
        case 'FETCH_PACKAGE_FAILURE':
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
            };
        case 'RESET_PACKAGE':
            return inicialPackage;
        default:
            return state;
    }
}

export default function AdminPanelController() {
    const { token, URL, user } = useAuth();
    const [tela, setTela] = useState('');
    
    // ✅ CORRIGIDO: Nome correto para o estado
    const [packageState, dispatch] = useReducer(packageReduce, inicialPackage);

    // ✅ CORRIGIDO: Função com nome diferente e body correto
    async function createBasicPackage(packageData) {
        dispatch({ type: 'FETCH_PACKAGE_REQUEST' });
        
        try {
            const response = await fetch(`${URL}/travel-packages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json', // ✅ ADICIONADO
                },
                body: JSON.stringify(packageData), // ✅ ADICIONADO
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar pacote');
            }

            const data = await response.json();
            
            if (data.success) {
                dispatch({ type: 'FETCH_PACKAGE_SUCCESS', payload: data.data });
                return { success: true, data: data.data };
            } else {
                throw new Error(data.message || 'Erro ao criar pacote');
            }
        } catch (error) {
            dispatch({ type: 'FETCH_PACKAGE_FAILURE', payload: { error: error.message } });
            return { success: false, error: error.message };
        }
    }

    // ✅ Função para resetar o formulário
    function resetPackage() {
        dispatch({ type: 'RESET_PACKAGE' });
    }

    return {
        packageState,
        createBasicPackage,
        resetPackage,
        tela,
        setTela,
    };
}

// ============================================
// EXEMPLO DE USO NO COMPONENTE
// ============================================

function AdminPanel() {
    const { packageState, createBasicPackage, resetPackage } = AdminPanelController();
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        origin: '',
        departureDate: '',
        returnDate: '',
        description: '',
        numberOfTravelers: 1,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const result = await createBasicPackage(formData);
        
        if (result.success) {
            alert('Pacote criado com sucesso!');
            console.log('Pacote criado:', result.data);
            // Resetar formulário
            setFormData({
                title: '',
                destination: '',
                origin: '',
                departureDate: '',
                returnDate: '',
                description: '',
                numberOfTravelers: 1,
            });
            resetPackage();
        } else {
            alert(`Erro: ${result.error}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Título do pacote"
            />
            <input
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Destino"
                required
            />
            <input
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Origem"
                required
            />
            <input
                type="date"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleChange}
                required
            />
            <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                required
            />
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descrição"
            />
            <input
                type="number"
                name="numberOfTravelers"
                value={formData.numberOfTravelers}
                onChange={handleChange}
                min="1"
                required
            />
            
            <button type="submit" disabled={packageState.isLoading}>
                {packageState.isLoading ? 'Criando...' : 'Criar Pacote'}
            </button>
            
            {packageState.error && (
                <div style={{ color: 'red' }}>Erro: {packageState.error}</div>
            )}
        </form>
    );
}

// ============================================
// BACKEND - TravelPackage.service.js
// ============================================

export const createBasePackage = async (req, res) => {
    try {
        // ✅ CORRIGIDO: Todas as variáveis extraídas do req.body
        const { 
            title, 
            destination, 
            origin, 
            departureDate, 
            returnDate, 
            description, 
            numberOfTravelers 
        } = req.body;
        
        const agentId = req.user.id;
        
        // Validações
        if (!agentId) {
            return res.status(401).json({
                success: false,
                message: "Usuário não autenticado"
            });
        }
        
        if (!destination || !origin) {
            return res.status(400).json({
                success: false,
                message: "Os campos destino e origem são obrigatórios."
            });
        }

        if (!departureDate || !returnDate) {
            return res.status(400).json({
                success: false,
                message: "As datas de partida e retorno são obrigatórias."
            });
        }

        if (new Date(returnDate) < new Date(departureDate)) {
            return res.status(400).json({
                success: false,
                message: "A data de retorno não pode ser anterior à data de partida."
            });
        }

        const validationError = validatePackageData({ 
            destination, 
            origin, 
            departureDate, 
            returnDate 
        });
        
        if (validationError) {
            return res.status(400).json(validationError);
        }

        // ✅ CORRIGIDO: numberOfTravelers agora está definido
        const travelPackage = await TravelPackage.create({
            agentId,
            title: title || `${origin} para ${destination}`,
            destination,
            origin,
            departureDate,
            returnDate,
            description: description || '',
            numberOfTravelers: numberOfTravelers || 1,
            availableSlots: numberOfTravelers || 1,
            totalMoneyPrice: 0,
            totalMilesPrice: 0,
            status: 'AVAILABLE' // ✅ CORRIGIDO: Maiúsculo conforme o ENUM
        });

        res.status(201).json({
            success: true,
            data: travelPackage
        });
    } catch (error) {
        console.error('Erro em createBasePackage:', error);
        res.status(500).json({
            success: false,
            message: "Erro ao criar pacote de viagem",
            error: error.message
        });
    }
};
