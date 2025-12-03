import { useState } from "react"
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import { useAuth } from "../AuthContext";
export default function UserForm({roleAgent = 'customer', onSuccess}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const { register, error } = useAuth();

     return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Criar Conta</Text>
                
                <TextInput
                    left={<TextInput.Icon icon='account' color="#6796f3ff" />}
                    label="Nome"
                    mode="outlined"
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    outlineColor="#6796f3ff"
                    activeOutlineColor="#6796f3ff"
                />
                
                <TextInput
                    left={<TextInput.Icon icon='email' color="#6796f3ff" />}
                    label="Email"
                    mode="outlined"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    outlineColor="#6796f3ff"
                    activeOutlineColor="#6796f3ff"
                />
                
                <TextInput
                    left={<TextInput.Icon icon='lock' color="#6796f3ff" />}
                    label="Senha"
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    outlineColor="#6796f3ff"
                    activeOutlineColor="#6796f3ff"
                />
                {roleAgent === 'agent' && (
                <TextInput
                    left={<TextInput.Icon icon='shield-account' color="#6796f3ff" />}
                    label="Permissão"
                    mode="outlined"
                    style={styles.input}
                    value={role}
                    onChangeText={setRole}
                    outlineColor="#6796f3ff"
                    activeOutlineColor="#6796f3ff"
                />
                )}
                <TouchableOpacity 
                    onPress={() => register(name, email, password, role)}
                    onSuccess={ onSuccess }
                    style={styles.registerButton}
                >
                    <Text style={styles.registerButtonText}>Criar Conta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: 25,
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: '#e1e5e9',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333333',
    },
    input: {
        marginVertical: 8,
        backgroundColor: '#ffffff',
    },
    registerButton: {
        backgroundColor: '#6796f3ff',
        padding: 15,
        marginTop: 20,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#6796f3ff',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    registerButtonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
});



