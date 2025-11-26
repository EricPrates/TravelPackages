import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './src/AuthContext';
import MenuDrawer from './src/navigator/MenuDrawer';
import LoginScreen from './src/View/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();

function AppNavigator() {
  const { isAuthenticated } = useAuth();
  if(isAuthenticated){
    return <MenuDrawer />
  }
  else {
    return <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
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