import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import HomeScreen from '../View/HomeScreen';
import { useAuth } from '../AuthContext';
import WalletScreen from '../View/WalletScreen';
import { useWindowDimensions, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminPanelScreen from '../View/AdminPanelScreen';
import CreatePackageScreen from '../View/CreatePackageScreen';
import AddComponentsScreen from '../View/AddComponentsScreen';
import SelectComponentScreen from '../View/SelectComponentScreen';
import PackageDetailsScreen from '../View/PackageDetailsScreen';
import PurchaseHistoryScreen from '../View/PurchaseHistoryScreen';
import DashboardScreen from '../View/DashboardScreen';
import StatementScreen from '../View/StatementScreen';
import PurchaseDetailsScreen from '../View/PurchaseDetailsScreen';
const Drawer = createDrawerNavigator();

// Custom Drawer Content com botão de logout
function CustomDrawerContent(props) {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Sair"
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="logout" size={size} color="#dc2626" />
        )}
        labelStyle={{ color: '#dc2626' }}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
}

export default function MenuDrawer() {
  const { user } = useAuth();

  const dimensions = useWindowDimensions();
  return (
    <Drawer.Navigator 
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#6796f3ff' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerType: dimensions.width >= 768 ? 'permanent' : 'front',
        drawerStyle: { backgroundColor: '#fcfcffff', width: '80%' },
        overlayColor: 'rgba(181, 187, 227, 0.5)',
      }} 
      defaultStatus='open'
    >
      <Drawer.Screen name="Home" options={{
        drawerLabel: 'Início',
        drawerIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home-outline" size={size} color={color} />
        )
      }}
        component={HomeScreen} />
      
      <Drawer.Screen name="Dashboard" options={{
        drawerLabel: 'Dashboard',
        drawerIcon: ({ color, size}) => (
          <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
        )
      }} component={DashboardScreen} />
      
      <Drawer.Screen name="Carteira" options={{
        drawerLabel: 'Carteira',
        drawerIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="wallet-outline" size={size} color={color} />
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
            drawerItemStyle: { display: 'none' },
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
          <Drawer.Screen name="PurchaseHistory" options={{
            drawerLabel: 'Histórico de Compras',
       
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="history" size={size} color={color} />
            )
          }} component={PurchaseHistoryScreen} />
          <Drawer.Screen name="Extrato" options={{
            drawerLabel: 'Extrato',
            
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />
            )
          }} component={StatementScreen} />
         
          <Drawer.Screen name="PurchaseDetails" options={{
            drawerLabel: 'Detalhes da Compra',
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="puzzle-plus" size={size} color={color} />
            )
          }} component={PurchaseDetailsScreen} />
        </>
      )}
    </Drawer.Navigator>
  );
}
