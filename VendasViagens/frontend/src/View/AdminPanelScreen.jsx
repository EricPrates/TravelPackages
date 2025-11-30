import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';


export default function AdminPanelScreen() {
    const navigation = useNavigation();
    const { user, logout } = useAuth();

    const MenuButton = ({ icon, title, description, color, onPress }) => (
        <TouchableOpacity
            style={[styles.menuButton, { borderLeftColor: color }]}
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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.adminBadge}>
                    <Ionicons name="shield-checkmark" size={24} color="#6366f1" />
                    <Text style={styles.adminTitle}>Painel Administrativo</Text>
                </View>
                <Text style={styles.subtitle}>
                    Bem-vindo, {user?.name || user?.email}
                </Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="briefcase" size={20} color="#6366f1" />
                    <Text style={styles.sectionTitle}>Gerenciar Pacotes</Text>
                </View>

                <MenuButton
                    icon="add-circle"
                    title="Criar Pacote"
                    description="Adicionar novo pacote de viagem"
                    color="#10b981"
                    onPress={() => navigation.navigate('CriarPacote')}
                />

                <MenuButton
                    icon="list"
                    title="Meus Pacotes"
                    description="Ver e editar pacotes criados"
                    color="#f59e0b"
                    onPress={() => navigation.navigate('Home')}
                />
            </View>


            <TouchableOpacity
                style={styles.logoutButton}
                onPress={logout}
            >
                <Ionicons name="log-out" size={20} color="#fff" />
                <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        marginBottom: 16,
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
        paddingHorizontal: 20,
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
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
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
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#ef4444',
        marginHorizontal: 20,
        marginBottom: 40,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
