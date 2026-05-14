import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebaseConfig';
import {
  updateProfile, sendEmailVerification, sendPasswordResetEmail, signOut, verifyBeforeUpdateEmail, updateEmail,
} from 'firebase/auth';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadows } from '../theme';

function ActionRow({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.actionRow, danger && styles.dangerRow]} activeOpacity={0.7}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={[styles.actionLabel, danger && styles.dangerLabel]}>{label}</Text>
      <Text style={[styles.actionChevron, danger && styles.dangerLabel]}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(auth.currentUser);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [healthConditions, setHealthConditions] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [isEditingHealth, setIsEditingHealth] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        if (!isEditing) { setName(u.displayName || ''); setEmail(u.email || ''); }
      }
    });
    
    // Load health conditions
    const loadHealth = async () => {
      const { getHealthConditions } = require('../../database/sqlite');
      const conditions = await getHealthConditions();
      setHealthConditions(conditions);
    };
    loadHealth();

    return unsub;
  }, [isEditing]);

  const handleSaveHealth = async () => {
    setLoading(true);
    try {
      const { saveHealthConditions } = require('../../database/sqlite');
      await saveHealthConditions(healthConditions);
      Alert.alert('Success', 'Health profile updated!');
      setIsEditingHealth(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save health profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    const currentList = healthConditions ? healthConditions.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (!currentList.some(c => c.toLowerCase() === newCondition.trim().toLowerCase())) {
      const updated = [...currentList, newCondition.trim()].join(', ');
      setHealthConditions(updated);
    }
    setNewCondition('');
  };

  const handleRemoveCondition = (index) => {
    const currentList = healthConditions.split(',').map(s => s.trim()).filter(Boolean);
    currentList.splice(index, 1);
    setHealthConditions(currentList.join(', '));
  };

  const initials = (user?.displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleUpdate = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
    setLoading(true);
    try {
      if (name !== user.displayName) await updateProfile(user, { displayName: name });
      if (email !== user.email) {
        try {
          await verifyBeforeUpdateEmail(user, email);
          Alert.alert('Check your email', `Verification sent to ${email}.`);
        } catch {
          await updateEmail(user, email);
          Alert.alert('Success', 'Email updated.');
        }
      } else {
        Alert.alert('Success', 'Profile updated!');
      }
      setIsEditing(false);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await user.reload();
      await sendEmailVerification(auth.currentUser);
      Alert.alert('Sent', `Verification link sent to ${auth.currentUser.email}.`);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert('Sent', 'Password reset email sent.');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  if (!user) return null;

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
          <Text style={{ fontSize: 24, color: colors.white }}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Header */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user.displayName || 'User'}</Text>
        <View style={[styles.verifiedBadge, { backgroundColor: user.emailVerified ? '#d1fae522' : '#fef3c722', borderColor: user.emailVerified ? colors.primary : colors.amber }]}>
          <Text style={[styles.verifiedText, { color: user.emailVerified ? colors.primary : colors.amber }]}>
            {user.emailVerified ? '✅ Verified Account' : '⚠️ Email not verified'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Profile Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Profile Info</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.fieldLabel}>FULL NAME</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={name} onChangeText={setName} />
          ) : (
            <Text style={styles.fieldValue}>{user.displayName || 'Not Set'}</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          ) : (
            <Text style={styles.fieldValue}>{user.email}</Text>
          )}

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : isEditing ? (
            <View style={styles.editActions}>
              <Button title="Save Changes" onPress={handleUpdate} color={colors.primary} style={{ flex: 1, marginRight: 6 }} />
              <Button title="Cancel" onPress={() => setIsEditing(false)} color={colors.textMuted} style={{ flex: 1, marginLeft: 6 }} />
            </View>
          ) : null}
        </View>

        {/* Health Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🧬 Health Profile</Text>
            {!isEditingHealth && (
              <TouchableOpacity onPress={() => setIsEditingHealth(true)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.fieldLabel}>MY HEALTH CONDITIONS & ALLERGIES</Text>
          
          <View style={styles.chipsContainer}>
            {(healthConditions ? healthConditions.split(',').map(s => s.trim()).filter(Boolean) : []).map((condition, index) => (
              <View key={index} style={styles.healthChip}>
                <Text style={styles.healthChipText}>{condition}</Text>
                {isEditingHealth && (
                  <TouchableOpacity onPress={() => handleRemoveCondition(index)} style={styles.removeChip}>
                    <Text style={styles.removeChipText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {!isEditingHealth && !healthConditions && (
              <Text style={styles.fieldValue}>No conditions set</Text>
            )}
          </View>

          {isEditingHealth && (
            <View style={styles.addConditionContainer}>
              <TextInput
                style={styles.addInput}
                value={newCondition}
                onChangeText={setNewCondition}
                placeholder="Add condition or allergy..."
                placeholderTextColor="#94a3b8"
                onSubmitEditing={handleAddCondition}
              />
              <TouchableOpacity onPress={handleAddCondition} style={styles.addConditionBtn}>
                <Text style={styles.addConditionBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.helperText}>AI uses these to provide personalized risk warnings.</Text>

          {isEditingHealth && (
            <View style={styles.editActions}>
              <Button title="Save Profile" onPress={handleSaveHealth} color={colors.primary} style={{ flex: 1, marginRight: 6 }} />
              <Button title="Cancel" onPress={() => setIsEditingHealth(false)} color={colors.textMuted} style={{ flex: 1, marginLeft: 6 }} />
            </View>
          )}
        </View>

        {/* Security Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security</Text>
          {!user.emailVerified && (
            <ActionRow icon="📩" label="Send Verification Email" onPress={handleVerify} />
          )}
          <ActionRow icon="🔑" label="Reset Password" onPress={handleReset} />
        </View>

        {/* Danger Zone */}
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={[styles.cardTitle, { color: colors.red }]}>Danger Zone</Text>
          <ActionRow icon="🚪" label="Log Out" onPress={handleLogout} danger />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    marginTop: 40,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: { alignItems: 'center', paddingTop: 20, paddingBottom: spacing.lg },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.soft,
  },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: '800' },
  userName: { ...typography.h2, color: colors.white, marginBottom: 8 },
  verifiedBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: radius.full, borderWidth: 1 },
  verifiedText: { ...typography.label, fontWeight: '600' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  dangerCard: { borderWidth: 1.5, borderColor: '#fecaca' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardTitle: { ...typography.h3, color: colors.text },
  editBtn: { backgroundColor: '#dbeafe', paddingHorizontal: 14, paddingVertical: 5, borderRadius: radius.full },
  editBtnText: { color: colors.blue, fontWeight: '700', fontSize: 13 },
  fieldLabel: { ...typography.label, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' },
  fieldValue: { ...typography.body, color: colors.text, fontWeight: '500', marginBottom: spacing.sm },
  input: {
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: radius.md, padding: 12,
    fontSize: 15, color: colors.text,
    backgroundColor: '#f0fdf4', marginBottom: spacing.sm,
  },
  helperText: { ...typography.label, color: colors.primary, marginBottom: spacing.md, opacity: 0.8 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
  editActions: { flexDirection: 'row', marginTop: spacing.sm },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  dangerRow: { borderBottomWidth: 0 },
  actionLabel: { flex: 1, ...typography.body, color: colors.text, fontWeight: '500' },
  actionChevron: { color: colors.textMuted, fontSize: 22 },
  dangerLabel: { color: colors.red },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 4,
  },
  healthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  healthChipText: {
    color: '#065f46',
    fontSize: 14,
    fontWeight: '700',
  },
  removeChip: {
    marginLeft: 8,
    backgroundColor: 'rgba(6, 95, 70, 0.1)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeChipText: {
    color: '#065f46',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addConditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  addConditionBtn: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addConditionBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
