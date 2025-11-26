import { Text, View } from "react-native";
import { useAuth } from "../AuthContext";
import ProfileController from "../controller/Profile.controller";
export default function ProfileScreen() {
    const { user } = useAuth();
    const {
        error,
        isLoading,
        balanceCash,
        balanceMiles,
        id,
        userId,
        actions: { refetchWallet },
    } = ProfileController();
    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }
        if (error) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Error: {error.message}</Text>
                <TouchableOpacity onPress={refetchWallet} style={{ marginTop: 10, padding: 10, backgroundColor: '#6796f3ff', borderRadius: 5 }}>
                    <Text style={{ color: '#fff' }}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }
        
        return (

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>{user ? `Bem vindo, ${user.name}` : "Sem usuário logado"}</Text>
            <Text>Saldo em dinheiro: ${balanceCash}</Text>
            <Text>Saldo em milhas: {balanceMiles} miles</Text>
        </View>
    );
}