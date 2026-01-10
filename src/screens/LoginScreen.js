import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { auth } from '../config/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Button from '../components/Button';
import Card from '../components/Card';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Navigation will be handled by the auth state listener in RootNavigator
        } catch (error) {
            Alert.alert('Login Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Card>
                <Text style={styles.title}>Welcome Back!</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#10b981" />
                ) : (
                    <Button
                        title="Login"
                        onPress={handleLogin}
                        color="#10b981"
                    />
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <Text
                        style={styles.link}
                        onPress={() => navigation.navigate('Register')}
                    >
                        Register
                    </Text>
                </View>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#ecfdf5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#064e3b',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#374151',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#4b5563',
    },
    link: {
        color: '#10b981',
        fontWeight: 'bold',
    },
});
