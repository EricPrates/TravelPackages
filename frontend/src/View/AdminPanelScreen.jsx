import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet, SafeAreaView, ScrollView, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AdminPanelController from "../controller/AdminPanel.controller";
import { TextInput } from "react-native-paper";

export default function AdminPanelScreen() {
    const { createBasicPackage, isLoading } = AdminPanelController();
    const [tela, setTela] = useState('');
    const [packageData, setPackageData] = useState({
        title: '',
        destination: '',
        origin: '',
        departureDate: '',
        returnDate: '',
        description: '',
        numberOfTravelers: '1'
    });

    const handleAction = (action) => {
        Alert.alert(
            'Ação Administrativa',
            `Você selecionou: ${action}`,
            [{ text: 'OK', style: 'default' }]
        );
        setTela(action);
    };

    const AdminButton = ({ icon, title, description, color, onPress }) => (
        <TouchableOpacity
            style={[styles.adminButton, { borderLeftColor: color }]}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Ionicons name={icon} size={24} color="#fff" />
            </View>
            <View style={styles.buttonContent}>
                <Text style={styles.buttonTitle}>{title}</Text>
                <Text style={styles.buttonDescription}>{description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
    );


    const handleSavePackage = async () => {
     
        if (!packageData.destination || !packageData.origin) {
            Alert.alert('Erro', 'Destino e Origem são obrigatórios');
            return;
        }
        if (!packageData.departureDate || !packageData.returnDate) {
            Alert.alert('Erro', 'Datas de partida e retorno são obrigatórias');
            return;
        }

        const result = await createBasicPackage({
            ...packageData,
            numberOfTravelers: parseInt(packageData.numberOfTravelers) || 1
        });

        if (result.success) {
            Alert.alert('Sucesso!', 'Pacote criado com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => {
                        setPackageData({
                            title: '',
                            destination: '',
                            origin: '',
                            departureDate: '',
                            returnDate: '',
                            description: '',
                            numberOfTravelers: '1'
                        });
                        setTela('');
                    }
                }
            ]);
        } else {
            Alert.alert('Erro', result.error || 'Erro ao criar pacote');
        }
    };

    const renderScreen = () => {
        switch (tela) {
            case 'Criar Pacote':
                return (
                    <ScrollView style={styles.screenContainer}>
                        <Text style={styles.screenTitle}>Criar Pacote</Text>
                        <Text style={styles.screenDescription}>
                            Formulário para criar novo pacote de viagem
                        </Text>
                        
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Título (opcional)</Text>
                            <TextInput 
                                mode="outlined"
                                value={packageData.title} 
                                onChangeText={(text) => setPackageData({...packageData, title: text})}
                                placeholder="Ex: Pacote Rio de Janeiro"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Destino *</Text>
                            <TextInput 
                                mode="outlined"
                                value={packageData.destination} 
                                onChangeText={(text) => setPackageData({...packageData, destination: text})}
                                placeholder="Ex: Rio de Janeiro"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Origem *</Text>
                            <TextInput 
                                mode="outlined"
                                value={packageData.origin} 
                                onChangeText={(text) => setPackageData({...packageData, origin: text})}
                                placeholder="Ex: São Paulo"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Data de Partida * (AAAA-MM-DD)</Text>
                            <TextInput 
                                mode="outlined"
                                value={packageData.departureDate} 
                                onChangeText={(text) => setPackageData({...packageData, departureDate: text})}
                                placeholder="2024-12-20"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Data de Retorno * (AAAA-MM-DD)</Text>
                            <TextInput 
                                mode="outlined"
                                value={packageData.returnDate} 
                                onChangeText={(text) => setPackageData({...packageData, returnDate: text})}
                                placeholder="2024-12-27"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Descrição</Text>
                            <TextInput 
                                mode="outlined"
                                value={packageData.description} 
                                onChangeText={(text) => setPackageData({...packageData, description: text})}
                                placeholder="Descreva o pacote..."
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Número de viajantes *</Text>
                            <TextInput 
                                mode="outlined"
                                value={packageData.numberOfTravelers} 
                                onChangeText={(text) => setPackageData({...packageData, numberOfTravelers: text})}
                                placeholder="1"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={{ marginTop: 20, marginBottom: 40 }}>
                            <TouchableOpacity
                                style={[styles.backButton, { backgroundColor: '#10b981' }]}
                                onPress={handleSavePackage}
                                disabled={isLoading}
                            >
                                <Text style={styles.backButtonText}>
                                    {isLoading ? 'Salvando...' : 'Salvar Pacote'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.backButton, { backgroundColor: '#64748b' }]}
                                onPress={() => setTela('')}
                                disabled={isLoading}
                            >
                                <Text style={styles.backButtonText}>Voltar ao Painel</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                );

            case 'Editar Pacote':
                return (
                    <View style={styles.screenContainer}>
                        <Text style={styles.screenTitle}>Editar Pacote</Text>
                        <Text style={styles.screenDescription}>
                            Selecione um pacote para editar
                        </Text>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setTela('')}
                        >
                            <Text style={styles.backButtonText}>Voltar ao Painel</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'Criar Usuário':
                return (
                    <View style={styles.screenContainer}>
                        <Text style={styles.screenTitle}>Criar Usuário</Text>
                        <Text style={styles.screenDescription}>
                            Formulário para criar novo usuário
                        </Text>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setTela('')}
                        >
                            <Text style={styles.backButtonText}>Voltar ao Painel</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'Editar Usuário':
                return (
                    <View style={styles.screenContainer}>
                        <Text style={styles.screenTitle}>Editar Usuário</Text>
                        <Text style={styles.screenDescription}>
                            Selecione um usuário para editar
                        </Text>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setTela('')}
                        >
                            <Text style={styles.backButtonText}>Voltar ao Painel</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'Relatórios de Vendas':
                return (
                    <View style={styles.screenContainer}>
                        <Text style={styles.screenTitle}>Relatórios de Vendas</Text>
                        <Text style={styles.screenDescription}>
                            Visualize métricas e relatórios de vendas
                        </Text>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setTela('')}
                        >
                            <Text style={styles.backButtonText}>Voltar ao Painel</Text>
                        </TouchableOpacity>
                    </View>
                );

            default:
             
                return (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={[{marginBottom: 32, marginTop: 10, alignItems: 'center', justifyContent: 'center'}]}>
                        <View style={styles.header}>
                            <View style={styles.adminBadge}>
                                <Ionicons name="shield-checkmark" size={24} color="#6366f1" />
                                <Text style={styles.adminTitle}>Painel Administrativo</Text>
                            </View>
                            <Text style={styles.subtitle}>
                                Gerencie pacotes e usuários do sistema
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="briefcase" size={20} color="#6366f1" />
                                <Text style={styles.sectionTitle}>Gerenciar Pacotes</Text>
                            </View>

                            <AdminButton
                                icon="add-circle"
                                title="Criar Pacote"
                                description="Adicionar novo pacote de viagem"
                                color="#10b981"
                                onPress={() => handleAction('Criar Pacote')}
                            />

                            <AdminButton
                                icon="create"
                                title="Editar Pacote"
                                description="Modificar pacotes existentes"
                                color="#f59e0b"
                                onPress={() => handleAction('Editar Pacote')}
                            />
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="people" size={20} color="#6366f1" />
                                <Text style={styles.sectionTitle}>Gerenciar Usuários</Text>
                            </View>

                            <AdminButton
                                icon="person-add"
                                title="Criar Usuário"
                                description="Cadastrar novo usuário"
                                color="#6366f1"
                                onPress={() => handleAction('Criar Usuário')}
                            />

                            <AdminButton
                                icon="person"
                                title="Editar Usuário"
                                description="Gerenciar usuários existentes"
                                color="#8b5cf6"
                                onPress={() => handleAction('Editar Usuário')}
                            />
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="bar-chart" size={20} color="#6366f1" />
                                <Text style={styles.sectionTitle}>Relatórios</Text>
                            </View>

                            <AdminButton
                                icon="analytics"
                                title="Relatórios de Vendas"
                                description="Visualizar métricas e relatórios"
                                color="#ef4444"
                                onPress={() => handleAction('Relatórios de Vendas')}
                            />
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                                    <Ionicons name="briefcase" size={20} color="#6366f1" />
                                </View>
                                <Text style={styles.statNumber}>24</Text>
                                <Text style={styles.statLabel}>Pacotes Ativos</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                    <Ionicons name="people" size={20} color="#10b981" />
                                </View>
                                <Text style={styles.statNumber}>156</Text>
                                <Text style={styles.statLabel}>Usuários</Text>
                            </View>
                        </View>
                        </View>
                    </ScrollView>
                );
        }
    };

    return (
        <View style={styles.container}>
            {renderScreen()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    screenContainer: {
        flex: 1,
        padding: 20,
        
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
        textAlign: 'center',
    },
    screenDescription: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    backButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 20,
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        marginBottom: 32,
        marginTop: 10,
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    adminTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginLeft: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        lineHeight: 22,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginLeft: 8,
    },
    adminButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
});