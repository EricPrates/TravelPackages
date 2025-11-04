import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../src/View/HomeScreen';
import TravelListScreen from '../src/View/TravelListScreen';
import ProfileScreen from '../src/View/ProfileScreen';;
import { useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
const Drawer = createDrawerNavigator();
export default function MenuDrawer() {
    const dimensions = useWindowDimensions();
    return (
        <Drawer.Navigator initialRouteName="Home" 
        screenOptions={{
        drawerType: dimensions.width >= 768 ? 'permanent' : 'back',
        drawerStyle: dimensions.width >= 768 ? null : { width: '100%' },
        overlayColor: 'transparent',
        }} defaultStatus='open'
>
            <Drawer.Screen name="Home" options={{ drawerLabel: 'Início',
             drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" size={size} color={color} />
          )
}} component={HomeScreen} />
            <Drawer.Screen name="TravelList" options={{ drawerLabel: 'Pacotes Disponíveis',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="briefcase-outline" size={size} color={color} />
            )
}} component={TravelListScreen} />
            <Drawer.Screen name="Profile" options={{ drawerLabel: 'Perfil',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-outline" size={size} color={color} />
            )
}} component={ProfileScreen} />
        </Drawer.Navigator>
    );
}
