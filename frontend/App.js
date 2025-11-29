import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './src/AuthContext';
import MenuDrawer from './src/navigator/MenuDrawer';
import LoginScreen from './src/View/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from './src/View/RegisterScreen';
import AdminPanelScreen from './src/View/AdminPanelScreen';
import CreatePackageScreen from './src/View/CreatePackageScreen';
import AddComponentScreen from './src/View/AddComponentsScreen';
import SelectComponentScreen from './src/View/SelectComponentScreen';
import PackageDetailsScreen from './src/View/PackageDetailsScreen';
const Stack = createStackNavigator();

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  
  if(isAuthenticated){
    
    return <NavigationContainer><MenuDrawer /></NavigationContainer>
  }
  else {

    return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CriarPacote" component={CreatePackageScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdicionarComponentes" component={AddComponentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SelecionarComponentes" component={SelectComponentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PackageDetails" component={PackageDetailsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
    );
  }
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </AuthProvider>
  );
}