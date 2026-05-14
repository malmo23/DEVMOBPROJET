import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { getFoods, deleteFood } from '../services/foodService';
import { colors, typography, spacing, radius, shadows } from '../theme';

const { width } = Dimensions.get('window');

function RiskChip({ score }) {
  const bg = score > 70 ? 'rgba(16, 185, 129, 0.1)' : score > 40 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  const border = score > 70 ? 'rgba(16, 185, 129, 0.3)' : score > 40 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)';
  const text = score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444';
  const label = score > 70 ? 'Good' : score > 40 ? 'Fair' : 'Poor';
  
  return (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.chipScore, { color: text }]}>{score}</Text>
      <Text style={[styles.chipLabel, { color: text }]}>{label}</Text>
    </View>
  );
}

function HistoryCard({ item, index, onDelete, onPress }) {
  const formatDate = (ts) => {
    if (!ts || !ts.seconds) return 'Just now';
    return new Date(ts.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
    >
      <TouchableOpacity 
        onPress={() => onPress(item)} 
        activeOpacity={0.8} 
        style={styles.card}
      >
        <LinearGradient 
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} 
          style={styles.cardGradient}
        >
          <View style={styles.cardRow}>
            <View style={styles.iconPlaceholder}>
              <Text style={{ fontSize: 24 }}>{item.score > 70 ? '🍏' : '🍔'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.foodName} numberOfLines={1}>{item.product}</Text>
              <Text style={styles.date}>{formatDate(item.createdAt)} • {item.source || 'Scanned'}</Text>
            </View>
            <RiskChip score={item.score} />
          </View>
          
          <View style={styles.cardFooter}>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn} activeOpacity={0.7}>
              <Text style={styles.deleteText}>🗑  Remove</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
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
    navigation.navigate('Main', {
      screen: 'Result',
      params: { result: item }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a1628', '#0d2137', '#0f3d2e']} style={StyleSheet.absoluteFill} />
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
            <Text style={{ fontSize: 24, color: colors.white }}>☰</Text>
          </TouchableOpacity>
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.headerTitle}>My History</Text>
            <Text style={styles.headerSubtitle}>{foods.length} items analyzed</Text>
          </View>
        </View>
        <TouchableOpacity onPress={loadFoods} style={styles.iconBtn}>
          <Text style={{ fontSize: 20, color: colors.white }}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : foods.length === 0 ? (
        <Animated.View entering={FadeInDown} style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Text style={{ fontSize: 56 }}>📭</Text>
          </View>
          <Text style={styles.emptyTitle}>Your history is empty</Text>
          <Text style={styles.emptySubtitle}>Start scanning products to see them here and track your health.</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Scanner')}
            style={styles.scanNowBtn}
          >
            <Text style={styles.scanNowText}>Start Scanning</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <HistoryCard 
              item={item} 
              index={index}
              onDelete={handleDelete} 
              onPress={handleViewDetails} 
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          onRefresh={loadFoods}
          refreshing={loading}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...shadows.card,
  },
  cardGradient: { padding: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconPlaceholder: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  foodName: { fontSize: 18, fontWeight: '700', color: colors.white, marginBottom: 4 },
  date: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  chip: { 
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, 
    alignItems: 'center', minWidth: 60, borderWidth: 1 
  },
  chipScore: { fontSize: 18, fontWeight: '900' },
  chipLabel: { fontSize: 10, fontWeight: '800', marginTop: 1, textTransform: 'uppercase' },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'flex-end',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  deleteBtn: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteText: { color: '#fca5a5', fontSize: 12, fontWeight: '700' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.white, marginTop: 16, fontSize: 16, opacity: 0.7 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: 12, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  scanNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32, paddingVertical: 16,
    borderRadius: 100,
    ...shadows.card,
  },
  scanNowText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});

export default HomeScreen;

