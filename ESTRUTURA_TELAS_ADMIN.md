# 📱 Estrutura de Telas do Painel Admin

## ✅ Arquivos Criados

### 1. **AdminPanelScreen.jsx** - Tela Principal
- Menu com opções do painel
- Navegação para outras telas
- Botão de logout

### 2. **CreatePackageScreen.jsx** - Criar Pacote
- Formulário completo para criar pacote
- Validação de campos
- Feedback de sucesso/erro
- Navegação de volta ao painel

### 3. **AdminPanel.controller.js** - Controller
- Funções para API (criar, buscar, deletar pacotes)
- Gerenciamento de loading e erros
- Reutilizável em várias telas

---

## 🔧 Como Integrar no App.js

### Opção 1: Com React Navigation (Recomendado)

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/AuthContext';

// Importar telas
import LoginScreen from './src/screens/LoginScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';
import CreatePackageScreen from './src/screens/CreatePackageScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen 
                        name="Login" 
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                        name="AdminPanel" 
                        component={AdminPanelScreen}
                        options={{ 
                            title: 'Painel Admin',
                            headerShown: false 
                        }}
                    />
                    <Stack.Screen 
                        name="CreatePackage" 
                        component={CreatePackageScreen}
                        options={{ 
                            title: 'Criar Pacote',
                            headerBackTitle: 'Voltar'
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </AuthProvider>
    );
}
```

### Instalar dependências:

```bash
cd frontend
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
```

---

## 📂 Estrutura de Pastas

```
frontend/
├── src/
│   ├── screens/
│   │   ├── AdminPanelScreen.jsx      ✅ CRIADO
│   │   ├── CreatePackageScreen.jsx   ✅ CRIADO
│   │   ├── LoginScreen.jsx           (você já tem)
│   │   └── HomeScreen.jsx            (você já tem)
│   ├── controller/
│   │   ├── AdminPanel.controller.js  ✅ CRIADO
│   │   ├── Home.controller.js        (você já tem)
│   │   └── Profile.controller.js     (você já tem)
│   └── AuthContext.jsx               (você já tem)
├── App.js
└── package.json
```

---

## 🎯 Fluxo de Navegação

```
Login
  ↓
AdminPanel (Menu Principal)
  ├─→ Criar Pacote → CreatePackageScreen
  ├─→ Meus Pacotes → MyPackagesScreen (criar depois)
  ├─→ Adicionar Componentes → AddComponentsScreen (criar depois)
  └─→ Vendas → SalesScreen (criar depois)
```

---

## 💡 Vantagens dessa Estrutura

### ✅ Separação de Responsabilidades
- **Screens**: Apenas UI e navegação
- **Controllers**: Lógica de negócio e API
- **Context**: Estado global (auth)

### ✅ Reutilização
- Controller pode ser usado em várias telas
- Componentes isolados e testáveis

### ✅ Manutenibilidade
- Fácil adicionar novas telas
- Fácil modificar funcionalidades
- Código organizado

### ✅ Sem Conflitos de Hooks
- Cada tela tem seus próprios hooks
- Não há hooks condicionais (dentro de switch/case)

---

## 🚀 Próximos Passos

### 1. Criar telas adicionais:

**MyPackagesScreen.jsx** - Listar pacotes do agente
```javascript
import AdminPanelController from '../controller/AdminPanel.controller';

export default function MyPackagesScreen({ navigation }) {
    const { fetchAllPackages, deletePackage } = AdminPanelController();
    // ... implementar lista de pacotes
}
```

**AddComponentsScreen.jsx** - Adicionar voos, hotéis, etc
```javascript
// Formulário para adicionar componentes a um pacote
```

### 2. Melhorias:

- [ ] Adicionar DatePicker para datas
- [ ] Adicionar loading indicators
- [ ] Adicionar validação de formulário mais robusta
- [ ] Adicionar upload de imagens
- [ ] Adicionar busca e filtros

---

## 📝 Exemplo de Uso do Controller

```javascript
import AdminPanelController from '../controller/AdminPanel.controller';

function MinhaTelaCustomizada() {
    const { 
        createBasicPackage, 
        fetchAllPackages, 
        isLoading, 
        error 
    } = AdminPanelController();

    const handleCreate = async () => {
        const result = await createBasicPackage({
            title: 'Pacote Rio',
            destination: 'Rio de Janeiro',
            origin: 'São Paulo',
            departureDate: '2024-12-20',
            returnDate: '2024-12-27',
            numberOfTravelers: 2
        });

        if (result.success) {
            console.log('Pacote criado:', result.data);
        } else {
            console.error('Erro:', result.error);
        }
    };

    return (
        // ... sua UI
    );
}
```

---

## ✅ Resumo

**Sim, é MUITO melhor criar telas separadas!**

Motivos:
1. ✅ Hooks funcionam corretamente
2. ✅ Código mais limpo e organizado
3. ✅ Fácil de manter e expandir
4. ✅ Melhor performance
5. ✅ Navegação nativa do React Navigation

**Estrutura criada e pronta para usar!** 🎉
