import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { auth } from '../config/firebaseConfig';
import { updateProfile, updateEmail, sendEmailVerification, sendPasswordResetEmail, signOut, verifyBeforeUpdateEmail } from 'firebase/auth';
import Button from '../components/Button';
import Card from '../components/Card';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(auth.currentUser);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen to user changes (e.g. after email verification)
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        // Only update local state if not editing to avoid overwriting user input
        if (!isEditing) {
          setName(u.displayName || '');
          setEmail(u.email || '');
        }
      } else {
        // Logged out
      }
    });
    return unsubscribe;
  }, [isEditing]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
        Alert.alert("Success", "Profile updated successfully!");
      }

      if (email !== user.email) {
        // For security, changing email often requires recent login or verification
        // verifyBeforeUpdateEmail is safer and newer, but check if available in your SDK version
        // If not, revert to updateEmail (which might throw requires-recent-login)
        try {
          await verifyBeforeUpdateEmail(user, email);
          Alert.alert("Check your email", `Verification email sent to ${email}. Please verify to complete the change.`);
        } catch (e) {
          // Fallback or specific error handling
          await updateEmail(user, email);
          Alert.alert("Success", "Email updated! You may need to verify it.");
        }
      }
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setLoading(true);
    try {
      console.log("Reloading user before verification...");
      await user.reload();
      const freshUser = auth.currentUser;

      console.log("Sending verification email to:", freshUser.email);
      await sendEmailVerification(freshUser);

      Alert.alert(
        "Email Sent",
        `Verification link sent to ${freshUser.email}.\n\nPlease check your Inbox and Spam folder.`
      );
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("Error sending email", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert("Sent", "Password reset email sent. Please check your inbox.");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigation handled by RootNavigator
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  if (!user) return null; // Should be handled by RootNavigator redirecting to AuthStack

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.header}>👤 My Profile</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Name:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          ) : (
            <Text selectable={true} style={styles.value}>{user.displayName || 'Not Set'}</Text>
          )}

          <Text style={styles.label}>Email:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <View>
              <Text selectable={true} style={styles.value}>{user.email}</Text>
              <Text style={[styles.status, { color: user.emailVerified ? '#10b981' : '#f59e0b' }]}>
                {user.emailVerified ? '✅ Verified' : '⚠️ Not Verified'}
              </Text>
            </View>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 20 }} />
        ) : (
          <>
            {isEditing ? (
              <View style={styles.row}>
                <Button title="Save" onPress={handleUpdateProfile} color="#10b981" />
                <View style={{ width: 10 }} />
                <Button title="Cancel" onPress={() => setIsEditing(false)} color="#6b7280" />
              </View>
            ) : (
              <Button title="Edit Profile" onPress={() => setIsEditing(true)} color="#3b82f6" />
            )}

            <View style={styles.divider} />

            {!user.emailVerified && (
              <TouchableOpacity style={styles.actionButton} onPress={handleSendVerification}>
                <Text style={styles.actionText}>📩 Send Verification Email</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionButton} onPress={handleResetPassword}>
              <Text style={styles.actionText}>🔑 Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
              <Text style={[styles.actionText, styles.logoutText]}>🚪 Log Out</Text>
            </TouchableOpacity>
          </>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ecfdf5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#064e3b',
  },
  infoContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 10,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  actionButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 5,
  },
  actionText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 10,
  },
  logoutText: {
    color: '#ef4444',
  },
});

