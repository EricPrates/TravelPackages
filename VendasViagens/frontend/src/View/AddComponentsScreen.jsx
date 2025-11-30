import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AddComponentsScreen({ route }) {
    const navigation = useNavigation();
    const { travelPackage } = route.params || {};

    const ComponentButton = ({ icon, title, description, color, onPress }) => (
        <TouchableOpacity
            style={[styles.componentButton, { borderLeftColor: color }]}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Ionicons name={icon} size={32} color="#fff" />
            </View>
            <View style={styles.buttonContent}>
                <Text style={styles.buttonTitle}>{title}</Text>
                <Text style={styles.buttonDescription}>{description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
        </TouchableOpacity>
    );

    if (!travelPackage) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={64} color="#dc2626" />
                <Text style={styles.errorTitle}>Erro</Text>
                <Text style={styles.errorText}>Nenhum pacote selecionado</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="cube" size={32} color="#6366f1" />
                <Text style={styles.title}>Adicionar Componentes</Text>
                <View style={styles.packageIdBadge}>
                    <Text style={styles.packageIdText}>Pacote: {travelPackage.title}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Selecione o tipo de componente:</Text>

                <ComponentButton
                    icon="airplane"
                    title="Adicionar Voo"
                    description="Adicione voos ao pacote"
                    color="#3b82f6"
                    onPress={() => navigation.navigate('SelecionarComponentes', { travelPackage: travelPackage, type: 'FLIGHT' })}
                />

                <ComponentButton
                    icon="bed"
                    title="Adicionar Hotel"
                    description="Adicione hospedagem ao pacote"
                    color="#8b5cf6"
                    onPress={() => navigation.navigate('SelecionarComponentes', { travelPackage: travelPackage, type: 'HOTEL' })}
                />

                <ComponentButton
                    icon="location"
                    title="Adicionar Atividade"
                    description="Adicione passeios e atividades"
                    color="#f59e0b"
                    onPress={() => navigation.navigate('SelecionarComponentes', { travelPackage: travelPackage, type: 'ACTIVITY' })}
                />

                <ComponentButton
                    icon="car"
                    title="Adicionar Carro"
                    description="Adicione aluguel de carro"
                    color="#10b981"
                    onPress={() => navigation.navigate('SelecionarComponentes', { travelPackage: travelPackage, type: 'CAR_RENTAL' })}
                />

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={24} color="#6366f1" />
                    <Text style={styles.infoText}>
                        Adicione componentes para completar seu pacote. Os preços serão somados automaticamente.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.finishButton}
                    onPress={() => {
                        Alert.alert(
                            'Cancelar Edição',
                            'Deseja cancelar a edição do pacote?',
                            [
                               
                                {
                                    text: 'Voltar ao Menu',
                                    onPress: () => navigation.navigate('AdminPanel')
                                },
                                {
                                    text: 'Continuar Editando',
                                    style: 'cancel'
                                }
                            ]
                        );
                    }}
                >
                    <Text style={styles.finishButtonText}>Finalizar e Voltar ao Menu</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#6366f1',
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 12,
        marginBottom: 12,
    },
    packageIdBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    packageIdText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
    },
    componentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    buttonContent: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    buttonDescription: {
        fontSize: 14,
        color: '#64748b',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#1e40af',
        lineHeight: 20,
    },
    finishButton: {
        backgroundColor: '#64748b',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    finishButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 20,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#dc2626',
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
