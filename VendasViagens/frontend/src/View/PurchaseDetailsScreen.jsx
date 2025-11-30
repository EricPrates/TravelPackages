// ...existing code...
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import PurchaseDetailsController from "../controller/PurchaseDetails.controller";

export default function PurchaseDetailsScreen({ route }) {
    const { purchase, isLoading, error } = PurchaseDetailsController(route);

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('pt-BR') + ' às ' +
        new Date(dateString).toLocaleTimeString('pt-BR');

    const formatCurrency = (value) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    const formatMiles = (miles) =>
        new Intl.NumberFormat('pt-BR').format(miles || 0) + ' milhas';

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text>Carregando detalhes da compra...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Erro: {error}</Text>
            </View>
        );
    }

    if (!purchase) {
        return (
            <View style={styles.center}>
                <Text>Nenhuma compra encontrada</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Compra #{purchase.id}</Text>

            <View style={[styles.statusCard, styles[`status${purchase.status}`] || styles.statusDEFAULT]}>
                <Text style={styles.statusText}>Status: {purchase.status}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informações</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Data:</Text>
                    <Text style={styles.infoValue}>{formatDate(purchase.purchaseDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Quantidade:</Text>
                    <Text style={styles.infoValue}>{purchase.quantity} pessoa(s)</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pagamento</Text>
                {purchase.paidInMoney > 0 && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>💵 Pago em dinheiro:</Text>
                        <Text style={[styles.infoValue, styles.paidValue]}>{formatCurrency(purchase.paidInMoney)}</Text>
                    </View>
                )}
                {purchase.paidInMiles > 0 && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>⭐ Pago em milhas:</Text>
                        <Text style={[styles.infoValue, styles.paidValue]}>{formatMiles(purchase.paidInMiles)}</Text>
                    </View>
                )}
                {purchase.paidInMoney === 0 && purchase.paidInMiles === 0 && (
                    <Text style={styles.noPayment}>Nenhum pagamento registrado</Text>
                )}
            </View>

            {purchase.travelPackage && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pacote</Text>
                    <Text style={styles.packageTitle}>{purchase.travelPackage.title}</Text>
                    {purchase.travelPackage.description && (
                        <Text style={styles.packageDescription}>{purchase.travelPackage.description}</Text>
                    )}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Destino:</Text>
                        <Text style={styles.infoValue}>{purchase.travelPackage.destination}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Origem:</Text>
                        <Text style={styles.infoValue}>{purchase.travelPackage.origin}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Partida:</Text>
                        <Text style={styles.infoValue}>{formatDate(purchase.travelPackage.departureDate)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Retorno:</Text>
                        <Text style={styles.infoValue}>{formatDate(purchase.travelPackage.returnDate)}</Text>
                    </View>
                </View>
            )}

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>💰 Total Pago</Text>
                {purchase.paidInMoney > 0 && purchase.paidInMiles > 0 ? (
                    <>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Dinheiro:</Text>
                            <Text style={styles.summaryAmount}>
                                {formatCurrency(purchase.paidInMoney)}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Milhas:</Text>
                            <Text style={styles.summaryAmount}>
                                {formatMiles(purchase.paidInMiles)}
                            </Text>
                        </View>
                    </>
                ) : purchase.paidInMoney > 0 ? (
                    <Text style={styles.summaryTotal}>
                        {formatCurrency(purchase.paidInMoney)}
                    </Text>
                ) : purchase.paidInMiles > 0 ? (
                    <Text style={styles.summaryTotal}>
                        {formatMiles(purchase.paidInMiles)}
                    </Text>
                ) : (
                    <Text style={styles.summaryTotal}>R$ 0,00</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 16, color: '#333' },
    statusCard: { padding: 12, marginHorizontal: 16, marginBottom: 16, borderRadius: 8, alignItems: 'center' },
    statusCONFIRMED: { backgroundColor: '#d4edda' },
    statusPENDING: { backgroundColor: '#fff3cd' },
    statusCANCELLED: { backgroundColor: '#f8d7da' },
    statusDEFAULT: { backgroundColor: '#e2e8f0' },
    statusText: { fontWeight: 'bold', fontSize: 16, color: '#155724' },
    section: { backgroundColor: 'white', padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 8, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    infoLabel: { fontSize: 14, color: '#666', flex: 1 },
    infoValue: { fontSize: 14, fontWeight: '500', color: '#333', textAlign: 'right', flex: 1 },
    paidValue: { color: '#1890ff', fontWeight: 'bold' },
    noPayment: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center' },
    packageTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
    packageDescription: { fontSize: 14, color: '#666', marginBottom: 12, fontStyle: 'italic' },
    summaryCard: { backgroundColor: '#e8f4fd', padding: 20, margin: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#1890ff', alignItems: 'center' },
    summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1890ff' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
    summaryLabel: { fontSize: 16, color: '#666', fontWeight: '600' },
    summaryAmount: { fontSize: 18, fontWeight: 'bold', color: '#1890ff' },
    summaryTotal: { fontSize: 28, fontWeight: 'bold', color: '#1890ff', marginTop: 8 },
    error: { color: 'red', fontSize: 16, textAlign: 'center' }
});
