import { createContext, useContext, useReducer } from "react";
import { Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

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

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, inicialData);

    const login = async (email, password) => {
        dispatch({ type: 'LOGIN_REQUEST' });
        try {

            const response = await fetch('http://localhost:4567/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.status == 200) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: data.token } });
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: { error: data.message } });
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'Erro de conexão' } });
        }
    };
    const value = {
        state,
        dispatch,
        login,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        token: state.token,
        user: state.user,
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
            {state.isLoading &&
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={{ color: '#ffffff', marginTop: 10 }}>Carregando...</Text>
                </View>}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
