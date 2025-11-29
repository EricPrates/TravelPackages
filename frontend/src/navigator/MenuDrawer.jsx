import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../View/HomeScreen';
import { useAuth } from '../AuthContext';
import WalletScreen from '../View/WalletScreen';
import { useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminPanelScreen from '../View/AdminPanelScreen';
import CreatePackageScreen from '../View/CreatePackageScreen';
import AddComponentsScreen from '../View/AddComponentsScreen';
import SelectComponentScreen from '../View/SelectComponentScreen';
import PackageDetailsScreen from '../View/PackageDetailsScreen';
const Drawer = createDrawerNavigator();
export default function MenuDrawer() {
  const { user } = useAuth();

  const dimensions = useWindowDimensions();
  return (
    <Drawer.Navigator initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#6796f3ff' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerType: dimensions.width >= 768 ? 'permanent' : 'front',
        drawerStyle: { backgroundColor: '#fcfcffff', width: '80%' },
        overlayColor: 'rgba(181, 187, 227, 0.5)',
      }} defaultStatus='open'
    >
      <Drawer.Screen name="Home" options={{
        drawerLabel: 'Início',
        drawerIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home-outline" size={size} color={color} />
        )
      }}
        component={HomeScreen} />
      
      <Drawer.Screen name="Carteira" options={{
        drawerLabel: 'Carteira',
        drawerIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account-outline" size={size} color={color} />
        )
      }} component={WalletScreen} />

      {user.role === 'agent' && (
        <>
          <Drawer.Screen name="AdminPanel" options={{
            drawerLabel: 'Painel Admin',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="shield-account-outline" size={size} color={color} />
            )
          }} component={AdminPanelScreen} />
          
          <Drawer.Screen name="CriarPacote" options={{
            drawerLabel: 'Criar Pacote',
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="package-variant-plus" size={size} color={color} />
            )
          }} component={CreatePackageScreen} />
          
          <Drawer.Screen name="AdicionarComponentes" options={{
            drawerLabel: 'Adicionar Componentes',
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="puzzle-plus" size={size} color={color} />
            )
          }} component={AddComponentsScreen} />
          <Drawer.Screen name="SelecionarComponentes" options={{
            drawerLabel: 'Selecionar Componentes',
            
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="puzzle-plus" size={size} color={color} />
            )
          }} component={SelectComponentScreen} />
          <Drawer.Screen name="PackageDetails" options={{
            drawerLabel: 'Detalhes do Pacote',
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="puzzle-plus" size={size} color={color} />
            )
          }} component={PackageDetailsScreen} />
        </>
      )}
    </Drawer.Navigator>
  );
}
