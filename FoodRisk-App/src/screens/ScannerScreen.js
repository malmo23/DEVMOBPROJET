import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import ScannerView from '../components/ScannerView';
import { analyzeBarcode } from '../services/scannerService';
import Button from '../components/Button';

export default function ScannerScreen({ navigation }) {
  const [scanned, setScanned] = useState(false);

  const handleScan = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    const result = await analyzeBarcode(data);
    navigation.replace('Result', { result });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
      <View style={{ padding: 15, backgroundColor: '#3b82f6' }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
          📸 Scan QR Code
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <ScannerView onScan={handleScan} />
      </View>
      <View style={{ padding: 15 }}>
        <Button 
          title="Back to Menu" 
          onPress={() => navigation.replace('Welcome')}
          color="#6b7280"
        />
      </View>
    </View>
  );
}
