import { useEffect, useState } from "react";
import { Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { View } from "react-native";
import { TextInput } from "react-native-paper";
import { useAuth } from "../AuthContext";
import GoogleIcon from '../../assets/img/google-icon.png';
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
    const navigator = useNavigation();
    const [email, setEmail] = useState('eric@agent.com');
    const [password, setPassword] = useState('123');
    const [name, setName] = useState('');
   
    const { login, error, googleLogin, URL } = useAuth();


    return (
        <View style={styles.container}>
            <View style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 10, elevation: 5, borderWidth: 1, borderColor: '#6796f3ff' }}>
                <Text style={styles.title}>Login de acesso</Text>
                  

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
                    
                    <TouchableOpacity onPress={() => {navigator.navigate('Register')}}
                        style={{ backgroundColor: '#6796f3ff', padding: 10, margin: 10, borderRadius: 5 }}>
                        <Text style={{ color: '#fff', textAlign: 'center' }}>Registrar</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                    <TouchableOpacity style={{ padding: 10, borderWidth: 1, backgroundColor: '#f3f3f5ff', borderRadius: 5, flexDirection: 'row', alignItems: 'center' }}
                     onPress={() => {}}>
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