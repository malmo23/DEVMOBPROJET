import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, signOut } from 'firebase/auth';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadows } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleForgotOpen = () => {
    setResetEmail(email);
    setResetDone(false);
    setShowForgot(true);
  };

  const handleSendReset = async () => {
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim().toLowerCase());
      setResetDone(true);
    } catch (e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-email') {
        Alert.alert('Error', 'No account found with that email address.');
      } else if (e.code === 'auth/too-many-requests') {
        Alert.alert('Too many requests', 'Please wait a few minutes before trying again.');
      } else {
        Alert.alert('Error', e.message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      if (!cred.user.emailVerified) {
        await signOut(auth);
        setError('Your email is not verified. Check your inbox for the verification link.');
        setLoading(false);
        return;
      }
    } catch (e) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        setError('Incorrect email or password. Please try again.');
      } else if (e.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a few minutes before trying again.');
      } else if (e.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="leaf" size={32} color={colors.primary} />
        </View>
        <Text style={styles.appName}>FoodRisk</Text>
        <Text style={styles.tagline}>Welcome back</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(''); }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#b91c1c" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity onPress={handleForgotOpen} style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <Button title="Sign In" onPress={handleLogin} color={colors.primary} style={{ marginTop: 8 }} />
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal transparent animationType="fade" visible={showForgot} onRequestClose={() => setShowForgot(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {resetDone ? (
              <>
                <Ionicons name="checkmark-circle" size={52} color="#10b981" style={{ marginBottom: 12 }} />
                <Text style={styles.modalTitle}>Email Sent!</Text>
                <Text style={styles.modalMsg}>
                  {'A password reset link was sent to '}
                  <Text style={{ fontWeight: '700', color: colors.primary }}>{resetEmail.trim().toLowerCase()}</Text>
                  {'.\nCheck your inbox and spam folder.'}
                </Text>
                <TouchableOpacity onPress={() => setShowForgot(false)} style={styles.modalBtn}>
                  <Text style={styles.modalBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="key-outline" size={40} color={colors.primary} style={{ marginBottom: 12 }} />
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Text style={styles.modalMsg}>Enter your account email and we'll send you a reset link.</Text>
                <View style={styles.modalInput}>
                  <Ionicons name="mail-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontSize: 15, color: colors.text, paddingVertical: 10 }}
                    placeholder="your@email.com"
                    placeholderTextColor="#aaa"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus
                  />
                </View>
                {resetLoading ? (
                  <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 16 }} />
                ) : (
                  <TouchableOpacity
                    onPress={handleSendReset}
                    style={[styles.modalBtn, !resetEmail.trim() && { opacity: 0.4 }]}
                    disabled={!resetEmail.trim()}
                  >
                    <Text style={styles.modalBtnText}>Send Reset Link</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowForgot(false)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(16,185,129,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2, borderColor: 'rgba(16,185,129,0.4)',
  },
  appName: { ...typography.h1, color: colors.white, marginBottom: 4 },
  tagline: { ...typography.body, color: colors.textLight },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  label: { ...typography.label, color: colors.textMuted, marginBottom: 6, marginTop: 12, textTransform: 'uppercase' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  inputIcon: { marginRight: 8 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 6 },
  forgotText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
  },
  eyeBtn: { padding: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28,
  },
  modalBox: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 12,
  },
  modalTitle: { ...typography.h2, color: colors.text, marginBottom: 8 },
  modalMsg: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  modalInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9fafb', borderRadius: radius.md,
    borderWidth: 1.5, borderColor: '#e5e7eb',
    paddingHorizontal: 12, width: '100%', marginBottom: 16,
  },
  modalBtn: {
    backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: radius.full, width: '100%', alignItems: 'center', marginBottom: 10,
  },
  modalBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  modalCancelBtn: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  modalCancelText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 10, padding: 12, marginBottom: 4, marginTop: 8,
  },
  errorText: { color: '#b91c1c', fontSize: 13, fontWeight: '600', flex: 1 },
});
