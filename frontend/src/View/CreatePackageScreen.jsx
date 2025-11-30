import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import AdminPanelController from '../controller/AdminPanel.controller';
import { useNavigation } from '@react-navigation/native';

export default function CreatePackageScreen({ route = {} }) {
  const navigation = useNavigation();
  const { updatePackage } = route.params || {};  // ✅ Proteção contra undefined
  
  const { 
    handleSavePackage, 
    isLoading, 
    handleChangeBasicPackage, 
    packageData, 
    error, 
    deletePackage, 
    updatePackageInDB 
  } = AdminPanelController(updatePackage);

  const handleUpdatePackage = async () => {
    const result = await updatePackageInDB();
    
    if (result.success) {
      Alert.alert(
        "Pacote Atualizado",
        "Pacote atualizado com sucesso!",
        [
          {
            text: "Editar Componentes",
            onPress: () => navigation.navigate('AdicionarComponentes', {
              travelPackage: result.data
            })
          },
          {
            text: "Voltar",
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  const handleCreatePackage = async () => {
    const result = await handleSavePackage();
    
    if (result.success) {
      Alert.alert(
        "Pacote Básico Criado",
        "Agora você deve:\n• Adicionar componentes (hotéis, voos, etc.)\n• Ou voltar ao menu (o pacote será excluído)",
        [
          {
            text: "Adicionar Componentes",
            onPress: () => navigation.navigate('AdicionarComponentes', {
              travelPackage: result.data
            })
          },
          {
            text: "Voltar (Excluir Pacote)",
            style: "destructive",
            onPress: async () => {
              await deletePackage(result.data.id);
              navigation.goBack();
            }
          }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {updatePackage ? `Atualizar Pacote ID: ${updatePackage.id}` : 'Criar Novo Pacote'}
        </Text>
        <Text style={styles.subtitle}>Preencha os dados do pacote de viagem</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Título (opcional)</Text>
          <TextInput
            mode="outlined"
            value={packageData.title}
            onChangeText={(text) => handleChangeBasicPackage('title', text)}
            placeholder="Ex: Pacote Rio de Janeiro"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Destino *</Text>
          <TextInput
            mode="outlined"
            value={packageData.destination}
            onChangeText={(text) => handleChangeBasicPackage('destination', text)}
            placeholder="Ex: Paris"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Origem *</Text>
          <TextInput
            mode="outlined"
            value={packageData.origin}
            onChangeText={(text) => handleChangeBasicPackage('origin', text)}
            placeholder="Ex: Rio de Janeiro"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Data de Partida * (AAAA-MM-DD)</Text>
          <TextInput
            mode="outlined"
            value={packageData.departureDate.slice(0,10)}
            onChangeText={(text) => handleChangeBasicPackage('departureDate', text)}
            placeholder="2025-12-20"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Data de Retorno * (AAAA-MM-DD)</Text>
          <TextInput
            mode="outlined"
            value={packageData.returnDate.slice(0,10)}
            onChangeText={(text) => handleChangeBasicPackage('returnDate', text)}
            placeholder="2025-12-27"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            mode="outlined"
            value={packageData.description}
            onChangeText={(text) => handleChangeBasicPackage('description', text)}
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
            onChangeText={(text) => handleChangeBasicPackage('numberOfTravelers', text)}
            placeholder="1"
            keyboardType="numeric"
          />
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.buttonContainer}>
          {updatePackage ? (
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleUpdatePackage}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Atualizando...' : 'Atualizar Pacote'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleCreatePackage}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Salvando...' : 'Salvar Pacote'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    alignSelf: 'center',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#64748b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
