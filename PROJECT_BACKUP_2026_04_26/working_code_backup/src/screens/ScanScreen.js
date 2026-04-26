import { useState } from 'react';
import { View } from 'react-native';
import ScannerView from '../components/ScannerView';
import { analyzeBarcode } from '../services/scannerService';

export default function ScanScreen({ navigation }) {
  const [scanned, setScanned] = useState(false);

  const handleScan = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    const result = await analyzeBarcode(data);
    navigation.replace('Result', { result });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScannerView onScan={handleScan} />
    </View>
  );
}
