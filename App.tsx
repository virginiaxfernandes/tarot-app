import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native";

type TarotCard = {
  name: string;
  desc: string;
  meaning_up: string;
  meaning_rev: string;
  image: string | null;
};

const API_URL = "https://tarot-api-esoteric.vercel.app/api/cards";

export default function App() {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const res = await fetch(API_URL);

      if (!res.ok) throw new Error(`Erro de rede: ${res.status}`);

      const data = await res.json();

      setCards(data.cards || []);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Ocorreu um erro desconhecido.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredCards = query
    ? cards.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : cards;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tarot App</Text>

      <TextInput
        placeholder="Buscar carta..."
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {error && <Text style={styles.errorText}>Erro: {error}</Text>}

      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.name}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
        renderItem={({ item }) => (
          <View style={styles.cardBox}>
            <Image
              source={{
                uri: item.image
                  ? item.image
                  : "https://via.placeholder.com/300x500?text=Sem+Imagem",
              }}
              style={styles.cardImage}
            />

            <Text style={styles.cardTitle}>{item.name}</Text>

            <Text style={styles.cardDesc}>{item.desc}</Text>

            <Text style={styles.meaningText}>
              <Text style={{ fontWeight: "700" }}>Significado (normal): </Text>
              {item.meaning_up}
            </Text>

            <Text style={styles.meaningText}>
              <Text style={{ fontWeight: "700" }}>Significado (invertido): </Text>
              {item.meaning_rev}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 10,
  },
  cardBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardDesc: {
    marginBottom: 8,
  },
  meaningText: {
    marginBottom: 4,
    color: "#444",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});
