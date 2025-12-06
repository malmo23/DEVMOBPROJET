import { BarCodeScanner } from 'expo-barcode-scanner';
import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Button from './Button';

export default function ScannerView({ onScan }) {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) return <Button title="Demande permission..." disabled />;
  if (hasPermission === false) return <Button title="Activer caméra" color="#ef4444" />;

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={hasPermission ? onScan : undefined}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 6,
    borderColor: '#10b981',
    borderRadius: 30,
    margin: 50,
  },
});