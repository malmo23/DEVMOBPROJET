import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: 40 }}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>FoodRisk</Text>
      </View>
      <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('Main')}>
        <Text style={styles.drawerText}>🏠 Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('Home')}>
        <Text style={styles.drawerText}>🕒 History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('Profile')}>
        <Text style={styles.drawerText}>👤 Account</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        style={[styles.drawerItem, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20, marginBottom: 40 }]}
        onPress={() => signOut(auth)}
      >
        <Text style={[styles.drawerText, { color: '#ef4444' }]}>🚪 Log Out</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

function AppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: { backgroundColor: '#0d2137', width: 260 },
        drawerLabelStyle: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
        drawerActiveBackgroundColor: 'rgba(16,185,129,0.2)',
        drawerActiveTintColor: '#10b981',
        drawerInactiveTintColor: 'rgba(255,255,255,0.6)',
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a1628' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  drawerItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  drawerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
