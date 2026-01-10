import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

import WelcomeScreen from '../screens/WelcomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ManualEntryScreen from '../screens/ManualEntryScreen';
import ProductSearchScreen from '../screens/ProductSearchScreen';
import ResultScreen from '../screens/ResultScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="ManualEntry" component={ManualEntryScreen} />
      <Stack.Screen name="ProductSearch" component={ProductSearchScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerType: 'slide',
      }}
    >
      <Drawer.Screen name="Main" component={MainStack} />
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

export default function RootNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}
