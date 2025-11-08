
import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Button } from '@react-navigation/elements';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MenuDrawer from './frontend/navigator/MenuDrawer';


export default function App() {
  return (
    <NavigationContainer>
      <MenuDrawer />
    </NavigationContainer>
  );
}
     
 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
