import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CopyableText from '../components/CopyableText';
import Button from '../components/Button';
import { analyzeBarcode, generateAIAnalysis } from '../services/scannerService';
import { colors, typography, spacing, radius, shadows } from '../theme';

const TestChip = ({ label, code, onPress }) => (
  <TouchableOpacity onPress={() => onPress(code)} style={styles.chip} activeOpacity={0.7}>
    <Text style={styles.chipLabel}>{label}</Text>
    <Text style={styles.chipCode}>{code}</Text>
    <Text style={styles.chipHint}>tap to search</Text>
  </TouchableOpacity>
);

export default function ManualEntryScreen({ navigation }) {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleAnalyze = async (codeOverride) => {
    const override = typeof codeOverride === 'string' ? codeOverride : null;
    const code = (override || barcode).trim();
    if (!code) {
      alert('Please enter a barcode');
      return;
    }
    setBarcode(code);
    setNotFound(false);
    setLoading(true);
    try {
      const result = await analyzeBarcode(code);
      navigation.replace('Result', { result });
    } catch (error) {
      console.log('ManualEntry error:', error.message, error);
      setLoading(false);
      setNotFound(true);
    }
  };

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Barcode</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Icon + Title */}
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="keypad-outline" size={30} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Manual Barcode</Text>
              <Text style={styles.cardSubtitle}>Type or paste any EAN/UPC barcode</Text>
            </View>
          </View>

          {/* Test chips */}
          <View style={styles.chipsSection}>
            <Text style={styles.sectionLabel}>TRY THESE EXAMPLES</Text>
            <View style={styles.chips}>
              <TestChip label="🥜 Nutella" code="3017620422003" onPress={handleAnalyze} />
              <TestChip label="🥤 Coca-Cola" code="5449000000996" onPress={handleAnalyze} />
            </View>
          </View>

          {/* Input */}
          <Text style={styles.inputLabel}>BARCODE NUMBER</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="barcode-outline" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 3017620422003"
              placeholderTextColor="#aaa"
              value={barcode}
              onChangeText={setBarcode}
              keyboardType="number-pad"
              editable={!loading}
            />
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Analyzing product…</Text>
            </View>
          ) : (
            <Button title="Analyze Product" onPress={() => handleAnalyze()} color={colors.primary} />
          )}
        </View>

        {notFound && (
          <View style={styles.notFoundCard}>
            <Text style={styles.notFoundIcon}>🔍</Text>
            <Text style={styles.notFoundTitle}>Barcode Not Found</Text>
            <Text style={styles.notFoundSub}>No product matched "{barcode}" in the database.</Text>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={async () => {
                setNotFound(false);
                setLoading(true);
                try {
                  const aiResult = await generateAIAnalysis(`product with barcode ${barcode}`, null);
                  navigation.replace('Result', { result: aiResult });
                } catch (e) {
                  setLoading(false);
                }
              }}
            >
              <Ionicons name="sparkles" size={20} color={colors.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aiButtonText}>Analyze with AI instead</Text>
                <Text style={styles.aiButtonSub}>Get a health risk estimate using AI</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: colors.white },
  headerTitle: { ...typography.h3, color: colors.white },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    margin: spacing.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  iconCircle: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#d1fae5',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardTitle: { ...typography.h3, color: colors.text },
  cardSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  chipsSection: { marginBottom: spacing.lg },
  chips: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1, backgroundColor: '#fef3c7',
    borderRadius: radius.md, padding: 10,
    borderWidth: 1, borderColor: '#fde68a',
    alignItems: 'center',
  },
  chipLabel: { ...typography.label, color: '#92400e', marginBottom: 2 },
  chipCode: { ...typography.caption, color: '#b45309', fontFamily: 'monospace' },
  chipHint: { fontSize: 10, color: '#a78040', marginTop: 4, fontStyle: 'italic' },
  inputLabel: { ...typography.label, color: colors.textMuted, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.primary,
    paddingHorizontal: 14,
    marginBottom: spacing.md,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text },
  loadingBox: { alignItems: 'center', paddingVertical: 24 },
  loadingText: { ...typography.body, color: colors.primary, marginTop: spacing.sm, fontWeight: '600' },
  notFoundCard: {
    marginHorizontal: spacing.lg, marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  notFoundIcon: { fontSize: 40, marginBottom: 10 },
  notFoundTitle: { ...typography.h3, color: colors.white, marginBottom: 6 },
  notFoundSub: { ...typography.caption, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: spacing.lg },
  aiButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: radius.xl, borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    padding: 16, width: '100%',
  },
  aiButtonText: { fontSize: 15, fontWeight: '700', color: colors.white },
  aiButtonSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
});
