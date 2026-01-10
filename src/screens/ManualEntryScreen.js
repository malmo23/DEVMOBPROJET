import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import CopyableText from '../components/CopyableText';
import { analyzeBarcode } from '../services/scannerService';

export default function ManualEntryScreen({ navigation }) {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!barcode.trim()) {
      alert('Please enter a barcode');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeBarcode(barcode);
      navigation.replace('Result', { result });
    } catch (error) {
      alert('Error analyzing barcode');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
      <Card>
        <Text selectable={true} style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
          ⌨️ Enter Barcode
        </Text>

        <View style={{ backgroundColor: '#fef3c7', padding: 15, borderRadius: 15, marginVertical: 15 }}>
          <Text selectable={true} style={{ color: '#92400e', fontWeight: '600' }}>Test Codes (tap to copy):</Text>
          <CopyableText style={{ color: '#92400e', marginTop: 8, fontWeight: '500' }}>
            🥜 3017620422003 (Nutella)
          </CopyableText>
          <CopyableText style={{ color: '#92400e', marginTop: 4, fontWeight: '500' }}>
            🥤 5449000000996 (Coca-Cola)
          </CopyableText>
        </View>

        <Text selectable={true} style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>Product Barcode:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter product barcode..."
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="number-pad"
          editable={!loading}
        />

        <Button
          title={loading ? "Analyzing..." : "Analyze Product"}
          onPress={handleAnalyze}
          color="#10b981"
        />

        <Button
          title="Back to Menu"
          onPress={() => navigation.replace('Welcome')}
          color="#6b7280"
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f0fdf4',
  },
});
