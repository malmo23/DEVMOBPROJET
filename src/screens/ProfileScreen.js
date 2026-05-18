import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, ActivityIndicator, TouchableOpacity, StatusBar, Platform, Animated, Modal, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebaseConfig';
import { saveHealthConditionsCloud, getHealthConditionsCloud, subscribeHealthConditions } from '../services/foodService';
import {
  updateProfile, sendEmailVerification, sendPasswordResetEmail, signOut, verifyBeforeUpdateEmail,
} from 'firebase/auth';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadows } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

function Toast({ message, type }) {
  const bg = type === 'error' ? '#ef4444' : type === 'warn' ? '#f59e0b' : '#10b981';
  const icon = type === 'error' ? 'close-circle' : type === 'warn' ? 'warning' : 'checkmark-circle';
  return (
    <View style={[toastStyles.container, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={20} color="#fff" style={{ marginRight: 10 }} />
      <Text style={toastStyles.text} numberOfLines={2}>{message}</Text>
    </View>
  );
}

const toastStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14,
    borderRadius: 14, marginHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 10,
  },
  text: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
});

function ActionRow({ iconName, label, onPress, danger, loading, disabled }) {
  const inactive = loading || disabled;
  return (
    <TouchableOpacity
      onPress={inactive ? undefined : onPress}
      style={[styles.actionRow, danger && styles.dangerRow, inactive && { opacity: 0.5 }]}
      activeOpacity={inactive ? 1 : 0.7}
    >
      <Ionicons name={iconName} size={20} color={danger ? colors.red : colors.textMuted} />
      <Text style={[styles.actionLabel, danger && styles.dangerLabel]}>{label}</Text>
      {loading
        ? <ActivityIndicator size="small" color={danger ? colors.red : colors.primary} />
        : disabled
          ? <Ionicons name="time-outline" size={18} color={colors.textMuted} />
          : <Ionicons name="chevron-forward" size={18} color={danger ? colors.red : colors.textMuted} />
      }
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { toggleLanguage, nextLangLabel, t } = useLanguage();
  const [user, setUser] = useState(auth.currentUser);
  const [toast, setToast] = useState(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.spring(toastAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
      Animated.delay(2800),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyCooldown, setVerifyCooldown] = useState(0);
  const verifyCooldownRef = useRef(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);
  const resetCooldownRef = useRef(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [healthConditions, setHealthConditions] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', async (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await currentUser.reload();
          const refreshed = auth.currentUser;
          setUser({ ...refreshed });
          if (pendingEmail && refreshed.email === pendingEmail && refreshed.emailVerified) {
            setPendingEmail(null);
          }
        }
      }
      appStateRef.current = nextState;
    });
    return () => appStateSub.remove();
  }, [pendingEmail]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        if (!isEditing) { setName(u.displayName || ''); setEmail(u.email || ''); }
      }
    });

    // Real-time Firestore listener — updates instantly when any device saves
    const unsubHealth = subscribeHealthConditions(async (cloudConditions) => {
      if (!isEditingHealth) {
        setHealthConditions(cloudConditions);
        // Keep local in sync
        try {
          const { saveHealthConditions } = require('../../database/sqlite');
          await saveHealthConditions(cloudConditions);
        } catch (_) {}
      }
    });

    // On first load: if cloud is empty, migrate local data up
    (async () => {
      try {
        const cloud = await getHealthConditionsCloud();
        if (!cloud) {
          const { getHealthConditions, saveHealthConditions } = require('../../database/sqlite');
          const local = await getHealthConditions();
          if (local) {
            await saveHealthConditionsCloud(local);
            console.log('Migrated local health profile to cloud');
          }
        }
      } catch (_) {}
    })();

    return () => {
      unsub(); unsubHealth();
      clearInterval(verifyCooldownRef.current);
      clearInterval(resetCooldownRef.current);
    };
  }, [isEditing, isEditingHealth]);

  const handleSaveHealth = async () => {
    setLoading(true);
    const { saveHealthConditions } = require('../../database/sqlite');
    let cloudOk = false;
    try {
      await saveHealthConditionsCloud(healthConditions);
      cloudOk = true;
    } catch (e) {
      console.warn('Cloud save failed:', e.message);
    }
    try {
      await saveHealthConditions(healthConditions);
    } catch (_) {}

    setLoading(false);
    setIsEditingHealth(false);
    if (cloudOk) {
      showToast(t('syncedMsg'));
    } else {
      showToast(t('savedLocallyMsg'), 'warn');
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
    if (!name.trim()) { showToast('Name cannot be empty', 'error'); return; }
    setLoading(true);
    try {
      if (name !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
      if (email.trim().toLowerCase() !== user.email) {
        if (!auth.currentUser.emailVerified) {
          showToast('Please verify your current email address before changing it.', 'warn');
          setLoading(false);
          return;
        }
        const newEmail = email.trim().toLowerCase();
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
        setPendingEmail(newEmail);
        showToast(`A confirmation link was sent to ${newEmail}. Click it to apply the change.`);
        setEmail(user.email);
      } else {
        showToast('Profile updated!');
      }
      setIsEditing(false);
    } catch (e) {
      if (e.code === 'auth/operation-not-allowed') {
        showToast('Email change is not allowed until your current email is verified.', 'warn');
      } else if (e.code === 'auth/requires-recent-login') {
        showToast('For security, please log out and log back in before changing your email.', 'warn');
      } else if (e.code === 'auth/invalid-email') {
        showToast('The new email address is not valid.', 'error');
      } else if (e.code === 'auth/email-already-in-use') {
        showToast('This email is already linked to another account.', 'error');
      } else {
        showToast(e.message, 'error');
      }
    } finally { setLoading(false); }
  };

  const startCooldown = (setter, ref, seconds = 60) => {
    setter(seconds);
    ref.current = setInterval(() => {
      setter(prev => {
        if (prev <= 1) { clearInterval(ref.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (verifyLoading || verifyCooldown > 0) return;
    setVerifyLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) { showToast('No user logged in.', 'error'); setVerifyLoading(false); return; }
      await sendEmailVerification(currentUser);
      showToast(`Verification email sent to ${currentUser.email}`);
      startCooldown(setVerifyCooldown, verifyCooldownRef);
    } catch (e) {
      if (e.code === 'auth/too-many-requests') {
        showToast('A verification email was already sent. Please check your inbox (or spam folder).', 'warn');
        startCooldown(setVerifyCooldown, verifyCooldownRef, 120);
      } else {
        showToast(e.message, 'error');
      }
    } finally { setVerifyLoading(false); }
  };

  const handleReset = async () => {
    if (resetLoading || resetCooldown > 0) return;
    setResetLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) { showToast('No email address found.', 'error'); setResetLoading(false); return; }
      await sendPasswordResetEmail(auth, currentUser.email);
      showToast(`Password reset email sent to ${currentUser.email}`);
      startCooldown(setResetCooldown, resetCooldownRef);
    } catch (e) {
      if (e.code === 'auth/too-many-requests') {
        showToast('A reset email was already sent. Please check your inbox (or spam folder).', 'warn');
        startCooldown(setResetCooldown, resetCooldownRef, 120);
      } else {
        showToast(e.message, 'error');
      }
    } finally { setResetLoading(false); }
  };

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    setLogoutLoading(true);
    try {
      await signOut(auth);
    } catch (e) {
      showToast(e.message, 'error');
      setLogoutLoading(false);
    }
  };

  if (!user) return null;

  const toastY = toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] });

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {toast && (
        <Animated.View style={[styles.toastWrapper, { transform: [{ translateY: toastY }], opacity: toastAnim }]}>
          <Toast message={toast.message} type={toast.type} />
        </Animated.View>
      )}

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.getParent('Drawer')?.openDrawer()} style={styles.menuBtn}>
          <Ionicons name="menu" size={24} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
          <Text style={styles.langBtnText}>{nextLangLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Header */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user.displayName || 'User'}</Text>
        <View style={[
          styles.verifiedBadge,
          { backgroundColor: pendingEmail ? '#eff6ff22' : user.emailVerified ? '#d1fae522' : '#fef3c722',
            borderColor: pendingEmail ? '#60a5fa' : user.emailVerified ? colors.primary : colors.amber },
        ]}>
          <Text style={[styles.verifiedText, { color: pendingEmail ? '#60a5fa' : user.emailVerified ? colors.primary : colors.amber }]}>
            {pendingEmail
              ? `📧 Confirm new email: ${pendingEmail}`
              : user.emailVerified ? t('verifiedAccount') : t('notVerified')}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Profile Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('profileInfo')}</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>{t('edit')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.fieldLabel}>{t('fullName')}</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={name} onChangeText={setName} />
          ) : (
            <Text style={styles.fieldValue}>{user.displayName || t('notSet')}</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>{t('emailAddress')}</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          ) : (
            <Text style={styles.fieldValue}>{user.email}</Text>
          )}

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : isEditing ? (
            <View style={styles.editActions}>
              <Button title={t('saveChanges')} onPress={handleUpdate} color={colors.primary} style={{ flex: 1, marginRight: 6 }} />
              <Button title={t('cancel')} onPress={() => setIsEditing(false)} color={colors.textMuted} style={{ flex: 1, marginLeft: 6 }} />
            </View>
          ) : null}
        </View>

        {/* Health Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('healthProfile')}</Text>
            {!isEditingHealth && (
              <TouchableOpacity onPress={() => setIsEditingHealth(true)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>{t('edit')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.fieldLabel}>{t('myConditions')}</Text>
          
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
              <Text style={styles.fieldValue}>{t('noConditions')}</Text>
            )}
          </View>

          {isEditingHealth && (
            <View style={styles.addConditionContainer}>
              <TextInput
                style={styles.addInput}
                value={newCondition}
                onChangeText={setNewCondition}
                placeholder={t('addCondition')}
                placeholderTextColor="#94a3b8"
                onSubmitEditing={handleAddCondition}
              />
              <TouchableOpacity onPress={handleAddCondition} style={styles.addConditionBtn}>
                <Text style={styles.addConditionBtnText}>{t('add')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.helperText}>{t('aiHelper')}</Text>

          {isEditingHealth && (
            <View style={styles.editActions}>
              <Button title={t('saveProfile')} onPress={handleSaveHealth} color={colors.primary} style={{ flex: 1, marginRight: 6 }} />
              <Button title={t('cancel')} onPress={() => setIsEditingHealth(false)} color={colors.textMuted} style={{ flex: 1, marginLeft: 6 }} />
            </View>
          )}
        </View>

        {/* Security Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('security')}</Text>
          {!user.emailVerified && (
            <ActionRow
              iconName="mail-outline"
              label={
                verifyLoading ? '...' :
                verifyCooldown > 0 ? `${t('sendVerification')} (${verifyCooldown}s)` :
                t('sendVerification')
              }
              onPress={handleVerify}
              loading={verifyLoading}
              disabled={verifyCooldown > 0}
            />
          )}
          <ActionRow
            iconName="key-outline"
            label={
              resetLoading ? '...' :
              resetCooldown > 0 ? `${t('resetPassword')} (${resetCooldown}s)` :
              t('resetPassword')
            }
            onPress={handleReset}
            loading={resetLoading}
            disabled={resetCooldown > 0}
          />
        </View>

        {/* Danger Zone */}
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={[styles.cardTitle, { color: colors.red }]}>{t('dangerZone')}</Text>
          <ActionRow
            iconName="log-out-outline"
            label={logoutLoading ? '...' : t('logOut')}
            onPress={handleLogout}
            danger
            loading={logoutLoading}
          />
        </View>
      </ScrollView>
      {/* Inline Logout Confirm Modal */}
      <Modal transparent animationType="fade" visible={showLogoutConfirm} onRequestClose={() => setShowLogoutConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="log-out-outline" size={36} color={colors.red} style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>{t('logOutConfirmTitle')}</Text>
            <Text style={styles.modalMsg}>{t('logOutConfirmMsg')}</Text>
            <TouchableOpacity onPress={confirmLogout} style={styles.modalConfirmBtn}>
              <Text style={styles.modalConfirmText}>{t('confirmLogOut')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowLogoutConfirm(false)} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
  },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  langBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
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
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0, right: 0,
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', width: '100%', ...shadows.card,
  },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: 8 },
  modalMsg: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: 24 },
  modalConfirmBtn: {
    backgroundColor: colors.red, paddingVertical: 14,
    borderRadius: radius.full, width: '100%', alignItems: 'center', marginBottom: 10,
  },
  modalConfirmText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  modalCancelBtn: {
    paddingVertical: 12, width: '100%', alignItems: 'center',
  },
  modalCancelText: { color: colors.textMuted, fontWeight: '600', fontSize: 15 },
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
  actionChevron: { color: colors.textMuted },
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
