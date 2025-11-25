import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './src/AuthContext';
import MenuDrawer from './src/navigator/MenuDrawer';
import LoginScreen from './src/View/LoginScreen';


function MainApp() {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <MenuDrawer /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <MainApp />
    </AuthProvider>
  );
}