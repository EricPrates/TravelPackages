import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Snackbar } from 'react-native-paper';
import PurchaseHistoryController from '../controller/PurchaseHistory.controller';
import { useNavigation } from '@react-navigation/native';
export default function PurchaseHistoryScreen() {
    const { purchases, totalItems, filters, isLoading, error, refreshing, onRefresh } = PurchaseHistoryController();
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const navigation = useNavigation();

    const showSnackbar = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': case 'confirmado': return '#10b981';
            case 'pending': case 'pendente': return '#f59e0b';
            case 'cancelled': case 'cancelado': return '#ef4444';
            default: return '#64748b';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'Confirmado';
            case 'pending': return 'Pendente';
            case 'cancelled': return 'Cancelado';
            default: return status || 'Desconhecido';
        }
    };

    const renderPurchaseItem = ({ item }) => {
        const purchaseDate = new Date(item.purchaseDate);
        return (
            <TouchableOpacity style={styles.purchaseCard} onPress={() => navigation.navigate('PurchaseDetails', { purchaseId: item.id })}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.purchaseId}>Compra #{item.id}</Text>
                        <Text style={styles.purchaseDate}>
                            📅 {purchaseDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardContent}>
                    <Text style={styles.packageName}>
                        📦 {item.travelPackage?.title || 'Pacote de Viagem'}
                    </Text>
                    {item.travelPackage?.destination && (
                        <Text style={styles.destination}>📍 {item.travelPackage.destination}</Text>
                    )}
                    <View style={styles.priceContainer}>
                        <Text style={styles.totalPrice}>💰 R$ {Number(item.paidInMoney || 0).toFixed(2)}</Text>
                        <Text style={styles.totalMiles}>✈️ {Number(item.paidInMiles || 0).toLocaleString('pt-BR')} milhas</Text>
                        
                    </View>
                   
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Carregando histórico...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={styles.errorTitle}>Erro ao carregar histórico</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                    <Text style={styles.retryButtonText}>🔄 Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={purchases}
                renderItem={renderPurchaseItem}
                keyExtractor={(item) => item.id?.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#6366f1']}
                        tintColor="#6366f1"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateEmoji}>🛍️</Text>
                        <Text style={styles.emptyStateTitle}>Nenhuma compra realizada</Text>
                        <Text style={styles.emptyStateText}>Suas compras aparecerão aqui</Text>
                    </View>
                }
                ListHeaderComponent={
                    purchases?.length > 0 ? (
                        <View style={styles.listHeader}>
                            <Text style={styles.listHeaderTitle}>
                                📋 {totalItems} {totalItems === 1 ? 'compra' : 'compras'}
                            </Text>
                            {filters?.status && filters.status !== 'all' && (
                                <Text style={{ color: '#64748b' }}>Filtro status: {filters.status}</Text>
                            )}
                            {filters?.destination && filters.destination !== 'all' && (
                                <Text style={{ color: '#64748b' }}>Destino: {filters.destination}</Text>
                            )}
                        </View>
                    ) : null
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{ label: 'Fechar', onPress: () => setSnackbarVisible(false) }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    errorEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 12,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    retryButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    listHeader: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    listHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    purchaseCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: '#f8fafc',
    },
    purchaseId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    purchaseDate: {
        fontSize: 12,
        color: '#64748b',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    cardContent: {
        padding: 16,
    },
    packageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    destination: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 8,
    },
    componentsRow: {
        marginBottom: 12,
    },
    componentsText: {
        fontSize: 13,
        color: '#64748b',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10b981',
    },
    totalMiles: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f59e0b',
    },
    separator: {
        height: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyStateEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
});