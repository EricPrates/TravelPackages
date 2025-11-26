import { useState } from "react";
import { Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { View } from "react-native";
import { TextInput } from "react-native-paper";
import { useAuth } from "../AuthContext";
import GoogleIcon from '../../assets/img/google-icon.png';
import * as AuthSession from 'expo-auth-session';
export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [testingConnection, setTestingConnection] = useState(false);
    const { login, error, googleLogin, URL } = useAuth();

    // Função para testar a conexão com o servidor
    const testServerConnection = async () => {
        setTestingConnection(true);
        try {
            const response = await fetch(`${URL}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const text = await response.text();
                Alert.alert(
                    '✅ Conexão Bem-sucedida',
                    `Servidor respondendo normalmente!\n${text}`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    '⚠️ Servidor com Problemas',
                    `Status: ${response.status}\nErro na comunicação com o servidor`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            Alert.alert(
                '❌ Falha na Conexão',
                `Não foi possível conectar ao servidor:\n${error.message}`,
                [{ text: 'OK' }]
            );
        } finally {
            setTestingConnection(false);
        }
    };

 const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: '722748073420-92sa43m47s09rtpkomrojpkvnv391v99.apps.googleusercontent.com',
        scopes: ['openid', 'profile', 'email'],
        redirectUri: AuthSession.makeRedirectUri({
            useProxy: true
        }),
    });

    // Lidar com a resposta do Google
    React.useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log('✅ LOGIN GOOGLE SUCESSO:', authentication);
            
            // Enviar token para seu backend
            handleGoogleLogin(authentication.accessToken);
        }
    }, [response]);

    const handleGoogleLogin = async (accessToken) => {
        try {
            const backendResponse = await fetch('https://vendasviagens-backend.onrender.com/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accessToken: accessToken
                })
            });

            if (backendResponse.ok) {
                const userData = await backendResponse.json();
                console.log('✅ USUÁRIO LOGADO:', userData);
            } else {
                console.log('❌ ERRO BACKEND');
            }
        } catch (error) {
            console.log('💥 ERRO:', error);
        }
    };

 
    const handleGooglePress = () => {
        promptAsync();
    };

    return (
        <View style={styles.container}>
            <View style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 10, elevation: 5, borderWidth: 1, borderColor: '#6796f3ff' }}>
                <Text style={styles.title}>Login de acesso</Text>
       
                {/* Botão para testar conexão */}
                <TouchableOpacity 
                    onPress={testServerConnection}
                    disabled={testingConnection}
                    style={{ 
                        backgroundColor: testingConnection ? '#cccccc' : '#28a745',
                        padding: 10, 
                        margin: 10, 
                        borderRadius: 5,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                        {testingConnection ? '🔄 Testando Conexão...' : '🌐 Testar Conexão com Servidor'}
                    </Text>
                </TouchableOpacity>

                <View>
                    <TextInput
                        left={<TextInput.Icon icon='email' color="#6796f3ff" />}
                        label="Email"
                        mode="outlined"
                        icon="email"
                        style={{ margin: 10 }}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                    <TextInput
                        left={<TextInput.Icon icon='lock' color="#6796f3ff" />}
                        label="Password"
                        mode="outlined"
                        icon="lock"
                        style={{ margin: 10 }}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    {error && <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>}
                    <TouchableOpacity onPress={() => login(email, password)}
                        style={{ backgroundColor: '#6796f3ff', padding: 10, margin: 10, borderRadius: 5 }}>
                        <Text style={{ color: '#fff', textAlign: 'center' }}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {}}
                        style={{ backgroundColor: '#6796f3ff', padding: 10, margin: 10, borderRadius: 5 }}>
                        <Text style={{ color: '#fff', textAlign: 'center' }}>Registrar</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                    <TouchableOpacity style={{ padding: 10, borderWidth: 1, backgroundColor: '#f3f3f5ff', borderRadius: 5, flexDirection: 'row', alignItems: 'center' }}
                     onPress={handleGooglePress} disabled={!request}>
                        <Image source={GoogleIcon} style={{ width: 24, height: 24 }} />
                        <Text style={{ color: '#1b1918ff', textAlign: 'center', marginLeft: 10 }}>Faça login com o google</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
});