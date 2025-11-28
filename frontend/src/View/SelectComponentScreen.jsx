import { useNavigation, useRoute } from "@react-navigation/native";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useAuth } from "../AuthContext";

import ComponentsController from "../controller/Components.controller";
export default function SelectedComponentScreen() {
    const { travelPackage, type, fetchComponents, allComponents, isLoading } = ComponentsController();

    const renderPackageItem = ({ item }) => (
        <TouchableOpacity style={styles.packageCard}>
            <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardImageText}>
                    {item.type === 'FLIGHT' ? '✈️' :
                        item.type === 'HOTEL' ? '🏨' :
                            item.type === 'ACTIVITY' ? '🎯' : '🚗'}
                </Text>
            </View>

            <View style={styles.cardContent}>
                {/* Nome e Tipo */}
                <Text style={styles.packageTitle}>{item.name}</Text>
                <Text style={styles.packageType}>
                    {item.type === 'FLIGHT' ? 'Voo' :
                        item.type === 'HOTEL' ? 'Hotel' :
                            item.type === 'ACTIVITY' ? 'Atividade' : 'Aluguel de Carro'}
                </Text>

                {/* Informações específicas por tipo */}
                {item.type === 'FLIGHT' && (
                    <Text style={styles.packageDestination}>
                        🛫 {item.origin} → 🛬 {item.destination}
                    </Text>
                )}

                {item.type === 'HOTEL' && (
                    <Text style={styles.packageDates}>
                        🏨 Check-in: {new Date(item.checkin).toLocaleDateString()}
                        {' → '}Check-out: {new Date(item.checkout).toLocaleDateString()}
                    </Text>
                )}

                {item.type === 'CAR_RENTAL' && (
                    <Text style={styles.packageDates}>
                        🚗 Período: {new Date(item.departureDate).toLocaleDateString()}
                        {' → '}{new Date(item.returnDate).toLocaleDateString()}
                    </Text>
                )}

                {/* Descrição */}
                <Text style={styles.packageDescription} numberOfLines={2}>
                    {item.description || 'Sem descrição'}
                </Text>

                {/* Preços */}
                <View style={styles.priceContainer}>
                    {item.moneyPrice > 0 && (
                        <Text style={styles.packagePrice}>R$ {item.moneyPrice.toFixed(2)}</Text>
                    )}
                    {item.milesPrice > 0 && (
                        <Text style={styles.packageMiles}>{item.milesPrice} milhas</Text>
                    )}
                </View>

                {/* Datas para voos e atividades */}
                {(item.type === 'FLIGHT' || item.type === 'ACTIVITY') && item.departureDate && (
                    <View style={styles.datesContainer}>
                        <Text style={styles.packageDates}>
                            📅 {new Date(item.departureDate).toLocaleDateString()}
                            {item.returnDate && ` - ${new Date(item.returnDate).toLocaleDateString()}`}
                        </Text>
                    </View>
                )}

                {/* ID da Amadeus (se existir) */}
                {item.amadeusId && (
                    <Text style={styles.amadeusId}>ID: {item.amadeusId}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Carregando componentes...</Text>
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
                            {allComponents.length} componente{allComponents.length !== 1 ? 's' : ''} no pacote
                        </Text>
                        <View style={styles.componentsSummary}>
                            <Text style={styles.summaryText}>
                                ✈️ {allComponents.filter(item => item.type === 'FLIGHT').length} voos
                            </Text>
                            <Text style={styles.summaryText}>
                                🏨 {allComponents.filter(item => item.type === 'HOTEL').length} hotéis
                            </Text>
                            <Text style={styles.summaryText}>
                                🎯 {allComponents.filter(item => item.type === 'ACTIVITY').length} atividades
                            </Text>
                            <Text style={styles.summaryText}>
                                🚗 {allComponents.filter(item => item.type === 'CAR_RENTAL').length} carros
                            </Text>
                        </View>
                    </View>
                ) : null
            }
        />

    );
}


const styles = StyleSheet.create({
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
    // Mantenha os estilos anteriores do renderPackageItem...
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