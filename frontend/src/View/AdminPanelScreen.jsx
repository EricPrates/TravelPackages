import { Text, TouchableOpacity, View, StyleSheet, SafeAreaView, ScrollView, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function AdminPanelScreen() {
    
    const handleAction = (action) => {
        Alert.alert(
            'Ação Administrativa',
            `Você selecionou: ${action}`,
            [{ text: 'OK', style: 'default' }]
        );
      
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

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
   
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

                {/* Quick Stats */}
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
                        <Text style={styles.statNumber}></Text>
                        <Text style={styles.statLabel}></Text>
                    </View>
                </View>
            </ScrollView>
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
        fontFamily: 'System',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        fontFamily: 'System',
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
        fontFamily: 'System',
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
        fontFamily: 'System',
    },
    buttonDescription: {
        fontSize: 14,
        color: '#64748b',
        fontFamily: 'System',
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
        fontFamily: 'System',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        fontFamily: 'System',
    },
});