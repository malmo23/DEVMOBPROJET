import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getFoods, deleteFood } from '../services/foodService';
import Card from '../components/Card';
import Button from '../components/Button';

function HomeScreen({ navigation }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFoods = async () => {
    setLoading(true);
    try {
      console.log("Fetching foods...");
      const data = await getFoods();
      console.log("Foods fetched:", data.length);
      setFoods(data);
    } catch (error) {
      console.error("Home load error:", error);
      Alert.alert("Error loading history", error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFoods();
    }, [])
  );

  const handleDelete = async (id) => {
    try {
      await deleteFood(id);
      loadFoods();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'Just now';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View>
          <Text selectable={true} style={styles.foodName}>{item.product}</Text>
          <Text selectable={true} style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text selectable={true} style={[styles.score, { color: item.score > 70 ? '#22c55e' : item.score > 40 ? '#f59e0b' : '#ef4444' }]}>
          {item.score}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Searched Products</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#10b981" />
      ) : foods.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Text selectable={true} style={styles.emptyText}>You haven't saved any products yet. Scan one and tap 'Save for Later'!</Text>
          <Button title="🔄 Refresh History" onPress={loadFoods} />
        </View>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          onRefresh={loadFoods}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ecfdf5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#064e3b',
    textAlign: 'center',
  },
  card: {
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  deleteText: {
    color: '#ef4444',
    textAlign: 'right',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 50,
    fontSize: 16,
  },
});

export default HomeScreen;

