import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ResultScreen from '../screens/ResultScreen';
import TPHooksScreen from '../screens/TPHooksScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function ScanStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Drawer.Navigator initialRouteName="TPHooks">
      <Drawer.Screen name="Welcome" component={WelcomeScreen} />
      <Drawer.Screen 
        name="Scanner" 
        component={ScanStack} 
        options={{ title: 'Scan Product' }}
      />
      <Drawer.Screen 
        name="TPHooks" 
        component={TPHooksScreen} 
        options={{ title: 'TP 7 - Hooks' }} 
      />
    </Drawer.Navigator>
  );
}
