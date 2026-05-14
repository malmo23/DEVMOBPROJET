import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getFoods, deleteFood } from '../services/foodService';
import { colors, typography, spacing, radius, shadows } from '../theme';

function RiskChip({ score }) {
  const bg = score > 70 ? '#d1fae5' : score > 40 ? '#fef3c7' : '#fee2e2';
  const text = score > 70 ? '#065f46' : score > 40 ? '#92400e' : '#991b1b';
  const label = score > 70 ? 'Good' : score > 40 ? 'Moderate' : 'Poor';
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipScore, { color: text }]}>{score}</Text>
      <Text style={[styles.chipLabel, { color: text }]}>{label}</Text>
    </View>
  );
}

function HistoryCard({ item, onDelete, onPress }) {
  const formatDate = (ts) => {
    if (!ts) return 'Just now';
    // Handle both Firestore Timestamps and regular Date objects
    const date = ts.toDate ? ts.toDate() : (ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        onPress={() => onPress(item)} 
        activeOpacity={0.7} 
        style={styles.cardMain}
      >
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.foodName} numberOfLines={1}>{item.product || 'Unknown Product'}</Text>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
          <RiskChip score={item.score || 50} />
        </View>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      <TouchableOpacity 
        onPress={() => onDelete(item.id)} 
        style={styles.deleteBtn} 
        activeOpacity={0.6}
      >
        <Text style={styles.deleteText}>🗑  Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

function HomeScreen({ navigation }) {
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
    if (!item) return;
    console.log('Navigating to Result from History:', item.product);
    // Use the Main stack's Result screen specifically if needed
    navigation.navigate('Main', { 
      screen: 'Result', 
      params: { result: item } 
    });
  };

  return (
    <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={[styles.refreshBtn, { marginRight: 12 }]}>
            <Text style={{ fontSize: 22, color: colors.white }}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🕒 My History</Text>
        </View>
        <TouchableOpacity onPress={loadFoods} style={styles.refreshBtn}>
          <Text style={{ fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : foods.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>📭</Text>
          <Text style={styles.emptyTitle}>No saved products yet</Text>
          <Text style={styles.emptySubtitle}>Scan a product and tap "Save to History"</Text>
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
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardMain: { padding: spacing.md },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: spacing.md },
  foodName: { ...typography.h3, color: colors.text, marginBottom: 2 },
  date: { ...typography.caption, color: colors.textMuted },
  chip: { borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 64, marginLeft: 10 },
  chipScore: { fontSize: 20, fontWeight: '900' },
  chipLabel: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  deleteBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBadge: {
    backgroundColor: 'rgba(255,0,0,0.15)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  warningText: {
    color: '#cc0000',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteText: { color: colors.red, fontSize: 13, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { ...typography.h3, color: colors.white, marginBottom: 8 },
  emptySubtitle: { ...typography.body, color: colors.textLight, textAlign: 'center' },
});

export default HomeScreen;
