import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import ComponentsController from "../controller/Components.controller";
import { Snackbar, Provider as PaperProvider } from 'react-native-paper';
import { useState } from "react";
import { useNavigation } from '@react-navigation/native';
export default function SelectedComponentScreen() {
    const { travelPackage, fetchComponents, allComponents, isLoading, error, addComponentToPackage } = ComponentsController();
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const navigation = useNavigation();
    const showSnackbar = (msg) => {
        if (error) {
            msg = error;
        }
        setMessage(msg);
        setVisible(true);
    };

    const renderPackageItem = ({ item }) => {

        const itemType = item.type?.includes('flight') ? 'FLIGHT' :
            item.type?.includes('hotel') ? 'HOTEL' :
                item.type?.includes('activity') ? 'ACTIVITY' :
                    item.type?.includes('car') ? 'CAR_RENTAL' : item.type;

        return (
            <TouchableOpacity style={styles.packageCard} onPress={() => { addComponentToPackage(itemType, travelPackage.id, item);
             showSnackbar('Componente adicionado ao pacote!')
             navigation.navigate('AdicionarComponentes', { travelPackage: travelPackage });
             }}>
                <View style={styles.cardImagePlaceholder}>
                    <Text style={styles.cardImageText}>
                        {itemType === 'FLIGHT' ? '✈️' :
                            itemType === 'HOTEL' ? '🏨' :
                                itemType === 'ACTIVITY' ? '🎯' : '🚗'}
                    </Text>
                </View>

                <View style={styles.cardContent}>

                    <Text style={styles.packageTitle}>
                        {item.airline ? `${item.airline} ${item.flightNumber}` :
                            item.name || 'Sem nome'}
                    </Text>
                    <Text style={styles.packageType}>
                        {itemType === 'FLIGHT' ? 'Voo' :
                            itemType === 'HOTEL' ? 'Hotel' :
                                itemType === 'ACTIVITY' ? 'Atividade' : 'Aluguel de Carro'}
                    </Text>


                    {itemType === 'FLIGHT' && (
                        <>
                            <Text style={styles.packageDestination}>
                                🛫 {item.departure?.iataCode || item.origin} → 🛬 {item.arrival?.iataCode || item.destination}
                            </Text>
                            <Text style={styles.packageDates}>
                                📅 {item.departure?.at ? new Date(item.departure.at).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : 'Data não disponível'}
                            </Text>
                            <Text style={styles.packageDescription}>
                                ⏱️ Duração: {item.duration || 'N/A'} | Paradas: {item.numberOfStops || 0}
                            </Text>
                        </>
                    )}

                    {itemType === 'HOTEL' && (
                        <Text style={styles.packageDates}>
                            🏨 Check-in: {new Date(item.checkin).toLocaleDateString()}
                            {' → '}Check-out: {new Date(item.checkout).toLocaleDateString()}
                        </Text>
                    )}

                    {itemType === 'CAR_RENTAL' && (
                        <Text style={styles.packageDates}>
                            🚗 Período: {new Date(item.departureDate).toLocaleDateString()}
                            {' → '}{new Date(item.returnDate).toLocaleDateString()}
                        </Text>
                    )}


                    {itemType !== 'ACTIVITY' && (
                        <Text style={styles.packageDescription} numberOfLines={2}>
                            {item.description || 'Sem descrição'}
                        </Text>
                    )}


                    <View style={styles.priceContainer}>
                        {item.moneyPrice > 0 && (
                            <Text style={styles.packagePrice}>R$ {item.moneyPrice.toFixed(2)}</Text>
                        )}
                        {item.milesPrice > 0 && (
                            <Text style={styles.packageMiles}>{item.milesPrice.toLocaleString('pt-BR')} milhas</Text>
                        )}
                    </View>


                    {item.id && (
                        <Text style={styles.amadeusId}>ID: {item.id}</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };


    if (isLoading) {
        return (
            <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
            }}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={{ color: '#1e293b', marginTop: 10, fontSize: 16 }}>Carregando opções...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={styles.errorTitle}>Erro ao buscar componentes</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchComponents}
                >
                    <Text style={styles.retryButtonText}>🔄 Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <FlatList
            data={allComponents}
            renderItem={renderPackageItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateEmoji}>
                        {allComponents.length === 0 ? '📦' : '🔍'}
                    </Text>
                    <Text style={styles.emptyStateTitle}>
                        {allComponents.length === 0
                            ? 'Nenhum componente adicionado'
                            : 'Nenhuma opção encontrada'
                        }
                    </Text>
                    <Text style={styles.emptyStateText}>
                        {allComponents.length === 0
                            ? 'Adicione voos, hotéis ou outros componentes ao seu pacote'
                            : 'Tente ajustar os filtros da sua busca'
                        }
                    </Text>
                </View>
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={
                allComponents.length > 0 ? (
                    <View style={styles.listHeader}>
                        <Text style={styles.listHeaderTitle}>
                            {allComponents.length} opç{allComponents.length !== 1 ? 'ões' : 'ão'} disponível{allComponents.length !== 1 ? 'is' : ''}
                        </Text>
                        <View style={styles.componentsSummary}>
                            <Text style={styles.summaryText}>
                                ✈️ {allComponents.filter(item => item.type?.includes('flight')).length} voos
                            </Text>
                            <Text style={styles.summaryText}>
                                🏨 {allComponents.filter(item => item.type?.includes('hotel')).length} hotéis
                            </Text>
                            <Text style={styles.summaryText}>
                                🎯 {allComponents.filter(item => item.type?.includes('activity')).length} atividades
                            </Text>
                            <Text style={styles.summaryText}>
                                🚗 {allComponents.filter(item => item.type?.includes('car')).length} carros
                            </Text>
                        </View>
                        <Snackbar
                            visible={visible}
                            onDismiss={(() => setVisible(false))}
                            duration={3000}
                            action={{
                                label: 'Fechar',
                                onPress: (() => setVisible(false)),
                            }}
                        >
                            {message}
                        </Snackbar>
                    </View>
                    
                ) : null
            }
        />

    );
}


const styles = StyleSheet.create({

    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 20,
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
        lineHeight: 20,
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

    // Cards
    packageCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        overflow: 'hidden'
    },
    cardImagePlaceholder: {
        width: 80,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardImageText: {
        fontSize: 24,
    },
    cardContent: {
        flex: 1,
        padding: 12,
    },
    packageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4
    },
    packageType: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8,
        textTransform: 'capitalize'
    },
    packageDestination: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 8
    },
    packageDescription: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    packagePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981'
    },
    packageMiles: {
        fontSize: 14,
        color: '#f59e0b'
    },
    datesContainer: {
        marginBottom: 8
    },
    packageDates: {
        fontSize: 12,
        color: '#64748b'
    },
    amadeusId: {
        fontSize: 10,
        color: '#94a3b8',
        fontStyle: 'italic'
    },
    listContent: {
        paddingBottom: 20,
    },
    separator: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 16,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    listHeader: {
        backgroundColor: '#f8fafc',
        padding: 16,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    listHeaderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
    },
    componentsSummary: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    summaryText: {
        fontSize: 12,
        color: '#475569',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },

    packageCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        overflow: 'hidden'
    },
    cardImagePlaceholder: {
        width: 80,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardImageText: {
        fontSize: 24,
    },
    cardContent: {
        flex: 1,
        padding: 12,
    },
    packageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4
    },
    packageType: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8,
        textTransform: 'capitalize'
    },
    packageDestination: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 8
    },
    packageDescription: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    packagePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981'
    },
    packageMiles: {
        fontSize: 14,
        color: '#f59e0b'
    },
    datesContainer: {
        marginBottom: 8
    },
    packageDates: {
        fontSize: 12,
        color: '#64748b'
    },
    amadeusId: {
        fontSize: 10,
        color: '#94a3b8',
        fontStyle: 'italic'
    }
});