import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScannerView from '../components/ScannerView';
import { analyzeBarcode, generateAIAnalysis } from '../services/scannerService';
import { colors, typography, spacing, radius } from '../theme';

export default function ScannerScreen({ navigation }) {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [lastBarcode, setLastBarcode] = useState('');

  const handleScan = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    setNotFound(false);
    setLastBarcode(data);
    try {
      const result = await analyzeBarcode(data);
      navigation.replace('Result', { result });
    } catch (error) {
      setLoading(false);
      setNotFound(true);
    }
  };

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f172a']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Product</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Analyzing product…</Text>
        </View>
      ) : notFound ? (
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundIcon}>🔍</Text>
          <Text style={styles.notFoundTitle}>Barcode Not Found</Text>
          <Text style={styles.notFoundSub}>No product matched "{lastBarcode}" in the database.</Text>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={async () => {
              setNotFound(false);
              setLoading(true);
              try {
                const aiResult = await generateAIAnalysis(`product with barcode ${lastBarcode}`, null);
                navigation.replace('Result', { result: aiResult });
              } catch (e) {
                setLoading(false);
              }
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 10 }}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiButtonText}>Analyze with AI instead</Text>
              <Text style={styles.aiButtonSub}>Get a health risk estimate using AI</Text>
            </View>
            <Text style={{ color: colors.primary, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setNotFound(false); setScanned(false); }} style={styles.retryBtn}>
            <Text style={styles.retryText}>📷 Scan Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScannerView onScan={handleScan} />
        </View>
      )}
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
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.white, marginTop: 16, opacity: 0.8 },
  notFoundCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  notFoundIcon: { fontSize: 52, marginBottom: 14 },
  notFoundTitle: { ...typography.h2, color: colors.white, marginBottom: 8 },
  notFoundSub: { ...typography.body, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 28 },
  aiButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: radius.xl, borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    padding: 16, width: '100%', marginBottom: 12,
  },
  aiButtonText: { fontSize: 15, fontWeight: '700', color: colors.white },
  aiButtonSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  retryBtn: {
    marginTop: 8, paddingVertical: 12, paddingHorizontal: 28,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  retryText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
