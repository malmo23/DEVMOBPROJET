import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScannerView from '../components/ScannerView';
import { analyzeBarcode } from '../services/scannerService';
import { colors, typography, spacing } from '../theme';

export default function ScannerScreen({ navigation }) {
  const [scanned, setScanned] = useState(false);

  const handleScan = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    const result = await analyzeBarcode(data);
    navigation.replace('Result', { result });
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

      <View style={{ flex: 1 }}>
        <ScannerView onScan={handleScan} />
      </View>
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
});
