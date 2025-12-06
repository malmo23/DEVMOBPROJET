import { ScrollView, Text, View } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params;

  const color = result.score > 70 ? '#22c55e' : result.score > 40 ? '#f59e0b' : '#ef4444';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
      <Card>
        <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>
          {result.product}
        </Text>

        <Text style={{ fontSize: 80, fontWeight: '900', textAlign: 'center', marginVertical: 20, color }}>
          {result.score}/100
        </Text>

        {result.allergens?.length > 0 && (
          <View style={{ backgroundColor: '#fee2e2', padding: 15, borderRadius: 15, marginVertical: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#991b1b' }}>Allergènes</Text>
            <Text style={{ marginTop: 5 }}>{result.allergens.join(' • ')}</Text>
          </View>
        )}

        <View style={{ backgroundColor: '#fff7ed', padding: 15, borderRadius: 15, marginVertical: 10 }}>
          <Text style={{ fontWeight: 'bold', color: '#ea580c' }}>Health Risks</Text>
          {result.risks.map((r, i) => <Text key={i} style={{ marginTop: 5 }}>• {r}</Text>)}
          {result.cancerRisk && <Text style={{ marginTop: 10, fontWeight: 'bold', color: '#dc2626' }}>
            Cancer risk: {result.cancerRisk}
          </Text>}
        </View>

        <Button title="Scan Another" onPress={() => navigation.replace('Scan')} />
      </Card>
    </ScrollView>
  );
}