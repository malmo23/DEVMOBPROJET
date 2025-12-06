import { ScrollView, Text, View } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import CopyableText from '../components/CopyableText';

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params;

  const color = result.score > 70 ? '#22c55e' : result.score > 40 ? '#f59e0b' : '#ef4444';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
      <Card>
        <CopyableText style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>
          {result.product}
        </CopyableText>
        <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 5 }}>
          (Tap to copy)
        </Text>

        <CopyableText style={{ fontSize: 80, fontWeight: '900', textAlign: 'center', marginVertical: 20, color }}>
          {result.score}/100
        </CopyableText>

        {result.nutritionInfo && (
          <View style={{ backgroundColor: '#e0f2fe', padding: 15, borderRadius: 15, marginVertical: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: 10 }}>📊 Nutritional Info (per 100g)</Text>
            <NutritionRow label="Calories" value={result.nutritionInfo.calories} unit="kcal" />
            <NutritionRow label="Protein" value={result.nutritionInfo.protein} unit="g" />
            <NutritionRow label="Carbs" value={result.nutritionInfo.carbs} unit="g" />
            <NutritionRow label="Fat" value={result.nutritionInfo.fat} unit="g" />
            <NutritionRow label="Sugar" value={result.nutritionInfo.sugar} unit="g" />
            <NutritionRow label="Salt" value={result.nutritionInfo.salt} unit="g" />
          </View>
        )}

        {result.allergens?.length > 0 && (
          <View style={{ backgroundColor: '#fee2e2', padding: 15, borderRadius: 15, marginVertical: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#991b1b' }}>⚠️ Allergens</Text>
            <CopyableText style={{ marginTop: 5, color: '#991b1b' }}>
              {result.allergens.join(' • ')}
            </CopyableText>
          </View>
        )}

        {result.ingredients && (
          <View style={{ backgroundColor: '#fef3c7', padding: 15, borderRadius: 15, marginVertical: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#92400e', marginBottom: 8 }}>🧪 Ingredients</Text>
            <CopyableText style={{ color: '#92400e', fontSize: 12, lineHeight: 18 }}>
              {result.ingredients}
            </CopyableText>
          </View>
        )}

        <View style={{ backgroundColor: '#fff7ed', padding: 15, borderRadius: 15, marginVertical: 10 }}>
          <Text style={{ fontWeight: 'bold', color: '#ea580c' }}>⚠️ Health Risks</Text>
          {result.risks.map((r, i) => (
            <CopyableText key={i} style={{ marginTop: 5, color: '#ea580c' }}>
              • {r}
            </CopyableText>
          ))}
          {result.cancerRisk && (
            <CopyableText style={{ marginTop: 10, fontWeight: 'bold', color: '#dc2626' }}>
              Cancer risk: {result.cancerRisk}
            </CopyableText>
          )}
        </View>

        {result.source && (
          <Text style={{ fontSize: 11, color: '#999', textAlign: 'center', marginVertical: 10 }}>
            Source: {result.source}
          </Text>
        )}

        <Button title="Analyze Another" onPress={() => navigation.replace('Welcome')} />
      </Card>
    </ScrollView>
  );
}

function NutritionRow({ label, value, unit }) {
  const displayValue = value === 'N/A' ? 'N/A' : `${parseFloat(value).toFixed(1)}${unit}`;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
      <Text style={{ color: '#0369a1' }}>{label}</Text>
      <CopyableText style={{ color: '#0369a1', fontWeight: '600' }}>
        {displayValue}
      </CopyableText>
    </View>
  );
}
