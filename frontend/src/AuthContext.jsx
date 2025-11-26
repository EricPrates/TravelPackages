import { createContext, useContext, useEffect, useReducer } from "react";
import { Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Linking, Alert, Platform } from 'react-native';




const AuthContext = createContext();

const inicialData = {
    user: null,
    token: null,
    error: null,
    isAuthenticated: false,
    isLoading: false,
};
function authReducer(state, action) {
    switch (action.type) {
        case 'LOGIN_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                error: action.payload.error,
                isAuthenticated: false,
                isLoading: false,

            };
        case 'LOGOUT':
            return {
                ...inicialData
            };
        default:
            return state;
    }
}

//URL do servidor online
const URL = 'https://vendasviagens-backend.onrender.com';

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, inicialData);

    const login = async (email, password) => {
        dispatch({ type: 'LOGIN_REQUEST' });
        try {

            const response = await fetch(`${URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: data.token } });
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: { error: data.message } });
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'Erro de conexão' } });
        }
    };
    const register = async (name, email, password) => {
        dispatch({ type: 'LOGIN_REQUEST' });
        try {
            const response = await fetch(`${URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: data.token } });
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: { error: data.message } });
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'Erro de conexão' } });
        }
    };
   const getGoogleAuthUrl = async () => {
    try {
        console.log(`📍 1. Fui buscar a url em ${URL}/auth/google/url`);

        console.log('📍 2. Antes do fetch...');
        const response = await fetch(`${URL}/auth/google/url`);
        console.log(`📍 3. Resposta recebida - Status: ${response.status}`);
        console.log(`📍 4. Response ok: ${response.ok}`);

        if (!response.ok) {
            console.log('❌ 5. Response NÃO é OK - lançando erro');
            throw new Error('Failed to get Google auth URL');
        }

        console.log('📍 6. Response é OK - convertendo para JSON...');
        const data = await response.json();
        console.log('📍 7. JSON convertido:', data);

        console.log('📍 8. Verificando data.data.authUrl...');
        if (!data.data || !data.data.authUrl) {
            console.log('❌ 9. authUrl não encontrada em data.data');
            throw new Error('authUrl não encontrada na resposta');
        }

        console.log(`✅ 10. URL obtida com sucesso: ${data.data.authUrl}`);
        return data.data.authUrl;

    } catch (error) {
        console.log(`💥 11. ERRO CAPTURADO: ${error.message}`);
        console.log('💥 12. Stack:', error.stack);
        dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'Erro de conexão' } });
        throw error;
    }
}
    const handleGoogleCallback = async (code) => {
        dispatch({ type: 'LOGIN_REQUEST' });
        try {
            const response = await fetch(`${URL}/auth/google/callback?code=${code}`);
            const data = await response.json();
            if (data.success) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.data.user, token: data.data.accessToken } });
                return data.data;
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: { error: data.message } });
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'Erro de conexão' } });
        }
    };
    const googleLogin = async () => {
        console.log('entrei');

        dispatch({ type: 'LOGIN_REQUEST' });
        try {
            console.log('login requerido com o google');

            const authUrl = await getGoogleAuthUrl();

            const supported = await Linking.canOpenURL(authUrl);
            if (supported) {
                await Linking.openURL(authUrl);
                console.log("navegador aberto");
                
            } else {
                Alert.alert('Não foi possível abrir o navegador');
            }
        } catch (error) {
            console.log('Erro:', error);
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: error.message } });
        }
    };
  
useEffect(() => {
    const handleDeepLink = (event) => {
        const url = event.url;
        console.log('🔗 Deep link recebido:', url);
        
  
        if (url.includes('exp://') || url.includes('exps://')) {
            console.log('📍 Ignorando URL do Expo');
            return;
        }
        
   
        if (url.startsWith('minhaapp://')) {
            try {
                // Extrai parâmetros manualmente (URL não funciona no React Native)
                const params = extractParamsFromUrl(url);
                const code = params.code;
                const error = params.error;
                
                console.log('📝 Parâmetros - code:', code, 'error:', error);
                
                if (code) {
                    console.log('✅ Processando código do Google...');
                    handleGoogleCallback(code);
                } else if (error) {
                    console.log('❌ Erro do Google:', error);
                    Alert.alert('Erro', 'Falha na autenticação com Google');
                }
            } catch (parseError) {
                console.log('💥 Erro ao processar URL:', parseError);
            }
        }
    };

    // Função para extrair parâmetros manualmente
    const extractParamsFromUrl = (url) => {
        const params = {};
        const queryString = url.split('?')[1];
        if (queryString) {
            const pairs = queryString.split('&');
            pairs.forEach(pair => {
                const [key, value] = pair.split('=');
                params[key] = decodeURIComponent(value || '');
            });
        }
        return params;
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    Linking.getInitialURL().then(url => {
        if (url) {
            console.log('🔗 App aberto via URL:', url);
            handleDeepLink({ url });
        }
    });

    return () => subscription.remove();
}, []);
const value = {
    state,
    dispatch,
    login,
    register,
    logout: () => dispatch({ type: 'LOGOUT' }),
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    token: state.token,
    user: state.user,
    URL,
    googleLogin,
}
return (
    <AuthContext.Provider value={value}>
        {children}
        {state.isLoading &&
            <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
            }}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ color: '#ffffff', marginTop: 10 }}>Carregando...</Text>
            </View>}
    </AuthContext.Provider>
);
};

export const useAuth = () => useContext(AuthContext);
