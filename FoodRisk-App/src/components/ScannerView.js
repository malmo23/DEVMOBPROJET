import { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Button from './Button';

export default function ScannerView({ onScan }) {
  const [barcode, setBarcode] = useState('');

  const handleScan = () => {
    if (barcode.trim()) {
      onScan({ data: barcode });
      setBarcode('');
      Keyboard.dismiss();
    } else {
      alert('Please enter a barcode');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView 
        style={styles.container}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>📱 Scan/Enter Barcode</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📷 <Text style={{ fontWeight: 'bold' }}>Note:</Text> For live QR scanning, build a custom Expo app. Expo Go doesn't support native barcode scanning.
            </Text>
          </View>

          <Text style={styles.label}>Enter Product Barcode:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product barcode..."
            value={barcode}
            onChangeText={setBarcode}
            keyboardType="number-pad"
            placeholderTextColor="#999"
          />

          <Button 
            title="Analyze Product" 
            onPress={handleScan}
            color="#10b981"
          />

          <View style={styles.testCodesBox}>
            <Text style={styles.testCodesTitle}>Test Codes:</Text>
            <Text style={styles.testCode}>🥜 3017620422003 - Nutella</Text>
            <Text style={styles.testCode}>🥤 5449000000996 - Coca-Cola</Text>
          </View>

          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ecfdf5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: '#f0fdf4',
    color: '#1f2937',
  },
  testCodesBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  testCodesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  testCode: {
    fontSize: 12,
    color: '#92400e',
    marginVertical: 4,
  },
  spacer: {
    height: 20,
  },
});
