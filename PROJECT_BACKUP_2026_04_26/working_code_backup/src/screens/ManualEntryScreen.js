import { useState } from 'react';
<<<<<<< HEAD:PROJECT_BACKUP_2026_04_26/working_code_backup/src/screens/ManualEntryScreen.js
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
=======
import { View, Text, TextInput, ScrollView, StyleSheet, Keyboard, ActivityIndicator, TouchableOpacity, StatusBar, Image } from 'react-native';
>>>>>>> da63750186e4107408e0d0729508d7c7f931f792:src/screens/ProductSearchScreen.js
import { LinearGradient } from 'expo-linear-gradient';
import CopyableText from '../components/CopyableText';
import Button from '../components/Button';
<<<<<<< HEAD:PROJECT_BACKUP_2026_04_26/working_code_backup/src/screens/ManualEntryScreen.js
import { analyzeBarcode } from '../services/scannerService';
=======
import { searchProducts, generateAIAnalysis } from '../services/scannerService';
>>>>>>> da63750186e4107408e0d0729508d7c7f931f792:src/screens/ProductSearchScreen.js
import { colors, typography, spacing, radius, shadows } from '../theme';

const TestChip = ({ label, code, onPress }) => (
  <TouchableOpacity onPress={() => onPress(code)} style={styles.chip} activeOpacity={0.7}>
    <Text style={styles.chipLabel}>{label}</Text>
    <Text style={styles.chipCode}>{code}</Text>
  </TouchableOpacity>
);

export default function ManualEntryScreen({ navigation }) {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

<<<<<<< HEAD:PROJECT_BACKUP_2026_04_26/working_code_backup/src/screens/ManualEntryScreen.js
  const handleAnalyze = async () => {
    if (!barcode.trim()) {
      alert('Please enter a barcode');
=======
  const handleSearch = async (name = productName) => {
    if (loading) return; // Prevent multiple concurrent searches

    const query = name || productName;
    if (!query.trim()) {
      alert('Please enter a product name');
>>>>>>> da63750186e4107408e0d0729508d7c7f931f792:src/screens/ProductSearchScreen.js
      return;
    }
    
    setLoading(true);
<<<<<<< HEAD:PROJECT_BACKUP_2026_04_26/working_code_backup/src/screens/ManualEntryScreen.js
    try {
      const result = await analyzeBarcode(barcode);
      navigation.replace('Result', { result });
    } catch (error) {
      alert('Error analyzing barcode');
=======
    Keyboard.dismiss();
    
    try {
      // Small artificial delay for "AI thinking" feel
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data = await searchProducts(query);
      console.log('Results received:', data.length);
      
      setResults(data);
      setHasSearched(true);
    } catch (error) {
      console.log('Search Error:', error);
      alert('Error searching products');
    } finally {
>>>>>>> da63750186e4107408e0d0729508d7c7f931f792:src/screens/ProductSearchScreen.js
      setLoading(false);
    }
  };

  const selectProduct = (item) => {
    navigation.replace('Result', { result: item });
  };

  const handleAIFallback = () => {
    const aiResult = generateAIAnalysis(productName, null);
    navigation.replace('Result', { result: aiResult });
  };

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f172a']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
<<<<<<< HEAD:PROJECT_BACKUP_2026_04_26/working_code_backup/src/screens/ManualEntryScreen.js
        <Text style={styles.headerTitle}>Enter Barcode</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Icon + Title */}
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 30 }}>⌨️</Text>
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
              <TestChip label="🥜 Nutella" code="3017620422003" onPress={setBarcode} />
              <TestChip label="🥤 Coca-Cola" code="5449000000996" onPress={setBarcode} />
            </View>
          </View>

          {/* Input */}
          <Text style={styles.inputLabel}>BARCODE NUMBER</Text>
          <View style={styles.inputWrapper}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>📷</Text>
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
            <Button title="Analyze Product" onPress={handleAnalyze} color={colors.primary} />
          )}
        </View>
