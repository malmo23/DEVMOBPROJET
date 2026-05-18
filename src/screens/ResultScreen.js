import { useState, useEffect, useRef } from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, StatusBar, Image, Dimensions, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withDelay } from 'react-native-reanimated';
import CopyableText from '../components/CopyableText';
import Button from '../components/Button';
import { addFood } from '../services/foodService';
import { colors, typography, spacing, radius, shadows } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

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

function Toast({ message, type }) {
  const bg = type === 'error' ? '#ef4444' : '#10b981';
  const icon = type === 'error' ? 'close-circle' : 'checkmark-circle';
  return (
    <View style={[toastStyles.container, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 8 }} />
      <Text style={toastStyles.text} numberOfLines={2}>{message}</Text>
    </View>
  );
}

const toastStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 10,
  },
  text: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
});

export default function ResultScreen({ route, navigation }) {
  const { t, toggleLanguage, nextLangLabel } = useLanguage();
  const { result } = route.params;
  const scoreScale = useSharedValue(0.3);
  const [toast, setToast] = useState(null);
  const toastAnim = useRef(new RNAnimated.Value(0)).current;
  const [saved, setSaved] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    toastAnim.setValue(0);
    RNAnimated.sequence([
      RNAnimated.spring(toastAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
      RNAnimated.delay(2800),
      RNAnimated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  useEffect(() => {
    scoreScale.value = withDelay(300, withSpring(1, { damping: 12 }));
  }, []);

  const animatedScoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
    opacity: scoreScale.value
  }));

  const score = result.score;
  const scoreColor = score > 70 ? colors.scoreGood : score > 40 ? colors.scoreMid : colors.scoreBad;
  const scoreLabel = score > 70 ? t('excellent') : score > 40 ? t('moderate') : t('poor');
  const scoreEmoji = score > 70 ? '✅' : score > 40 ? '⚠️' : '🚨';

  return (
    <View style={{ flex: 1, backgroundColor: '#0a1628' }}>
      <StatusBar barStyle="light-content" />
      {toast && (
        <RNAnimated.View style={[
          toastStyles2.wrapper,
          { transform: [{ translateY: toastAnim.interpolate({ inputRange: [0,1], outputRange: [-80, 0] }) }], opacity: toastAnim },
        ]}>
          <Toast message={toast.message} type={toast.type} />
        </RNAnimated.View>
      )}

      {/* ⚠️ Health Alert Banner — shown FIRST, above everything */}
      {result.warningLabels && result.warningLabels.length > 0 && (
        <View style={styles.healthAlertBanner}>
          <Text style={styles.healthAlertIcon}>⚠️</Text>
          <View style={styles.healthAlertContent}>
            <Text style={styles.healthAlertTitle}>{t('healthAlert')}</Text>
            <Text style={styles.healthAlertText}>
              {t('healthAlertMsg')} <Text style={styles.healthAlertBold}>{result.warningLabels.join(', ')}</Text>
            </Text>
          </View>
        </View>
      )}

      <LinearGradient colors={['#0a1628', '#0f2942', '#0f3d2e']} style={StyleSheet.absoluteFill} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{t('analysisResult')}</Text>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
          <Text style={styles.langBtnText}>{nextLangLabel}</Text>
        </TouchableOpacity>
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
          <Text style={styles.sourceText}>{t('analyzedVia')} {result.source}</Text>
          
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
            <Text style={[styles.scoreLabelText, { color: scoreColor }]}>{scoreEmoji} {scoreLabel} {t('healthScore')}</Text>
          </View>
        </Animated.View>

        {/* Sections Wrapper */}
        <View style={styles.contentWrapper}>
          {/* Disease Predictions */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.glassSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('longTermRisks')}</Text>
              <Text style={styles.predictionIntro}>{t('chronicConsumption')}</Text>
            </View>
            <View style={styles.predictionsList}>
              {result.predictions?.map((p, i) => {
                const isHigh = p.probability === 'High';
                const isMod = p.probability === 'Moderate';
                const probColor = isHigh ? '#ef4444' : isMod ? '#f59e0b' : '#10b981';
                const probBg = isHigh ? 'rgba(239,68,68,0.12)' : isMod ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';
                const impact = p.impact || (isHigh ? 8 : isMod ? 5 : 3);
                const impactWidth = `${impact * 10}%`;
                return (
                  <View key={i} style={[styles.predictionCard, { borderLeftColor: probColor, backgroundColor: probBg }]}>
                    <View style={styles.predictionHeader}>
                      <Text style={styles.diseaseName}>{p.disease}</Text>
                      <View style={[styles.probBadge, { backgroundColor: probColor }]}>
                        <Text style={styles.probText}>{isHigh ? t('highRisk') : isMod ? t('moderateRisk') : t('lowRisk')}</Text>
                      </View>
                    </View>

                    {/* Impact bar */}
                    <View style={styles.impactBarRow}>
                      <Text style={styles.impactLabel}>{t('severity')}</Text>
                      <View style={styles.impactBarBg}>
                        <View style={[styles.impactBarFill, { width: impactWidth, backgroundColor: probColor }]} />
                      </View>
                      <Text style={[styles.impactScore, { color: probColor }]}>{impact}/10</Text>
                    </View>

                    <Text style={styles.diseaseDesc}>{p.description}</Text>

                    <View style={styles.predictionMeta}>
                      {p.nutrientCause ? (
                        <View style={styles.metaChip}>
                          <Text style={styles.metaChipText}>⚗️ {p.nutrientCause}</Text>
                        </View>
                      ) : null}
                      {p.timeframe ? (
                        <View style={styles.metaChip}>
                          <Text style={styles.metaChipText}>⏱ {p.timeframe}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Nutrition Info */}
          {result.nutritionInfo && (
            <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.glassSection}>
              <Text style={styles.sectionTitle}>{t('nutritionFacts')}</Text>
              <View style={styles.gridContainer}>
                <NutritionRow label={t('calories')} value={result.nutritionInfo.calories} unit="kcal" delay={600} />
                <NutritionRow label={t('sugar')} value={result.nutritionInfo.sugar} unit="g" delay={700} />
                <NutritionRow label={t('protein')} value={result.nutritionInfo.protein} unit="g" delay={800} />
                <NutritionRow label={t('fat')} value={result.nutritionInfo.fat} unit="g" delay={900} />
              </View>
            </Animated.View>
          )}

          {/* Allergies */}
          {result.allergies?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.glassSection}>
              <Text style={[styles.sectionTitle, { color: '#fca5a5' }]}>{t('potentialAllergies')}</Text>
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
              <Text style={styles.sectionTitle}>{t('ingredients')}</Text>
              <CopyableText style={styles.ingredients}>{result.ingredients}</CopyableText>
            </Animated.View>
          )}
        </View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.actions}>
          <Button
            title={saved ? '✅ Saved' : t('save')}
            onPress={async () => {
              if (saved) { showToast('This product is already in your history.', 'warn'); return; }
              try {
                await addFood(result);
                setSaved(true);
                showToast(t('savedSuccess'));
              } catch (e) {
                if (e.code === 'already_saved') {
                  setSaved(true);
                  showToast('This product is already saved in your history.', 'warn');
                } else {
                  showToast(e.message, 'error');
                }
              }
            }}
            color={saved ? '#64748b' : colors.amber}
            style={{ flex: 1, marginRight: 10 }}
          />
          <Button
            title={t('retake')}
            onPress={() => navigation.navigate('Welcome')}
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
  backIcon: { color: colors.white },
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
  predictionsList: { gap: 14 },
  predictionCard: {
    padding: 16, borderRadius: 16,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  predictionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  diseaseName: { fontSize: 15, fontWeight: '800', color: '#f1f5f9', flex: 1, marginRight: 8 },
  probBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  probText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  impactBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  impactLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 52 },
  impactBarBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  impactBarFill: { height: '100%', borderRadius: 3 },
  impactScore: { fontSize: 12, fontWeight: '800', width: 32, textAlign: 'right' },
  diseaseDesc: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 20, marginBottom: 10 },
  predictionMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  metaChipText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
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
  langBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  langBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  healthAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingTop: 52,
    borderBottomWidth: 2,
    borderBottomColor: '#991b1b',
    zIndex: 100,
  },
  healthAlertIcon: { fontSize: 26, marginRight: 12 },
  healthAlertContent: { flex: 1 },
  healthAlertTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 3,
  },
  healthAlertText: { color: '#fecaca', fontSize: 13, fontWeight: '500', lineHeight: 18 },
  healthAlertBold: { color: '#fff', fontWeight: '800' },
});

const toastStyles2 = StyleSheet.create({
  wrapper: {
    position: 'absolute', top: 56, left: 0, right: 0, zIndex: 999,
  },
});

