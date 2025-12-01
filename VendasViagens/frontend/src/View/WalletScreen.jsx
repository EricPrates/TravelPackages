import { Text, View, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../AuthContext";
import WalletScreenController from "../controller/WalletScreen.controller";
import { TextInput } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
export default function Carteira() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const {
        error,
        isLoading,
        balanceCash,
        balanceMiles,
        id,
        userId,
        amount,
        setAmount,
        handleDeposit,
        fetchWalletData,
    } = WalletScreenController();


    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loadingText}>Carregando dados...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <View style={styles.errorIcon}>
                        <Text style={styles.errorIconText}>⚠️</Text>
                    </View>
                    <Text style={styles.errorTitle}>Erro ao carregar</Text>
                    <Text style={styles.errorMessage}>{error.message}</Text>
                    <TouchableOpacity onPress={fetchWalletData} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.welcomeText}>
                        {user ? `Olá, ${user.name}!` : "Viajante"}
                    </Text>
                    <Text style={styles.subtitle}>Gerencie sua conta e visualize seus saldos</Text>
                </View>


                <View style={styles.balancesContainer}>

                    <View style={[styles.balanceCard, styles.cashCard]}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardIcon}>💵</Text>
                            <Text style={styles.cardTitle}>Saldo em Dinheiro</Text>
                        </View>
                        <Text style={styles.balanceAmount}>${balanceCash}</Text>
                        <Text style={styles.balanceLabel}>Disponível para uso</Text>
                    </View>


                    <View style={[styles.balanceCard, styles.milesCard]}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardIcon}>✈️</Text>
                            <Text style={styles.cardTitle}>Saldo em Milhas</Text>
                        </View>
                        <Text style={styles.balanceAmount}>{balanceMiles}</Text>
                        <Text style={styles.balanceLabel}>Milhas acumuladas</Text>
                    </View>
                    
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Extrato')} style={styles.refreshButton}>
                        <Text style={styles.refreshButtonText}>Verificar Extrato</Text>
                    </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeposit(amount)} style={styles.refreshButton}>
                    <Text style={styles.refreshButtonText}>Realizar Depósito</Text>
                </TouchableOpacity>
                <TextInput value={amount} onChangeText={setAmount} placeholder="Valor do Depósito em Dinheiro" keyboardType="numeric" style={styles.inputDeposit} />

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    inputDeposit: {
        backgroundColor: '#ffffffff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#162be2ff',
        width: 250,
        alignSelf: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
        fontFamily: 'System',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8fafc',
    },
    errorIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    errorIconText: {
        fontSize: 32,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 8,
        fontFamily: 'System',
    },
    errorMessage: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'System',
    },
    retryButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'System',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        fontFamily: 'System',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        fontFamily: 'System',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        fontFamily: 'System',
    },
    balancesContainer: {
        marginBottom: 32,
    },
    balanceCard: {
        padding: 24,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    cashCard: {
        backgroundColor: '#ffffff',
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    milesCard: {
        backgroundColor: '#ffffff',
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        fontFamily: 'System',
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
        fontFamily: 'System',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#94a3b8',
        fontFamily: 'System',
    },
    infoContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        fontFamily: 'System',
    },
    infoValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
        fontFamily: 'System',
    },
    separator: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 4,
    },
    refreshButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20,
    },
    refreshButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'System',
    },
});