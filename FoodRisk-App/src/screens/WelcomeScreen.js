import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radius, shadows } from '../theme';

const FeatureCard = ({ icon, title, subtitle, color, onPress, delay, anim }) => {
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={[styles.featureCard, { borderLeftColor: color }]}
      >
        <View style={[styles.featureIcon, { backgroundColor: color + '22' }]}>
          <Text style={{ fontSize: 28 }}>{icon}</Text>
        </View>
        <View style={styles.featureText}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureSubtitle}>{subtitle}</Text>
        </View>
        <Text style={[styles.chevron, { color }]}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function WelcomeScreen({ navigation }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const card1 = useRef(new Animated.Value(0)).current;
  const card2 = useRef(new Animated.Value(0)).current;
  const card3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(card1, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(card2, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(card3, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
          <Text style={{ fontSize: 24, color: colors.white }}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Header */}
      <Animated.View style={[styles.hero, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <View style={styles.logoCircle}>
          <Text style={{ fontSize: 36 }}>🥗</Text>
        </View>
        <Text style={styles.heroTitle}>FoodRisk</Text>
        <Text style={styles.heroSubtitle}>AI-powered food safety analysis</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>🤖 Powered by AI</Text>
        </View>
      </Animated.View>

      {/* Feature Cards */}
      <View style={styles.cards}>
        <FeatureCard
          icon="📸"
          title="Scan Barcode"
          subtitle="Use your camera to scan any product"
          color={colors.blue}
          onPress={() => navigation.navigate('Scanner')}
          anim={card1}
        />
        <FeatureCard
          icon="⌨️"
          title="Enter Barcode"
          subtitle="Manually type a product barcode"
          color={colors.primary}
          onPress={() => navigation.navigate('ManualEntry')}
          anim={card2}
        />
        <FeatureCard
          icon="🔍"
          title="Search by Name"
          subtitle="AI-powered product name search"
          color={colors.purple}
          onPress={() => navigation.navigate('ProductSearch')}
          anim={card3}
        />
      </View>

      <Text style={styles.footer}>FoodRisk © 2025</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16,185,129,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  heroTitle: {
    ...typography.hero,
    color: colors.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  badgeText: {
    color: colors.primary,
    ...typography.label,
  },
  cards: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...shadows.card,
  },
  featureIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: 2,
  },
  featureSubtitle: {
    ...typography.caption,
    color: colors.textLight,
  },
  chevron: {
    fontSize: 28,
    fontWeight: '300',
    marginLeft: spacing.sm,
  },
  footer: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
