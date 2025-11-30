import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardController from '../controller/Dashboard.controller';

export default function DashboardScreen() {
    const { dashboardData, isLoading, error, period, setPeriod, fetchDashboard } = DashboardController();

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Carregando estatísticas...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <MaterialCommunityIcons name="alert-circle" size={64} color="#dc2626" />
                <Text style={styles.errorTitle}>Erro ao carregar dashboard</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchDashboard}>
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!dashboardData) return null;

    const { currentBalance, periodStats, recentPurchases } = dashboardData;

    return (
        <ScrollView style={styles.container}>
            {/* Filtro de Período */}
            <View style={styles.periodSelector}>
                <TouchableOpacity
                    style={[styles.periodButton, period === '30' && styles.periodButtonActive]}
                    onPress={() => setPeriod('30')}
                >
                    <Text style={[styles.periodButtonText, period === '30' && styles.periodButtonTextActive]}>
                        30 dias
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.periodButton, period === '90' && styles.periodButtonActive]}
                    onPress={() => setPeriod('90')}
                >
                    <Text style={[styles.periodButtonText, period === '90' && styles.periodButtonTextActive]}>
                        90 dias
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.periodButton, period === '365' && styles.periodButtonActive]}
                    onPress={() => setPeriod('365')}
                >
                    <Text style={[styles.periodButtonText, period === '365' && styles.periodButtonTextActive]}>
                        1 ano
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Saldo Atual */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💰 Saldo Atual</Text>
                <View style={styles.balanceContainer}>
                    <View style={styles.balanceCard}>
                        <MaterialCommunityIcons name="cash" size={32} color="#10b981" />
                        <Text style={styles.balanceLabel}>Dinheiro</Text>
                        <Text style={styles.balanceValue}>
                            R$ {currentBalance.cash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View style={styles.balanceCard}>
                        <MaterialCommunityIcons name="star" size={32} color="#f59e0b" />
                        <Text style={styles.balanceLabel}>Milhas</Text>
                        <Text style={styles.balanceValue}>
                            {currentBalance.miles.toLocaleString('pt-BR')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Estatísticas do Período */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Estatísticas do Período</Text>
                
                <View style={styles.statCard}>
                    <View style={styles.statIcon}>
                        <MaterialCommunityIcons name="cash-minus" size={24} color="#dc2626" />
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Total Gasto em Dinheiro</Text>
                        <Text style={styles.statValue}>
                            R$ {periodStats.totalSpentMoney.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.statIcon}>
                        <MaterialCommunityIcons name="star-minus" size={24} color="#f59e0b" />
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Total Gasto em Milhas</Text>
                        <Text style={styles.statValue}>
                            {periodStats.totalSpentMiles.toLocaleString('pt-BR')} milhas
                        </Text>
                    </View>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.statIcon}>
                        <MaterialCommunityIcons name="star-plus" size={24} color="#10b981" />
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Milhas Acumuladas</Text>
                        <Text style={styles.statValue}>
                            {periodStats.milesEarned.toLocaleString('pt-BR')} milhas
                        </Text>
                    </View>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.statIcon}>
                        <MaterialCommunityIcons name="shopping" size={24} color="#6366f1" />
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Total de Compras</Text>
                        <Text style={styles.statValue}>{periodStats.totalPurchases}</Text>
                    </View>
                </View>
            </View>

            {/* Status das Compras */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📈 Status das Compras</Text>
                <View style={styles.statusContainer}>
                    <View style={styles.statusItem}>
                        <Text style={[styles.statusValue, { color: '#f59e0b' }]}>
                            {periodStats.purchasesByStatus.pending}
                        </Text>
                        <Text style={styles.statusLabel}>Pendentes</Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusValue}>{periodStats.purchasesByStatus.confirmed}</Text>
                        <Text style={styles.statusLabel}>Confirmadas</Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={[styles.statusValue, { color: '#dc2626' }]}>
                            {periodStats.purchasesByStatus.cancelled}
                        </Text>
                        <Text style={styles.statusLabel}>Canceladas</Text>
                    </View>
                </View>
            </View>

            {/* Compras Recentes */}
            {recentPurchases.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🕒 Compras Recentes</Text>
                    {recentPurchases.map((purchase) => (
                        <View key={purchase.id} style={styles.purchaseCard}>
                            <View style={styles.purchaseHeader}>
                                <Text style={styles.purchaseId}>Compra #{purchase.id}</Text>
                                <Text style={[
                                    styles.purchaseStatus,
                                    purchase.status === 'CONFIRMED' && styles.statusConfirmed,
                                    purchase.status === 'CANCELLED' && styles.statusCancelled
                                ]}>
                                    {purchase.status}
                                </Text>
                            </View>
                            <Text style={styles.purchaseDate}>
                                {new Date(purchase.date).toLocaleDateString('pt-BR')}
                            </Text>
                            <View style={styles.purchaseValues}>
                                {purchase.paidInMoney > 0 && (
                                    <Text style={styles.purchaseValue}>
                                        💵 R$ {purchase.paidInMoney.toFixed(2)}
                                    </Text>
                                )}
                                {purchase.paidInMiles > 0 && (
                                    <Text style={styles.purchaseValue}>
                                        ⭐ {purchase.paidInMiles.toLocaleString('pt-BR')} milhas
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
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
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#dc2626',
        marginTop: 16,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    periodSelector: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    periodButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    periodButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    periodButtonTextActive: {
        color: '#fff',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    balanceContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    balanceCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
    },
    balanceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 4,
    },
    statCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    statContent: {
        flex: 1,
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statusContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusItem: {
        alignItems: 'center',
    },
    statusValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: 4,
    },
    statusLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    purchaseCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    purchaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    purchaseId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    purchaseStatus: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusConfirmed: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
    },
    statusCancelled: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
    },
    purchaseDate: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    purchaseValues: {
        flexDirection: 'row',
        gap: 16,
    },
    purchaseValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
    },
});
