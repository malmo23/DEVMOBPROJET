import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Keyboard, ActivityIndicator, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import { searchProducts, generateAIAnalysis } from '../services/scannerService';
import { colors, typography, spacing, radius, shadows } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

const EXAMPLES = ['Coca-Cola', 'Nutella', 'Snickers', 'Pringles', 'Whole Wheat Bread'];

export default function ProductSearchScreen({ navigation }) {
  const { t } = useLanguage();
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (name = productName) => {
    const query = (name || productName).trim();
    if (query.length < 2) {
      alert('Please enter a product name');
      return;
    }
    setSearching(true);
    setLoading(true);
    setHasSearched(false);
    setResults([]);
    Keyboard.dismiss();
    
    try {
      const data = await searchProducts(query);
      console.log('Results received:', data.length);
      setResults(data);
      setHasSearched(true);
    } catch (error) {
      console.log('Search Error:', error);
      alert('Error searching products');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const selectProduct = async (item) => {
    if (item.source === 'Gemini AI Analysis') {
      navigation.replace('Result', { result: item });
      return;
    }

    setLoading(true);
    try {
      const enrichedResult = await generateAIAnalysis(item.product, item);
      navigation.replace('Result', { result: enrichedResult });
    } catch (err) {
      console.log('Error enriching with AI', err);
      navigation.replace('Result', { result: item });
    }
  };

  const handleAIFallback = async () => {
    setLoading(true);
    try {
      const aiResult = await generateAIAnalysis(productName, null);
      navigation.replace('Result', { result: aiResult });
    } catch (err) {
      console.log('AI Fallback Error:', err);
      alert('AI Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f172a']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('findFood')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled" 
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.searchCard}>
          <Text style={styles.inputLabel}>{t('whatLooking')}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="search-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder={t('placeholder')}
              placeholderTextColor="#94a3b8"
              value={productName}
              onChangeText={(txt) => {
                setProductName(txt);
                if (hasSearched && results.length > 0) setHasSearched(false);
              }}
              onSubmitEditing={() => handleSearch()}
              editable={!loading}
            />
            {productName.length > 0 && (
              <TouchableOpacity onPress={() => { setProductName(''); setResults([]); setHasSearched(false); }} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <Button 
            title={loading ? (t('search') + '...') : t('search')} 
            onPress={() => handleSearch()} 
            color={colors.primary} 
            disabled={loading}
          />
        </View>

        {(loading || searching) ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching products...</Text>
          </View>
        ) : hasSearched ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {results.length > 0 ? `${t('results').toUpperCase()}: ${results.length}` : t('noResults').toUpperCase()}
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
                      <Ionicons name="nutrition-outline" size={24} color="#475569" />
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
                <Ionicons name="sparkles" size={22} color={colors.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiButtonText}>AI Health Check for "{productName}"</Text>
                  <Text style={styles.aiButtonSub}>Analyze health risks based on name</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.examplesSection}>
            <Text style={styles.sectionLabel}>{t('popularSearches')}</Text>
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
  backIcon: { color: colors.white },
  headerTitle: { ...typography.h3, color: colors.white, letterSpacing: 0.5 },
  searchCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: radius.xl,
    margin: spacing.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  inputLabel: { ...typography.label, color: '#64748b', marginBottom: 10, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
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
});
