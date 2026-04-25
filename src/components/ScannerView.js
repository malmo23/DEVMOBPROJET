import { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Button from './Button';
import { colors, typography, spacing, radius, shadows } from '../theme';

export default function ScannerView({ onScan }) {
  const [barcode, setBarcode] = useState('');

  const handleScan = () => {
    if (barcode.trim()) {
      onScan({ data: barcode });
      setBarcode('');
      Keyboard.dismiss();
    } else {
      alert('Please enter a barcode');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView 
        style={styles.container}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold', color: colors.primary }}>Note:</Text> For live camera scanning, build a custom Expo app. Expo Go doesn't support native barcode scanning. Use the entry below for testing.
            </Text>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.label}>ENTER PRODUCT BARCODE</Text>
            <View style={styles.inputWrapper}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>🔢</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3017620422003"
                value={barcode}
                onChangeText={setBarcode}
                keyboardType="number-pad"
                placeholderTextColor="#94a3b8"
                returnKeyType="done"
                onSubmitEditing={handleScan}
              />
            </View>

            <Button 
              title="Analyze Product" 
              onPress={handleScan}
              color={colors.primary}
            />
          </View>

          <View style={styles.testCodesBox}>
            <Text style={styles.testCodesTitle}>POPULAR TEST CODES</Text>
            <View style={styles.testCodeRow}>
              <Text style={styles.testCodeIcon}>🍫</Text>
              <View>
                <Text style={styles.testCodeLabel}>3017620422003</Text>
                <Text style={styles.testCodeSub}>Nutella 400g</Text>
              </View>
            </View>
            <View style={styles.testCodeRow}>
              <Text style={styles.testCodeIcon}>🥤</Text>
              <View>
                <Text style={styles.testCodeLabel}>5449000000996</Text>
                <Text style={styles.testCodeSub}>Coca-Cola</Text>
              </View>
            </View>
          </View>

          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  infoBox: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    textAlign: 'center',
  },
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
    marginBottom: 24,
  },
  label: {
    ...typography.label,
    color: '#64748b',
    marginBottom: 12,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  testCodesBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  testCodesTitle: {
    ...typography.label,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 15,
    letterSpacing: 1.5,
  },
  testCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testCodeIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  testCodeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  testCodeSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  spacer: {
    height: 40,
  },
});