=======
        <Text style={styles.headerTitle}>Find Food</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled" 
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.searchCard}>
          <Text style={styles.inputLabel}>WHAT ARE YOU LOOKING FOR?</Text>
          <View style={styles.inputWrapper}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Nutella, Prince, Coke..."
              placeholderTextColor="#94a3b8"
              value={productName}
              onChangeText={(txt) => {
                setProductName(txt);
                if (hasSearched && results.length > 0) setHasSearched(false);
              }}
              returnKeyType="search"
              onSubmitEditing={() => handleSearch()}
              editable={!loading}
            />
            {productName.length > 0 && (
              <TouchableOpacity onPress={() => { setProductName(''); setResults([]); setHasSearched(false); }} style={{ padding: 4 }}>
                <Text style={{ color: '#94a3b8', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button 
            title={loading ? "Searching..." : "Search Product"} 
            onPress={() => handleSearch()} 
            color={colors.primary} 
            disabled={loading}
          />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Performing deep AI analysis...</Text>
          </View>
        ) : hasSearched ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {results.length > 0 ? `FOUND ${results.length} MATCHES` : "NO EXACT MATCHES FOUND"}
            </Text>
            
            {results.map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.resultItem} 
                onPress={() => selectProduct(item)}
                activeOpacity={0.8}
              >
                <View style={styles.resultContent}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.resultThumb} resizeMode="contain" />
                  ) : (
                    <View style={[styles.resultThumb, { backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={{ fontSize: 20 }}>🍴</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.resultName} numberOfLines={1}>{item.product}</Text>
                    <Text style={styles.resultBrand} numberOfLines={1}>{item.brands}</Text>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: item.score > 70 ? '#10b981' : item.score > 40 ? '#f59e0b' : '#ef4444' }]}>
                    <Text style={styles.scoreText}>{item.score}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.aiButton} onPress={handleAIFallback}>
              <View style={styles.aiButtonContent}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>✨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiButtonText}>AI Health Check for "{productName}"</Text>
                  <Text style={styles.aiButtonSub}>Analyze health risks based on name</Text>
                </View>
                <Text style={{ color: colors.primary, fontSize: 20 }}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.examplesSection}>
            <Text style={styles.sectionLabel}>POPULAR SEARCHES</Text>
            <View style={styles.chips}>
              {EXAMPLES.map((ex) => (
                <TouchableOpacity
                  key={ex}
                  onPress={() => {
                    setProductName(ex);
                    handleSearch(ex);
                  }}
                  style={styles.chip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
>>>>>>> da63750186e4107408e0d0729508d7c7f931f792:src/screens/ProductSearchScreen.js
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: colors.white, fontSize: 28, fontWeight: '300', marginTop: -2 },
  headerTitle: { ...typography.h3, color: colors.white, letterSpacing: 0.5 },
  searchCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: radius.xl,
    margin: spacing.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
<<<<<<< HEAD:PROJECT_BACKUP_2026_04_26/working_code_backup/src/screens/ManualEntryScreen.js
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
  inputLabel: { ...typography.label, color: colors.textMuted, marginBottom: 8 },
=======
  inputLabel: { ...typography.label, color: '#64748b', marginBottom: 10, letterSpacing: 1 },
>>>>>>> da63750186e4107408e0d0729508d7c7f931f792:src/screens/ProductSearchScreen.js
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
<<<<<<< HEAD:PROJECT_BACKUP_2026_04_26/working_code_backup/src/screens/ManualEntryScreen.js
    borderWidth: 2, borderColor: colors.primary,
    paddingHorizontal: 14,
    marginBottom: spacing.md,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text },
  loadingBox: { alignItems: 'center', paddingVertical: 24 },
  loadingText: { ...typography.body, color: colors.primary, marginTop: spacing.sm, fontWeight: '600' },
=======
    borderWidth: 1.5, borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    marginBottom: spacing.md,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text, fontWeight: '500' },
  centerContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { ...typography.body, color: colors.white, marginTop: 15, opacity: 0.8 },
  resultsContainer: { paddingHorizontal: spacing.lg },
  resultsTitle: { ...typography.label, color: 'rgba(255,255,255,0.5)', marginBottom: 15, letterSpacing: 1.5 },
  resultItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.xl,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  resultThumb: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: '#fff' },
  resultName: { fontSize: 16, fontWeight: '700', color: colors.white },
  resultBrand: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  scoreBadge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  scoreText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  aiButton: {
    marginTop: 20,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    padding: 18,
  },
  aiButtonContent: { flexDirection: 'row', alignItems: 'center' },
  aiButtonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  aiButtonSub: { color: 'rgba(16,185,129,0.7)', fontSize: 12, marginTop: 2 },
  examplesSection: { paddingHorizontal: spacing.lg, marginTop: 10 },
  sectionLabel: { ...typography.label, color: 'rgba(255,255,255,0.4)', marginBottom: 15, letterSpacing: 1.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    paddingHorizontal: 18, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  chipText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 },
>>>>>>> da63750186e4107408e0d0729508d7c7f931f792:src/screens/ProductSearchScreen.js
});
