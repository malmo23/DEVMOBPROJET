import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import ScannerView from '../components/ScannerView';
import { analyzeBarcode } from '../services/scannerService';
import { colors, typography, spacing } from '../theme';

export default function ScannerScreen({ navigation }) {
  const [scanned, setScanned] = useState(false);

  const handleScan = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const result = await analyzeBarcode(data);
      navigation.replace('Result', { result });
    } catch (e) {
      setScanned(false);
      Alert.alert('Scan Error', 'Could not analyze this product.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a1628', '#0d2137', '#0f172a']} style={StyleSheet.absoluteFill} />
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Product</Text>
        <View style={{ width: 44 }} />
      </View>

      <Animated.View entering={FadeInUp.delay(300)} style={{ flex: 1 }}>
        <ScannerView onScan={handleScan} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16,
    zIndex: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  backIcon: { color: colors.white, fontSize: 32, fontWeight: '300', marginTop: -4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.white, letterSpacing: 0.5 },
});

