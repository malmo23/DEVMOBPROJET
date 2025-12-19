import 'react-native-gesture-handler';
import 'react-native-reanimated'; // Toujours avant NavigationContainer
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
const Drawer = createDrawerNavigator();
// --- Écran Home ---
function HomeScreen({ navigation }) {
return (
<View style={styles.container}>
<Text style={styles.title}>Home Screen</Text>
<Button
title="Go to Profile"
onPress={() => navigation.navigate('Profile')}
/>
</View>
);
}
// --- Écran Profile ---
function ProfileScreen({ navigation }) {
return (
<View style={styles.container}>
<Text style={styles.title}>Profile Screen</Text>
<Button
title="Go to Home"
onPress={() => navigation.navigate('Home')}
/>
</View>
);
}
// --- App principale avec Drawer ---
export default function App() {
  return (
<NavigationContainer>
<Drawer.Navigator
screenOptions={{
headerShown: true, // Affiche le header
drawerType: 'slide', // Slide ou front
}}
>
<Drawer.Screen name="Home" component={HomeScreen} />
<Drawer.Screen name="Profile" component={ProfileScreen} />
</Drawer.Navigator>
</NavigationContainer>
);
}
// --- Styles ---
const styles = StyleSheet.create({
container: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},
title: {
fontSize: 24,
marginBottom: 20,
},
});
