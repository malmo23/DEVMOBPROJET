// src/screens/TPHooksScreen.js

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function TPHooksScreen() {


  // ======================
  // Ex 1: Compteur (useState)
  // ======================
  const [count, setCount] = useState(0);

  // ======================
  // Ex 2: Changement dynamique de texte
  // ======================
  const messages = ["Bonjour", "Bienvenue", "Bonne chance", "Bon courage"];
  const [msgIndex, setMsgIndex] = useState(0);

  // ======================
  // Ex 3: useEffect au chargement (montage)
  // ======================
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(true);
    // Alert.alert("Info", "Application démarrée"); // Décommenter si voulu
  }, []);

  // ======================
  // Ex 4: useEffect à chaque changement de count
  // ======================
  const [countLog, setCountLog] = useState("Aucun changement encore.");

  useEffect(() => {
    setCountLog(`Nouvelle valeur du compteur : ${count}`);
  }, [count]);

  // ======================
  // Ex 5: Simulation de chargement (Loading)
  // ======================
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(t); // Cleanup
  }, []);

  // ======================
  // Ex 6: Formulaire contrôlé
  // ======================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Erreur", "Veuillez remplir le nom et l'email.");
      return;
    }

    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!okEmail) {
      Alert.alert("Erreur", "Email invalide. Exemple: test@gmail.com");
      return;
    }

    Alert.alert("Succès ✔", `Nom: ${name}\nEmail: ${email}`);
  };

  // ======================
  // BONUS: Compteur automatique (interval + useRef)
  // ======================
  const [autoCount, setAutoCount] = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (autoRunning) {
      intervalRef.current = setInterval(() => {
        setAutoCount((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRunning]);

  useEffect(() => {
    if (autoCount >= 10 && autoRunning) {
      setAutoRunning(false);
      Alert.alert("Fin", "Compteur automatique arrêté à 10");
    }
  }, [autoCount, autoRunning]);

  // ======================
  // Helpers (Ex 1 & Ex 2)
  // ======================
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(0);

  const nextMessage = () => {
    setMsgIndex((i) => (i + 1) % messages.length);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>TP Hooks - Correction complète</Text>

        {/* Ex 1 - Compteur */}
        <View style={styles.card}>
          <Text style={styles.h2}>Exercice 1 – Compteur (useState)</Text>
          <Text style={styles.big}>{count}</Text>
          <View style={styles.row}>
            <Button title="+ " onPress={increment} />
            <View style={styles.spacer} />
            <Button title="- " onPress={decrement} />
            <View style={styles.spacer} />
            <Button title="Reset" onPress={reset} />
          </View>
        </View>

        {/* Ex 4 - Log du compteur */}
        <View style={styles.card}>
          <Text style={styles.h2}>Exercice 4 – useEffect sur changement</Text>
          <Text style={styles.p}>{countLog}</Text>
        </View>

        {/* Ex 2 - Message dynamique */}
        <View style={styles.card}>
          <Text style={styles.h2}>Exercice 2 – Texte dynamique</Text>
          <Text style={styles.p}>Message: {messages[msgIndex]}</Text>
          <Button title="Changer le message" onPress={nextMessage} />
        </View>

        {/* Ex 5 - Loading */}
        <View style={styles.card}>
          <Text style={styles.h2}>Exercice 5 – Loading (2 secondes)</Text>
          {loading ? (
            <Text style={styles.p}>⚙️ Chargement...</Text>
          ) : (
            <Text style={styles.p}>✅ Données chargées !</Text>
          )}
        </View>

        {/* Ex 6 - Formulaire */}
        <View style={styles.card}>
          <Text style={styles.h2}>Exercice 6 – Formulaire contrôlé</Text>

          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Rachid"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Ex: rachid@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button title="Valider" onPress={handleSubmit} />

          <View style={{ height: 10 }} />

          <Text style={styles.p}>
            Aperçu en direct : {"\n"}
            • Nom: {name || "(vide)"} {"\n"}
            • Email: {email || "(vide)"}
          </Text>
        </View>

        {/* BONUS - Compteur automatique */}
        <View style={styles.card}>
          <Text style={styles.h2}>BONUS – Compteur automatique</Text>
          <Text style={styles.big}>{autoCount}</Text>
          <View style={styles.row}>
            <Button
              title={autoRunning ? "Stop" : "Start"}
              onPress={() => setAutoRunning((r) => !r)}
            />
            <View style={styles.spacer} />
            <Button
              title="Reset Auto"
              onPress={() => {
                setAutoRunning(false);
                setAutoCount(0);
              }}
            />
          </View>
          <Text style={styles.p}>
            Règle: s'incrémente chaque seconde et s'arrête automatiquement à 10.
          </Text>
        </View>

        <Text style={styles.footer}>
          Fin - Correction complète useState & useEffect
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    gap: 12,
  },
  h1: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fafafa",
    gap: 10,
  },
  h2: {
    fontSize: 16,
    fontWeight: "700",
  },
  p: {
    fontSize: 14,
    lineHeight: 20,
  },
  big: {
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: {
    width: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  footer: {
    marginTop: 6,
    textAlign: "center",
    color: "#666",
  },
});
