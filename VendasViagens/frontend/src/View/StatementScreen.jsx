import { FlatList, Text, View, StyleSheet, ActivityIndicator } from "react-native";
import StatementController from "../controller/Statement.controller";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

export default function StatementScreen() {
    const { isLoading, transactions, error, fetchTransactions} = StatementController();
    useFocusEffect(
        React.useCallback(() => {
            fetchTransactions();
        }, [])
    );
    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Carregando transações...</Text>
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    };

    const formatAmount = (transaction) => {
        const sign = transaction.type === 'DEPOSIT' ? '+' : '-';
        return `${sign} ${transaction.displayAmount || transaction.amount}`;
    };

    const getAmountColor = (transaction) => {
        return transaction.type === 'DEPOSIT' ? 'green' : 'red';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Extrato de Transações</Text>

            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.transactionItem}>
                        <View style={styles.transactionHeader}>
                            <Text style={styles.type}>{item.type}</Text>
                            <Text style={[styles.amount, { color: getAmountColor(item) }]}>
                                {formatAmount(item)}
                            </Text>
                        </View>

                        <Text style={styles.date}>{formatDate(item.date)}</Text>
                        <Text style={styles.coinType}>Moeda: {item.coinType}</Text>
                        <Text style={styles.description}>{item.description}</Text>

                        {item.balanceAfter && (
                            <View style={styles.balanceContainer}>
                                <Text style={styles.balanceLabel}>Novo Saldo:</Text>
                                <Text style={styles.balanceValue}>
                                    {item.coinType === 'CASH'
                                        ? `R$ ${item.balanceAfter.cash.toFixed(2)}`
                                        : `${item.balanceAfter.miles.toLocaleString('pt-BR')} milhas`
                                    }
                                </Text>
                            </View>
                        )}

                        {item.relatedPurchaseId && (
                            <Text style={styles.purchase}>Compra ID: {item.relatedPurchaseId}</Text>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text>Nenhuma transação encontrada</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    transactionItem: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    type: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    coinType: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#333',
    },
    purchase: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    balanceContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
    },
    balanceValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    error: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
});