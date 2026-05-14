import { useState, useEffect } from 'react';
import { ScrollView, Text, View, Alert, StyleSheet, TouchableOpacity, StatusBar, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withDelay } from 'react-native-reanimated';
import CopyableText from '../components/CopyableText';
import Button from '../components/Button';
import { addFood } from '../services/foodService';
import { colors, typography, spacing, radius, shadows } from '../theme';

const { width } = Dimensions.get('window');

function NutritionRow({ label, value, unit, delay }) {
  const displayValue = value === 'N/A' ? 'N/A' : `${parseFloat(value).toFixed(1)} ${unit}`;
  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify()} 
      style={styles.nutritionRow}
    >
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={styles.nutritionValue}>{displayValue}</Text>
    </Animated.View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params;
  const scoreScale = useSharedValue(0.3);

  useEffect(() => {
    scoreScale.value = withDelay(300, withSpring(1, { damping: 12 }));
  }, []);

  const animatedScoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
    opacity: scoreScale.value
  }));

  const score = result.score;
  const scoreColor = score > 70 ? colors.scoreGood : score > 40 ? colors.scoreMid : colors.scoreBad;
  const scoreLabel = score > 70 ? 'Excellent' : score > 40 ? 'Moderate' : 'Poor';
  const scoreEmoji = score > 70 ? '✅' : score > 40 ? '⚠️' : '🚨';

  return (
    <View style={{ flex: 1, backgroundColor: '#0a1628' }}>
      <StatusBar barStyle="light-content" />

      {/* Health Alert Banner at the very top */}
      {result.warningLabels && result.warningLabels.length > 0 && (
        <View style={styles.healthAlertBanner}>
          <Text style={styles.healthAlertIcon}>⚠️</Text>
          <View style={styles.healthAlertContent}>
            <Text style={styles.healthAlertTitle}>HEALTH ALERT</Text>
            <Text style={styles.healthAlertText}>
              Matches your profile: <Text style={styles.healthAlertBold}>{result.warningLabels.join(', ')}</Text>
            </Text>
          </View>
        </View>
      )}

      <LinearGradient colors={['#0a1628', '#0f2942', '#0f3d2e']} style={StyleSheet.absoluteFill} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.replace('Welcome')} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Analysis Result</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Score Hero */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.scoreHero}>
          {result.imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: result.imageUrl }} style={styles.productImage} resizeMode="contain" />
            </View>
          )}
          <CopyableText style={styles.productName}>{result.product}</CopyableText>
          <Text style={styles.sourceText}>Analyzed via {result.source}</Text>
          
          <Animated.View style={[styles.scoreContainer, animatedScoreStyle]}>
            <LinearGradient 
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']} 
              style={styles.scoreRing}
            >
              <View style={[styles.scoreInner, { borderColor: scoreColor }]}>
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>{score}</Text>
                <Text style={styles.scoreOf}>/100</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          <View style={[styles.scoreLabelPill, { backgroundColor: scoreColor + '33', borderColor: scoreColor }]}>
            <Text style={[styles.scoreLabelText, { color: scoreColor }]}>{scoreEmoji} {scoreLabel} Health Score</Text>
          </View>
        </Animated.View>

        {/* Sections Wrapper */}
        <View style={styles.contentWrapper}>
          {/* Disease Predictions */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.glassSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔮 AI Health Insights</Text>
              <Text style={styles.predictionIntro}>Long-term consumption analysis</Text>
            </View>
            <View style={styles.predictionsList}>
              {result.predictions?.map((p, i) => (
                <View key={i} style={styles.predictionCard}>
                  <View style={styles.predictionHeader}>
                    <Text style={styles.diseaseName}>{p.disease}</Text>
                    <View style={[styles.probBadge, { 
                      backgroundColor: p.probability === 'High' ? '#ef4444' : p.probability === 'Moderate' ? '#f59e0b' : '#10b981' 
                    }]}>
                      <Text style={styles.probText}>{p.probability}</Text>
                    </View>
                  </View>
                  <Text style={styles.diseaseDesc}>{p.description}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Nutrition Info */}
          {result.nutritionInfo && (
            <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.glassSection}>
              <Text style={styles.sectionTitle}>📊 Nutrition Facts (100g)</Text>
              <View style={styles.gridContainer}>
                <NutritionRow label="Calories" value={result.nutritionInfo.calories} unit="kcal" delay={600} />
                <NutritionRow label="Sugar" value={result.nutritionInfo.sugar} unit="g" delay={700} />
                <NutritionRow label="Protein" value={result.nutritionInfo.protein} unit="g" delay={800} />
                <NutritionRow label="Fat" value={result.nutritionInfo.fat} unit="g" delay={900} />
              </View>
            </Animated.View>
          )}

          {/* Allergies */}
          {result.allergies?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.glassSection}>
              <Text style={[styles.sectionTitle, { color: '#fca5a5' }]}>⚠️ Potential Allergies</Text>
              <View style={styles.allergyChips}>
                {result.allergies.map((a, i) => (
                  <View key={i} style={styles.allergyChip}>
                    <Text style={styles.allergyText}>{a}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Ingredients */}
          {result.ingredients && (
            <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.glassSection}>
              <Text style={styles.sectionTitle}>🧪 Ingredients</Text>
              <CopyableText style={styles.ingredients}>{result.ingredients}</CopyableText>
            </Animated.View>
          )}
        </View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.actions}>
          <Button
            title="💾 Save"
            onPress={async () => {
              try {
                await addFood(result);
                Alert.alert('Success', 'Saved to your health profile.');
              } catch (e) {
                Alert.alert('Error', e.message);
              }
            }}
            color={colors.amber}
            style={{ flex: 1, marginRight: 10 }}
          />
          <Button
            title="🔄 Retake"
            onPress={() => navigation.replace('Welcome')}
            color="#475569"
            style={{ flex: 1 }}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  backIcon: { color: colors.white, fontSize: 32, fontWeight: '300', marginTop: -4 },
  topTitle: { ...typography.h3, color: colors.white, fontWeight: '700' },
  scoreHero: { alignItems: 'center', paddingTop: 20, paddingBottom: 10 },
  imageContainer: {
    width: 140, height: 140, borderRadius: 70, backgroundColor: '#fff',
    marginBottom: 20, padding: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 15,
  },
  productImage: { width: '100%', height: '100%' },
  productName: { ...typography.h2, color: colors.white, textAlign: 'center', paddingHorizontal: 40 },
  sourceText: { ...typography.caption, color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 20 },
  scoreContainer: { marginBottom: 24 },
  scoreRing: {
    width: 150, height: 150, borderRadius: 75,
    padding: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreInner: {
    width: '100%', height: '100%', borderRadius: 70,
    backgroundColor: 'rgba(10, 22, 40, 0.6)',
    borderWidth: 4, alignItems: 'center', justifyContent: 'center',
  },
  scoreNumber: { fontSize: 52, fontWeight: '900' },
  scoreOf: { fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  scoreLabelPill: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 30, borderWidth: 1.5,
  },
  scoreLabelText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  contentWrapper: { paddingHorizontal: 20 },
  glassSection: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.white, marginBottom: 16 },
  predictionIntro: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  predictionsList: { gap: 12 },
  predictionCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16, borderRadius: 16,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  predictionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  diseaseName: { fontSize: 16, fontWeight: '700', color: '#e2e8f0' },
  probBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  probText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  diseaseDesc: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  nutritionRow: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12, borderRadius: 12,
  },
  nutritionLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  nutritionValue: { fontSize: 15, color: colors.white, fontWeight: '700' },
  allergyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allergyChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  allergyText: { color: '#fca5a5', fontWeight: '700', fontSize: 13 },
  ingredients: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 20 },
  actions: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10 },
  healthAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#b91c1c',
    zIndex: 10,
  },
  healthAlertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  healthAlertContent: {
    flex: 1,
  },
  healthAlertTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  healthAlertText: {
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '600',
  },
  healthAlertBold: {
    color: '#ffffff',
    fontWeight: '800',
  },
});

