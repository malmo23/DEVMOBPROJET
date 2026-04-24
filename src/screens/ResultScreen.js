import { useState } from 'react';
import { ScrollView, Text, View, Alert, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CopyableText from '../components/CopyableText';
import Button from '../components/Button';
import { addFood } from '../services/foodService';
import { colors, typography, spacing, radius, shadows } from '../theme';

function NutritionRow({ label, value, unit }) {
  const displayValue = value === 'N/A' ? 'N/A' : `${parseFloat(value).toFixed(1)} ${unit}`;
  return (
    <View style={styles.nutritionRow}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={styles.nutritionValue}>{displayValue}</Text>
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params;

  const score = result.score;
  const scoreColor = score > 70 ? colors.scoreGood : score > 40 ? colors.scoreMid : colors.scoreBad;
  const scoreLabel = score > 70 ? 'Excellent' : score > 40 ? 'Moderate' : 'Poor';
  const scoreEmoji = score > 70 ? '✅' : score > 40 ? '⚠️' : '🚨';

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.replace('Welcome')} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Analysis Result</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Score Hero */}
        <View style={styles.scoreHero}>
          {result.imageUrl && (
            <Image
              source={{ uri: result.imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          )}
          <CopyableText style={styles.productName}>{result.product}</CopyableText>
          {result.source && (
            <Text style={styles.sourceText}>Source: {result.source}</Text>
          )}
          <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{score}</Text>
            <Text style={styles.scoreOf}>/100</Text>
          </View>
          <View style={[styles.scoreLabelPill, { backgroundColor: scoreColor + '22', borderColor: scoreColor }]}>
            <Text style={[styles.scoreLabelText, { color: scoreColor }]}>{scoreEmoji} {scoreLabel}</Text>
          </View>
        </View>

        {/* Nutrition Info */}
        {result.nutritionInfo && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { borderLeftColor: colors.blue }]}>
              <Text style={styles.sectionTitle}>📊 Nutritional Info</Text>
              <Text style={styles.sectionSub}>per 100g</Text>
            </View>
            <View style={styles.sectionBody}>
              <NutritionRow label="Calories" value={result.nutritionInfo.calories} unit="kcal" />
              <NutritionRow label="Protein" value={result.nutritionInfo.protein} unit="g" />
              <NutritionRow label="Carbs" value={result.nutritionInfo.carbs} unit="g" />
              <NutritionRow label="Fat" value={result.nutritionInfo.fat} unit="g" />
              <NutritionRow label="Sugar" value={result.nutritionInfo.sugar} unit="g" />
              <NutritionRow label="Salt" value={result.nutritionInfo.salt} unit="g" />
            </View>
          </View>
        )}

        {/* Allergens */}
        {result.allergens?.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { borderLeftColor: colors.red }]}>
              <Text style={styles.sectionTitle}>⚠️ Allergies</Text>
            </View>
            <View style={[styles.sectionBody, { backgroundColor: '#fef2f2' }]}>
              <View style={styles.allergenChips}>
                {result.allergens.map((a, i) => (
                  <View key={i} style={styles.allergenChip}>
                    <Text style={styles.allergenText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Ingredients */}
        {result.ingredients && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { borderLeftColor: colors.amber }]}>
              <Text style={styles.sectionTitle}>🧪 Ingredients</Text>
            </View>
            <View style={[styles.sectionBody, { backgroundColor: '#fffbeb' }]}>
              <CopyableText style={styles.ingredients}>{result.ingredients}</CopyableText>
            </View>
          </View>
        )}

        {/* Disease Predictions */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { borderLeftColor: colors.redDark || '#991b1b' }]}>
            <Text style={styles.sectionTitle}>🔮 Long-term Predictions</Text>
          </View>
          <View style={[styles.sectionBody, { backgroundColor: '#fff1f2' }]}>
            <Text style={styles.predictionIntro}>
              Risk of these conditions if consumed regularly over a long period:
            </Text>
            {result.diseasePredictions?.map((p, i) => (
              <View key={i} style={styles.riskRow}>
                <View style={[styles.riskDot, { backgroundColor: colors.redDark || '#991b1b' }]} />
                <CopyableText style={[styles.riskText, { color: '#991b1b' }]}>{p}</CopyableText>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="💾  Save to History"
            onPress={async () => {
              try {
                await addFood(result);
                Alert.alert('Saved!', 'Product saved to your history.');
              } catch (e) {
                Alert.alert('Error saving', e.message);
              }
            }}
            color={colors.amber}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="🔄  Scan Again"
            onPress={() => navigation.replace('Welcome')}
            color={colors.blue}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: colors.white, fontSize: 28, fontWeight: '300', marginTop: -2 },
  topTitle: { ...typography.h3, color: colors.white },
  scoreHero: {
    alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg,
  },
  productImage: {
    width: 160,
    height: 160,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    ...shadows.card,
  },
  productName: {
    ...typography.h2, color: colors.white, textAlign: 'center', marginBottom: 4,
  },
  sourceText: { ...typography.caption, color: 'rgba(255,255,255,0.4)', marginBottom: spacing.lg },
  scoreBadge: {
    flexDirection: 'row', alignItems: 'flex-end',
    borderWidth: 4, borderRadius: 100,
    width: 140, height: 140,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scoreNumber: { fontSize: 56, fontWeight: '900', lineHeight: 64 },
  scoreOf: { ...typography.h3, color: 'rgba(255,255,255,0.5)', marginBottom: 6, marginLeft: 2 },
  scoreLabelPill: {
    paddingHorizontal: 18, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1, marginBottom: spacing.sm,
  },
  scoreLabelText: { ...typography.label, fontWeight: '700' },
  section: { marginHorizontal: spacing.lg, marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 10,
    borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md,
    borderLeftWidth: 4,
  },
  sectionTitle: { ...typography.h3, color: colors.text },
  sectionSub: { ...typography.caption, color: colors.textMuted },
  sectionBody: {
    backgroundColor: colors.white, padding: 14,
    borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md,
    ...shadows.card,
  },
  nutritionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  nutritionLabel: { ...typography.body, color: colors.textMuted },
  nutritionValue: { ...typography.body, color: colors.text, fontWeight: '600' },
  allergenChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allergenChip: {
    backgroundColor: '#fee2e2', borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#fca5a5',
  },
  allergenText: { color: colors.redDark, fontWeight: '600', fontSize: 13 },
  ingredients: { color: '#92400e', fontSize: 13, lineHeight: 20 },
  riskRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  riskDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#f97316', marginTop: 7, marginRight: 8,
  },
  riskText: { flex: 1, color: '#ea580c', fontSize: 14, lineHeight: 20 },
  predictionIntro: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.md,
  },
});
