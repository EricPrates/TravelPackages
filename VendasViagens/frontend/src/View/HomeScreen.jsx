import { FlatList, View, StyleSheet, SafeAreaView, Text, TouchableOpacity, Image } from "react-native";
import { Searchbar } from "react-native-paper";
import HomeController from "../controller/Home.controller";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
export default function HomeScreen() {
    const {
        state: { packages, isLoading, error, searchQuery },
        actions: { setSearchQuery, clearSearch, fetchPackagesData }
    } = HomeController();
    const { user } = useAuth();
    const typeUser = user.type;

    const navigation = useNavigation();

    const renderPackageItem = ({ item }) => (
        <TouchableOpacity style={styles.packageCard} onPress={() => navigation.navigate('PackageDetails', { travelPackage: item })}>
            <Image
                source={{ uri: item.images?.[0] || null }}
                style={styles.cardImage}
                defaultSource={{ uri: null }}
            />
            <View style={styles.cardContent}>
                <Text style={styles.packageTitle}>{item.title}</Text>
                <Text style={styles.packageDestination}>
                    🛫 {item.origin} → 🛬 {item.destination}
                </Text>
                <Text style={styles.packageDescription} numberOfLines={2}>
                    {item.description}
                </Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.packagePrice}>${item.totalMoneyPrice.toFixed(2)}</Text>
                    <Text style={styles.packageMiles}>{item.totalMilesPrice} milhas</Text>
                </View>
                <View style={styles.datesContainer}>
                    <Text style={styles.packageDates}>
                        📅 {new Date(item.departureDate).toLocaleDateString()} - {new Date(item.returnDate).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.footerContainer}>
                    <Text style={styles.availableSlots}>
                        ✅ {item.availableSlots} vagas de {item.numberOfTravelers}
                    </Text>
                    <Text style={[styles.status,
                    item.status?.toUpperCase() === 'AVAILABLE' ? styles.statusAvailable : styles.statusUnavailable
                    ]}>
                        {item.status?.toUpperCase() === 'AVAILABLE' ? 'Disponível' : 'Esgotado'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );


    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.loadingText}>Carregando pacotes...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Erro ao carregar pacotes</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchPackagesData}
                >
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {!typeUser === 'agent' ? (
                    <View style={styles.header}>
                        <Text style={styles.greeting}>Descubra Seu Próximo Destino! 🌎</Text>
                        <Text style={styles.subtitle}>
                            {packages.length} {packages.length === 1 ? 'pacote encontrado' : 'pacotes encontrados'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.header}>
                        <Text style={styles.greeting}>Bem Vindo Agente de Viagens ✈️</Text>
                        <Text style={styles.subtitle}>
                            Clique para ver detalhes e editar pacotes
                        </Text>
                    </View>
                )}


                <Searchbar
                    placeholder="Buscar por destino, origem, título..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />


                {searchQuery ? (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>Limpar busca</Text>
                    </TouchableOpacity>
                ) : null}


                <FlatList
                    data={packages}
                    onPress={() => { }}
                    renderItem={renderPackageItem}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateEmoji}>🔍</Text>
                            <Text style={styles.emptyStateTitle}>
                                {searchQuery ? 'Nenhum pacote encontrado' : 'Nenhum pacote disponível'}
                            </Text>
                            <Text style={styles.emptyStateText}>
                                {searchQuery
                                    ? 'Tente ajustar os termos da sua busca'
                                    : 'Volte mais tarde para novos pacotes'
                                }
                            </Text>
                            {searchQuery && (
                                <TouchableOpacity onPress={clearSearch} style={styles.emptyButton}>
                                    <Text style={styles.emptyButtonText}>Ver todos os pacotes</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 20,
    },
    loadingText: {
        fontSize: 18,
        color: '#64748b',
        fontFamily: 'System',
    },
    errorText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 8,
        fontFamily: 'System',
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'System',
    },
    retryButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'System',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 16,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
    searchBar: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    clearButton: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    clearButtonText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 20,
    },
    packageCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 200,
    },
    cardContent: {
        padding: 16,
    },
    packageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    packageDestination: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    packageDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    packagePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10b981',
    },
    packageMiles: {
        fontSize: 14,
        color: '#f59e0b',
        fontWeight: '600',
    },
    datesContainer: {
        marginBottom: 12,
    },
    packageDates: {
        fontSize: 12,
        color: '#64748b',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availableSlots: {
        fontSize: 12,
        color: '#64748b',
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusAvailable: {
        backgroundColor: '#dcfce7',
        color: '#166534',
    },
    statusUnavailable: {
        backgroundColor: '#fecaca',
        color: '#dc2626',
    },
    separator: {
        height: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyStateEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
    },
    emptyButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});