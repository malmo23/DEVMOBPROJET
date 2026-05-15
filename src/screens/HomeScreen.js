import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getFoods, deleteFood } from '../services/foodService';
import { colors, typography, spacing, radius, shadows } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

function RiskChip({ score }) {
  const { t } = useLanguage();
  const bg = score > 70 ? '#d1fae5' : score > 40 ? '#fef3c7' : '#fee2e2';
  const text = score > 70 ? '#065f46' : score > 40 ? '#92400e' : '#991b1b';
  const label = score > 70 ? t('good') : score > 40 ? t('moderate') : t('poor');
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipScore, { color: text }]}>{score}</Text>
      <Text style={[styles.chipLabel, { color: text }]}>{label}</Text>
    </View>
  );
}

function HistoryCard({ item, onDelete, onPress }) {
  const { t, lang } = useLanguage();
  const formatDate = (ts) => {
    if (!ts || !ts.seconds) return t('justNow');
    return new Date(ts.seconds * 1000).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.8} style={styles.card}>
      <View style={styles.cardRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.foodName} numberOfLines={1}>{item.product}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <RiskChip score={item.score} />
      </View>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn} activeOpacity={0.7}>
        <Ionicons name="trash-outline" size={13} color={colors.red} style={{ marginRight: 4 }} />
        <Text style={styles.deleteText}>{t('remove')}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function HomeScreen({ navigation }) {
  const { t, lang, toggleLanguage, isRTL, nextLangLabel } = useLanguage();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const data = await getFoods();
      setFoods(data);
    } catch (error) {
      Alert.alert('Error loading history', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadFoods(); }, []));

  const handleDelete = async (id) => {
    try {
      await deleteFood(id);
      loadFoods();
    } catch {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handleViewDetails = (item) => {
    navigation.navigate('Result', { result: item });
  };

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.getParent('Drawer')?.openDrawer()} style={[styles.refreshBtn, { marginRight: 12 }]}>
            <Ionicons name="menu" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('myHistory')}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleLanguage} style={[styles.langBtn, { marginRight: 8 }]}>
            <Text style={styles.langBtnText}>{nextLangLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={loadFoods} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : foods.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="file-tray-outline" size={64} color="rgba(255,255,255,0.25)" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>{t('noSavedProducts')}</Text>
          <Text style={styles.emptySubtitle}>{t('scanAndSave')}</Text>
          <TouchableOpacity
            style={styles.emptyCtaBtn}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.85}
          >
            <Ionicons name="barcode-outline" size={18} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.emptyCtaText}>Scan Your First Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryCard 
              item={item} 
              onDelete={handleDelete} 
              onPress={handleViewDetails} 
            />
          )}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onRefresh={loadFoods}
          refreshing={loading}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg,
  },
  headerTitle: { ...typography.h2, color: colors.white },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  langBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  langBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  foodName: { ...typography.h3, color: colors.text, marginBottom: 2 },
  date: { ...typography.caption, color: colors.textMuted },
  chip: { borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 64 },
  chipScore: { fontSize: 20, fontWeight: '900' },
  chipLabel: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  deleteBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: '#fee2e2',
  },
  deleteText: { color: colors.red, fontSize: 13, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { ...typography.h3, color: colors.white, marginBottom: 8 },
  emptySubtitle: { ...typography.body, color: colors.textLight, textAlign: 'center', marginBottom: 28 },
  emptyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyCtaText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});

export default HomeScreen;
