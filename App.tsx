import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TarotCard = {
  name: string;
  name_short: string;
  desc: string;
  meaning_up: string;
  meaning_rev: string;
  image: string | null;
};

const API_URL = "https://tarotapi.dev/api/v1/cards";
const IMAGE_BASE_URL = "https://tarotapi.dev"; 

export default function App() {
  const [allCards, setAllCards] = useState<TarotCard[]>([]); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadAllCards = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Erro de rede: ${res.status} ao carregar o baralho.`);

      const data = await res.json();
      const loadedCards = data.cards || [];
      
      setAllCards(loadedCards); 
      if (error) setError(null); 

    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Ocorreu um erro desconhecido ao carregar as cartas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const drawRandomCard = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/random?n=1`);
      if (!res.ok) throw new Error(`Erro de rede: ${res.status} ao sortear a carta.`);

      const data = await res.json();
      
      setAllCards(data.cards || []);

    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Ocorreu um erro desconhecido ao sortear a carta.");
    } finally {
      setLoading(false);
      setQuery(""); 
    }
  };

  useEffect(() => {
    loadAllCards();
  }, []);

  const filteredCards = useMemo(() => {
    if (!query) return allCards; 

    const lowerCaseQuery = query.toLowerCase();
    
    return allCards.filter(
      (card) =>
        card.name.toLowerCase().includes(lowerCaseQuery) ||
        card.name_short.toLowerCase().includes(lowerCaseQuery) ||
        card.meaning_up.toLowerCase().includes(lowerCaseQuery) ||
        card.meaning_rev.toLowerCase().includes(lowerCaseQuery)
    );
  }, [allCards, query]); 

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tarot App</Text>

      <TextInput
        placeholder="Buscar carta por nome ou significado..."
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />

      <TouchableOpacity style={styles.button} onPress={drawRandomCard}>
        <Text style={styles.buttonText}>Tirar Carta Aleatória</Text>
      </TouchableOpacity>

      {(loading && !refreshing) && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {!loading && !error && filteredCards.length === 0 && (
          <Text style={styles.emptyText}>Nenhuma carta encontrada.</Text>
      )}

      <FlatList
        data={filteredCards} 
        keyExtractor={(item) => item.name_short}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadAllCards(true)} />
        }
        renderItem={({ item }) => (
          <View style={styles.cardBox}>
            <Image
              source={{
                uri: item.image
                  ? `${IMAGE_BASE_URL}${item.image}` 
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
  container: { flex: 1, backgroundColor: "#FFF8F0", paddingTop: 40, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { padding: 12, borderRadius: 10, backgroundColor: "#fff", borderColor: "#ddd", borderWidth: 1, marginBottom: 10 },
  button: { backgroundColor: "#4A90E2", padding: 12, borderRadius: 10, alignItems: "center", marginBottom: 15 },
  buttonText: { color: "#fff", fontWeight: "700" },
  cardBox: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  cardImage: { width: "100%", height: 250, resizeMode: "contain", marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  cardDesc: { marginBottom: 8 },
  meaningText: { marginBottom: 4, color: "#444" },
  errorText: { color: "red", textAlign: "center", marginBottom: 10 },
  emptyText: { color: "#666", textAlign: "center", marginTop: 20, fontSize: 16 } // Novo estilo
});