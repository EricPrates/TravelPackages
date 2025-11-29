import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigation } from "@react-navigation/native";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function PackageDetailsScreen({ route }) {
    const navigation = useNavigation();
    const { travelPackage } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const { components, title, departureDate, returnDate, status, description } = travelPackage;
    
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    const verifyType = (item) => {
        if (item.type === 'FLIGHT') {
            return '✈️ Voo';
        } else if (item.type === 'HOTEL') {
            return '🏨 Hotel';
        } else if (item.type === 'CAR_RENTAL') {
            return '🚗 Aluguel de Carro';
        } else if (item.type === 'ACTIVITY') {
            return '🎯 Atividade';
        }
        return item.type;
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'AVAILABLE':
                return '#10B981'; 
            case 'CONFIRMED':
                return '#3B82F6';
            case 'CANCELLED':
                return '#EF4444'; 
            case 'PENDING':
                return '#F59E0B';
            default:
                return '#6B7280'; 
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'FLIGHT':
                return '#3B82F6';
            case 'HOTEL':
                return '#8B5CF6';
            case 'CAR_RENTAL':
                return '#F59E0B';
            case 'ACTIVITY':
                return '#10B981'; 
            default:
                return '#6B7280'; 
        }
    };

    const renderDetails = ({ item }) => (
        <View style={styles.componentCard}>
            <View style={styles.componentHeader}>
                <Text style={styles.componentName}>{item.name}</Text>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                    <Text style={styles.typeText}>{verifyType(item)}</Text>
                </View>
            </View>
            
            {item.description && (
                <Text style={styles.componentDescription}>{item.description}</Text>
            )}
            
            <View style={styles.priceContainer}>
                {item.moneyPrice > 0 && (
                    <Text style={styles.moneyPrice}>R$ {item.moneyPrice.toFixed(2)}</Text>
                )}
                {item.milesPrice > 0 && (
                    <Text style={styles.milesPrice}>{item.milesPrice.toLocaleString()} milhas</Text>
                )}
            </View>
            
            {item.details && (
                <Text style={styles.componentDetails}>Detalhes: {item.details}</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
           
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
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

            <View style={styles.componentsSection}>
                <Text style={styles.componentsTitle}>🧩 Componentes do Pacote</Text>
                
                {components && components.length > 0 ? (
                    <FlatList
                        data={components}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        renderItem={renderDetails}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateEmoji}>📦</Text>
                        <Text style={styles.emptyStateText}>Nenhum componente adicionado</Text>
                        <Text style={styles.emptyStateSubtext}>Adicione voos, hotéis e outros componentes ao pacote</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
    },
    loadingText: {
        color: '#ffffff',
        marginTop: 10,
        fontSize: 16,
    },
    header: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    packageInfo: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    dateContainer: {
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    descriptionContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    descriptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    componentsSection: {
        flex: 1,
        padding: 20,
    },
    componentsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    componentCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    componentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    componentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        flex: 1,
        marginRight: 12,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    componentDescription: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 12,
        lineHeight: 20,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    moneyPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10B981',
    },
    milesPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F59E0B',
    },
    componentDetails: {
        fontSize: 12,
        color: '#94A3B8',
        fontStyle: 'italic',
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
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
    },
});