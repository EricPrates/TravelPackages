import { createContext, useContext, useEffect, useReducer } from "react";
import { Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Linking, Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

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

const URL = 'http://44.219.93.219:4567';

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
                console.log(data.data.token.accessToken);
                
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.data.user, token: data.data.token.accessToken } });
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: { error: data.message } });
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'Erro de conexão' } });
        }
    };

    const register = async (name, email, password) => {
        console.log('chamado');
        
        dispatch({ type: 'LOGIN_REQUEST' });
        try {
            const response = await fetch(`${URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.data.user, token: data.data.token.accessToken } });
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: { error: data.message } });
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'Erro de conexão' } });
        }
    };

   /* const getGoogleAuthUrl = async () => {
       
        try {
            const response = await fetch(`${URL}/auth/google/url`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const data = await response.json();
            if (data.success && data.data && data.data.authUrl) {
                return data.data.authUrl;
            } else {
                throw new Error('URL de autenticação não encontrada');
            }
        } catch (error) {
            console.error('Erro ao buscar URL do Google:', error);
            Alert.alert('Erro', 'Não foi possível iniciar o login com Google');
            throw error;
        }
    };

    const googleLogin = async () => {
        Alert.alert(
            'Login com Google',
            'O login com Google requer um build standalone do app. No Expo Go, use login com email e senha.\n\nPara habilitar Google OAuth, você precisa fazer:\n\n1. eas build\n2. Instalar o APK/IPA gerado\n3. O deep link minhaapp:// vai funcionar perfeitamente',
            [{ text: 'Entendi' }]
        );
    };
    
    const extractParamsFromUrl = (url) => {
        const params = {};
        const queryString = url.split('?')[1];
        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                params[key] = decodeURIComponent(value);
            });
        }
        return params;
    };



    useEffect(() => {
        const handleDeepLink = (event) => {
            const url = event.url;
            console.log('🔗 Deep link recebido:', url);
            
            if (url.includes('minhaapp://auth')) {
                const params = extractParamsFromUrl(url);
                console.log('🔗 Parâmetros:', params);
                
                if (params.token && params.userId) {
                    console.log('✅ Login bem-sucedido via Google!');
                    // Login bem-sucedido
                    dispatch({ 
                        type: 'LOGIN_SUCCESS', 
                        payload: { 
                            user: { id: params.userId },
                            token: params.token 
                        } 
                    });
                } else if (params.error) {
                    console.log('❌ Erro no callback:', params.error);
                    Alert.alert('Erro', 'Falha na autenticação com Google');
                    dispatch({ type: 'LOGIN_FAILURE', payload: { error: params.error } });
                }
            }
        };

        const extractParamsFromUrl = (url) => {
            const params = {};
            const queryString = url.split('?')[1];
            if (queryString) {
                queryString.split('&').forEach(param => {
                    const [key, value] = param.split('=');
                    params[key] = decodeURIComponent(value);
                });
            }
            return params;
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        
        Linking.getInitialURL().then(url => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);
*/
    const logout = async () => {
        try {
            // Chamar endpoint de logout no backend
            if (state.token) {
                await fetch(`${URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${state.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refreshToken: state.refreshToken // Se você armazenar o refresh token
                    })
                });
            }
        } catch (error) {
            console.error('Erro ao fazer logout no backend:', error);
            // Continua com logout local mesmo se o backend falhar
        } finally {
            // Limpar estado local
            dispatch({ type: 'LOGOUT' });
        }
    };

    const value = {
        state,
        dispatch,
        login,
        register,
        logout,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        token: state.token,
        user: state.user,
        URL,
      
    };

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
