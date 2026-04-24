import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Keyboard, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import { analyzeProductByName } from '../services/scannerService';
import { colors, typography, spacing, radius, shadows } from '../theme';

const EXAMPLES = ['Coca-Cola', 'Nutella', 'Apple', 'Orange Juice', 'Whole Wheat Bread'];

export default function ProductSearchScreen({ navigation }) {
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!productName.trim()) {
      alert('Please enter a product name');
      return;
    }
    setLoading(true);
    Keyboard.dismiss();
    try {
      const result = await analyzeProductByName(productName);
      navigation.replace('Result', { result });
    } catch (error) {
      alert('Error analyzing product');
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search by Name</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Icon + Title */}
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 30 }}>🔍</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>AI-Powered Search</Text>
              <Text style={styles.cardSubtitle}>Searches the internet for nutritional data</Text>
            </View>
          </View>

          {/* Input */}
          <Text style={styles.inputLabel}>PRODUCT NAME</Text>
          <View style={styles.inputWrapper}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🥗</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Coca-Cola, Nutella…"
              placeholderTextColor="#aaa"
              value={productName}
              onChangeText={setProductName}
              editable={!loading}
            />
            {productName.length > 0 && (
              <TouchableOpacity onPress={() => setProductName('')} style={{ padding: 4 }}>
                <Text style={{ color: '#aaa', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Searching & analyzing…</Text>
            </View>
          ) : (
            <Button title="Search & Analyze" onPress={handleSearch} color={colors.primary} />
          )}

          {/* Example chips */}
          <View style={styles.examplesSection}>
            <Text style={styles.sectionLabel}>QUICK EXAMPLES</Text>
            <View style={styles.chips}>
              {EXAMPLES.map((ex) => (
                <TouchableOpacity
                  key={ex}
                  onPress={() => setProductName(ex)}
                  style={styles.chip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
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
  backIcon: { color: colors.white, fontSize: 28, fontWeight: '300', marginTop: -2 },
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
    backgroundColor: '#ede9fe',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardTitle: { ...typography.h3, color: colors.text },
  cardSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  inputLabel: { ...typography.label, color: colors.textMuted, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.purple,
    paddingHorizontal: 14,
    marginBottom: spacing.md,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text },
  loadingBox: { alignItems: 'center', paddingVertical: 24 },
  loadingText: { ...typography.body, color: colors.primary, marginTop: spacing.sm, fontWeight: '600' },
  examplesSection: { marginTop: spacing.lg },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#ede9fe',
    borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#ddd6fe',
  },
  chipText: { color: '#6d28d9', fontWeight: '600', fontSize: 13 },
});
