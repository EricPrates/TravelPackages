import { useAuth } from "../AuthContext";
import { useNavigation } from "@react-navigation/native";
import { FlatList, Text, View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import PackageDetailsController from "../controller/PackageDetails.controller";

export default function PackageDetailsScreen({ route }) {
    const navigation = useNavigation();
    const { travelPackage } = route.params;
    const { user } = useAuth();
    const typeUser = user.type;

    const { components, id, title, departureDate, returnDate, status, description, totalMoneyPrice, totalMilesPrice } = travelPackage;

    const {
        verifyType,
        getStatusColor,
        getTypeColor,
        handleMixedInputsChange,
        handlePurchase,
        mixedError,
        setMixedError,
        setCashAmount,
        setMilesAmount,
        cashAmount,
        milesAmount,
        isLoading,
        milesRequired,
        verifyMilesRequired

    } = PackageDetailsController(travelPackage);







    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Processando compra...</Text>
            </View>
        );
    }

    const renderDetails = ({ item }) => (
        <View style={styles.componentCard}>
            <View style={styles.componentHeader}>
                <Text style={styles.componentName}>{item.name}</Text>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                    <Text style={styles.typeText}>{verifyType(item)}</Text>
                </View>
            </View>
            {item.description && <Text style={styles.componentDescription}>{item.description}</Text>}
            <View style={styles.priceContainer}>
                {item.moneyPrice > 0 && (
                    <Text style={styles.moneyPriceComponent}>R$ {item.moneyPrice.toFixed(2)}</Text>
                )}
                {item.milesPrice > 0 && (
                    <Text style={styles.milesPriceComponent}>{item.milesPrice.toLocaleString()} milhas</Text>
                )}
            </View>
            {item.details && <Text style={styles.componentDetails}>Detalhes: {item.details}</Text>}
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.idText}>ID: {id}</Text>
                    <View style={styles.priceContainerTotal}>
                        <Text style={styles.moneyPriceTotal}>R$ {totalMoneyPrice.toFixed(2)}</Text>
                        <Text style={styles.milesPriceTotal}>{totalMilesPrice.toLocaleString()} milhas</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                        <Text style={styles.statusText}>{status?.toUpperCase() || 'NÃO DEFINIDO'}</Text>
                    </View>
                </View>


                <View style={styles.packageInfo}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>🛫 Partida</Text>
                        <Text style={styles.dateValue}>{new Date(departureDate).toLocaleDateString('pt-BR')}</Text>
                    </View>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>🛬 Retorno</Text>
                        <Text style={styles.dateValue}>{new Date(returnDate).toLocaleDateString('pt-BR')}</Text>
                    </View>
                </View>


                {description && (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionLabel}>📝 Descrição</Text>
                        <Text style={styles.descriptionText}>{description}</Text>
                    </View>
                )}

                {!typeUser === 'agent' && (
                    <View style={styles.mixedPurchaseContainer}>
                        <Text style={styles.mixedPurchaseLabel}>💳 Compra Mista</Text>
                        <View style={styles.inputsContainer}>
                            <TextInput
                                style={[styles.input, mixedError && styles.inputError]}
                                placeholder={`Dinheiro (máx R$ ${totalMoneyPrice.toFixed(2)})`}
                                placeholderTextColor="#94a3b8"
                                keyboardType="decimal-pad"
                                value={cashAmount}
                                onChangeText={(v) => { handleMixedInputsChange(setCashAmount, v); verifyMilesRequired(); }}
                                editable={!isLoading}
                            />
                            <TextInput
                                style={[styles.input, mixedError && styles.inputError]}
                                placeholder={`Milhas (máx ${totalMilesPrice.toLocaleString()})`}
                                placeholderTextColor="#94a3b8"
                                keyboardType="number-pad"
                                value={milesAmount}
                                onChangeText={(v) => handleMixedInputsChange(setMilesAmount, v)}
                                editable={!isLoading}
                            />
                            {
                                milesRequired > 0 && (
                                    <Text style={styles.errorText}>⚠️ Milhas necessárias para compra: {milesRequired.toLocaleString()}</Text>
                                )
                            }
                            {mixedError !== '' && (
                                <Text style={styles.errorText}>⚠️ {mixedError}</Text>
                            )}
                        </View>
                    </View>
                )}


                <View style={styles.componentsSection}>
                    <Text style={styles.componentsTitle}>🧩 Componentes do Pacote</Text>
                    {components && components.length > 0 ? (
                        <FlatList
                            data={components}
                            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                            renderItem={renderDetails}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateEmoji}>📦</Text>
                            <Text style={styles.emptyStateText}>Nenhum componente encontrado</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {!typeUser === 'agent' && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        disabled={isLoading}
                        onPress={() => handlePurchase('miles')}
                        style={[styles.buyButton, styles.milesButton, isLoading && styles.disabledButton]}
                    >
                        <Text style={styles.buyButtonText}>Comprar com Milhas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={isLoading}
                        onPress={() => handlePurchase('cash')}
                        style={[styles.buyButton, styles.cashButton, isLoading && styles.disabledButton]}
                    >
                        <Text style={styles.buyButtonText}>Comprar com Dinheiro</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={isLoading || mixedError !== ''}
                        onPress={() => handlePurchase('mixed')}
                        style={[styles.buyButton, styles.mixedButton, (isLoading || mixedError) && styles.disabledButton]}
                    >
                        <Text style={styles.buyButtonText}>Compra Mista</Text>
                    </TouchableOpacity>
                </View>
            )}
                 <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        disabled={isLoading}
                        onPress={() => (navigation.navigate('CriarPacote', { updatePackage: travelPackage }))}
                        style={[styles.buyButton, styles.cashButton, isLoading && styles.disabledButton]}
                    >
                        <Text style={styles.buyButtonText}>Editar Pacote</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={isLoading}
                        onPress={() => handlePurchase('miles')}
                        style={[styles.buyButton, styles.milesButton, isLoading && styles.disabledButton]}
                    >
                        <Text style={styles.buyButtonText}>Deletar Pacote</Text>
                        
                    </TouchableOpacity>
                       <TouchableOpacity
                        disabled={isLoading}
                        onPress={() => handlePurchase('cash')}
                        style={[styles.buyButton, styles.cashButton, isLoading && styles.disabledButton]}
                    >
                        <Text style={styles.buyButtonText}>Comprar com Dinheiro</Text>
                    
                    </TouchableOpacity>
                 </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Layout
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    scrollView: {
        flex: 1,
        padding: 16
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    loadingText: {
        color: '#ffffff',
        marginTop: 12,
        fontSize: 16,
        fontWeight: '500'
    },

    // Header
    header: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
        lineHeight: 32
    },
    idText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12
    },
    priceContainerTotal: {
        alignItems: 'center',
        marginBottom: 12
    },
    moneyPriceTotal: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#059669',
        marginBottom: 4
    },
    milesPriceTotal: {
        fontSize: 18,
        fontWeight: '600',
        color: '#dc2626'
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8
    },
    statusText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12
    },

    // Package Info
    packageInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    dateContainer: {
        flex: 1,
        alignItems: 'center'
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4
    },
    dateValue: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500'
    },

    // Description
    descriptionContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    descriptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8
    },
    descriptionText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20
    },

    // Mixed Purchase
    mixedPurchaseContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    mixedPurchaseLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12
    },
    inputsContainer: {
        gap: 12
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#1e293b',
        fontSize: 16
    },
    inputError: {
        borderColor: '#dc2626',
        backgroundColor: '#fef2f2'
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500'
    },

    // Components
    componentsSection: {
        marginBottom: 140
    },
    componentsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16
    },
    listContent: {
        paddingBottom: 10
    },
    componentCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6'
    },
    componentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
    },
    componentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
        marginRight: 12
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12
    },
    typeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600'
    },
    componentDescription: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12,
        lineHeight: 20
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    moneyPriceComponent: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669'
    },
    milesPriceComponent: {
        fontSize: 14,
        fontWeight: '600',
        color: '#dc2626'
    },
    componentDetails: {
        fontSize: 12,
        color: '#94a3b8',
        fontStyle: 'italic'
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    emptyStateEmoji: {
        fontSize: 48,
        marginBottom: 16
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center'
    },


    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        gap: 8
    },
    buyButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    milesButton: {
        backgroundColor: '#dc2626'
    },
    cashButton: {
        backgroundColor: '#059669'
    },
    mixedButton: {
        backgroundColor: '#6366f1'
    },
    buyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600'
    },
    disabledButton: {
        opacity: 0.5
    }
});