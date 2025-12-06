import { View, Text, ScrollView } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';

export default function WelcomeScreen({ navigation }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
      <Card>
        <Text style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
          🥗 FoodRisk
        </Text>

        <Text style={{ fontSize: 18, textAlign: 'center', marginVertical: 15, color: '#666' }}>
          Scan product barcodes or search by name to check health risks, allergens, and nutritional data
        </Text>

        <View style={{ backgroundColor: '#dbeafe', padding: 15, borderRadius: 15, marginVertical: 20 }}>
          <Text style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: 5 }}>AI-Powered Analysis:</Text>
          <Text style={{ color: '#1e40af' }}>Get detailed nutritional info, health risks, and allergen warnings</Text>
        </View>

        <Button 
          title="📸 Scan QR Code" 
          onPress={() => navigation.navigate('Scanner')}
          color="#3b82f6"
        />
        
        <View style={{ marginVertical: 8 }} />
        
        <Button 
          title="⌨️ Enter Barcode" 
          onPress={() => navigation.navigate('ManualEntry')}
          color="#10b981"
        />

        <View style={{ marginVertical: 8 }} />

        <Button 
          title="🔍 Search by Name (AI)" 
          onPress={() => navigation.navigate('ProductSearch')}
          color="#a855f7"
        />
      </Card>
    </ScrollView>
  );
}
