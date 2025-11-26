import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../View/HomeScreen';
import WalletScreen from '../View/WalletScreen';
import ProfileScreen from '../View/ProfileScreen';;
import { useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();
export default function MenuDrawer() {
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
            <Drawer.Screen name="TravelListScreen" options={{
            drawerLabel: 'Pacotes de Viagens',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase-outline" size={size} color={color} />
          )
        }} component={TravelListScreen} />
            <Drawer.Screen name="Perfil" options={{
            drawerLabel: 'Perfil',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          )
        }} component={ProfileScreen} />
        </Drawer.Navigator>
    );
}
