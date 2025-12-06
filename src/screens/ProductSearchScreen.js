import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import { analyzeProductByName } from '../services/scannerService';

export default function ProductSearchScreen({ navigation }) {
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!productName.trim()) {
      alert('Please enter a product name');
      return;
    }
    
    setLoading(true);
    Keyboard.dismiss();
    
    try {
      const result = await analyzeProductByName(productName);
      navigation.replace('Result', { result });
    } catch (error) {
      alert('Error analyzing product');
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView 
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={styles.title}>🔍 Search Product by Name</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🤖 <Text style={{ fontWeight: 'bold' }}>AI-Powered:</Text> Our system searches the internet database and analyzes nutritional data, ingredients, allergens, and potential health risks.
            </Text>
          </View>

          <Text style={styles.label}>Product Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Coca-Cola, Nutella, Apple..."
            value={productName}
            onChangeText={setProductName}
            editable={!loading}
            placeholderTextColor="#999"
          />

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Analyzing product...</Text>
            </View>
          ) : (
            <Button 
              title="Search & Analyze" 
              onPress={handleSearch}
              color="#10b981"
            />
          )}

          <Button 
            title="Back to Menu" 
            onPress={() => navigation.replace('Welcome')}
            color="#6b7280"
          />

          <View style={styles.examplesBox}>
            <Text style={styles.examplesTitle}>Examples:</Text>
            <Text style={styles.example}>• Coca-Cola</Text>
            <Text style={styles.example}>• Nutella</Text>
            <Text style={styles.example}>• Apple</Text>
            <Text style={styles.example}>• Orange Juice</Text>
            <Text style={styles.example}>• Whole Wheat Bread</Text>
          </View>
        </Card>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ecfdf5',
    padding: 0,
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
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  examplesBox: {
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#a78bfa',
  },
  examplesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 8,
  },
  example: {
    fontSize: 12,
    color: '#6b21a8',
    marginVertical: 4,
  },
});
