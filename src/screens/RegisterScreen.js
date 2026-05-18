import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadows } from '../theme';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const BLOCKED_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'guerrillamail.info',
  'spam4.me', 'yopmail.com', 'trashmail.com', 'maildrop.cc', 'dispostable.com',
  'fakeinbox.com', 'mailnull.com', 'spamgourmet.com', 'trashmail.net',
  'discard.email', 'spamhereplease.com', 'spamspot.com', 'tempr.email',
  'getairmail.com', 'filzmail.com', 'throwam.com', 'temp-mail.org',
  'mohmal.com', 'zetmail.com', 'mailtemp.info', 'spamex.com',
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const validateEmail = (value) => {
    const trimmed = value.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address.';
    const domain = trimmed.split('@')[1];
    if (BLOCKED_DOMAINS.includes(domain)) return 'Temporary/disposable email addresses are not allowed.';
    return null;
  };

  const handleRegister = async () => {
    setError('');
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    const emailError = validateEmail(trimmedEmail);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least one uppercase letter and one number.');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      await updateProfile(cred.user, { displayName: trimmedName });
      await sendEmailVerification(cred.user);
      setVerificationSent(true);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try signing in.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address format is not valid.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.verifyCard}>
          <Ionicons name="mail-open-outline" size={64} color={colors.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.verifyTitle}>Verify your email</Text>
          <Text style={styles.verifyBody}>
            {'We sent a verification link to '}
            <Text style={{ fontWeight: '700', color: colors.primary }}>{email.trim().toLowerCase()}</Text>
            {'. \nOpen your email and click the link to activate your account.'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.verifyBtn}>
            <Text style={styles.verifyBtnText}>Go to Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setVerificationSent(false)} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Wrong email? Go back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={32} color={colors.primary} />
          </View>
          <Text style={styles.appName}>FoodRisk</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get Started</Text>

          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.passwordHint}>Must be 8+ characters with 1 uppercase letter and 1 number.</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#b91c1c" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <Button title="Create Account" onPress={handleRegister} color={colors.primary} style={{ marginTop: 8 }} />
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl, paddingTop: 60 },
  logoCircle: {
    width: 68, height: 68, borderRadius: 34,
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
    marginBottom: spacing.xl,
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
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.text },
  eyeBtn: { padding: 4 },
  passwordHint: { fontSize: 11, color: colors.textMuted, marginBottom: 8, marginTop: 2 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 10, padding: 12, marginBottom: 10,
  },
  errorText: { color: '#b91c1c', fontSize: 13, fontWeight: '600', flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  verifyCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', ...shadows.card,
  },
  verifyTitle: { ...typography.h2, color: colors.text, marginBottom: 12, textAlign: 'center' },
  verifyBody: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  verifyBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: radius.full, width: '100%', alignItems: 'center',
  },
  verifyBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
