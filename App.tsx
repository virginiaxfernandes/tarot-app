import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView
} from "react-native";

type TarotCard = {
  name: string;
  meaning: string;
  description?: string;
  image?: string;
};

export default function App() {
  const [card, setCard] = useState<TarotCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<string>("API Externa");

  const fetchRandomCard = async (isPullRefresh = false) => {
    try {
      if (!isPullRefresh) setLoading(true);
      setRefreshing(isPullRefresh);
      setError(null);
      
      console.log("Buscando da API...");
      
      let apiUrl = "https://tarot-api-3m5p.onrender.com/api/tarot/cards/random";
      setApiSource("API: tarot-api-3m5p.onrender.com");
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        apiUrl = "https://rws-cards-api.herokuapp.com/api/v1/cards/random";
        setApiSource("API: rws-cards-api.herokuapp.com");
        
        const secondResponse = await fetch(apiUrl);
        if (!secondResponse.ok) throw new Error("Ambas APIs falharam");
        
        const data = await secondResponse.json();
        processCardData(data, "api2");
      } else {
        const data = await response.json();
        processCardData(data, "api1");
      }
      
    } catch (error) {
      console.error("Erro na API:", error);
      setError("API temporariamente indisponível. Usando dados locais...");
      useLocalData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processCardData = (data: any, apiType: string) => {
    if (apiType === "api1") {
      setCard({
        name: data.card?.name || data.name || "Carta do Tarot",
        meaning: data.card?.meaning_up || data.meaning || data.description || "Significado espiritual",
        description: data.card?.desc || data.desc || "Descrição da carta",
        image: data.card?.image || data.image || getPlaceholderImage(data.card?.name || data.name)
      });
    } else {
      setCard({
        name: data.name || data.card_name || "Carta do Tarot",
        meaning: data.meaning_up || data.meaning || "Significado espiritual",
        description: data.desc || data.description || "Descrição da carta",
        image: data.image || getPlaceholderImage(data.name || data.card_name)
      });
    }
  };

  const useLocalData = () => {
    const localCards = [
      {
        name: "O Louco",
        meaning: "Novos começos, aventura, espontaneidade",
        description: "Representa o início de uma jornada, um salto de fé no desconhecido",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/RWS_Tarot_00_Fool.jpg/300px-RWS_Tarot_00_Fool.jpg"
      },
      {
        name: "O Mago",
        meaning: "Vontade, poder, habilidade de realizar",
        description: "Simboliza a capacidade de transformar ideias em realidade",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/RWS_Tarot_01_Magician.jpg/300px-RWS_Tarot_01_Magician.jpg"
      }
    ];
    
    const randomCard = localCards[Math.floor(Math.random() * localCards.length)];
    setCard(randomCard);
    setApiSource("Carta do dia");
  };

  const getPlaceholderImage = (cardName: string) => {
    return `https://via.placeholder.com/300x500/2C2C2C/FFFFFF?text=${encodeURIComponent(cardName || "Tarot")}`;
  };

  useEffect(() => {
    fetchRandomCard();
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#BB86FC" />
          <Text style={styles.loadingText}>Consultando Tarot...</Text>
          <Text style={styles.apiInfo}>Conectando ao servidor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>⚠️ Atenção</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => fetchRandomCard()}
          >
            <Text style={styles.buttonText}>Tentar API novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRandomCard(true)}
            colors={["#BB86FC"]}
            tintColor="#BB86FC"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>🔮 Tarot App</Text>
          <Text style={styles.subtitle}>Consulta de Cartas</Text>
          <View style={styles.apiBadge}>
            <Text style={styles.apiBadgeText}>{apiSource}</Text>
          </View>
        </View>

        {card && (
          <View style={styles.cardContainer}>
            <Text style={styles.cardName}>{card.name}</Text>
            
            <Image
              source={{ uri: card.image || getPlaceholderImage(card.name) }}
              style={styles.cardImage}
              resizeMode="contain"
              onError={() => {
                setCard({
                  ...card,
                  image: getPlaceholderImage(card.name)
                });
              }}
            />
            
            <View style={styles.meaningContainer}>
              <Text style={styles.meaningTitle}> Significado:</Text>
              <Text style={styles.meaningText}>{card.meaning}</Text>
            </View>
            
            {card.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}> Descrição:</Text>
                <Text style={styles.descriptionText}>{card.description}</Text>
              </View>
            )}
            
            <View style={styles.apiInfoContainer}>
              <Text style={styles.apiInfoText}>🔄</Text>
              <Text style={styles.apiInfoSmall}> Rider Waite Tarot </Text>
            </View>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => fetchRandomCard()}
        >
          <Text style={styles.buttonText}> Nova Carta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  scrollContent: { flexGrow: 1, paddingBottom: 100 },
  header: { alignItems: "center", paddingTop: 30, paddingBottom: 15 },
  appTitle: { fontSize: 36, fontWeight: "bold", color: "#BB86FC", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#E0E0E0", marginBottom: 10 },
  apiBadge: { backgroundColor: "#6200EE", paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  apiBadgeText: { color: "#C8E6C9", fontSize: 12, fontWeight: "bold" },
  cardContainer: { backgroundColor: "#1E1E1E", marginHorizontal: 20, marginTop: 20, padding: 25, borderRadius: 20, borderWidth: 1, borderColor: "#333" },
  cardName: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF", marginBottom: 20, textAlign: "center" },
  cardImage: { width: 280, height: 420, borderRadius: 15, marginBottom: 25, backgroundColor: "#2C2C2C", alignSelf: "center" },
  meaningContainer: { width: "100%", marginBottom: 20 },
  meaningTitle: { fontSize: 20, fontWeight: "600", color: "#BB86FC", marginBottom: 10 },
  meaningText: { fontSize: 16, lineHeight: 24, color: "#E0E0E0", textAlign: "justify" },
  descriptionContainer: { width: "100%", backgroundColor: "#252525", padding: 15, borderRadius: 10, marginBottom: 20 },
  descriptionTitle: { fontSize: 18, fontWeight: "600", color: "#6200EE", marginBottom: 8 },
  descriptionText: { fontSize: 14, lineHeight: 22, color: "#CCCCCC", textAlign: "justify" },
  apiInfoContainer: { width: "100%", padding: 15, backgroundColor: "#6200EE", borderRadius: 10 },
  apiInfoText: { color: "#8C9EFF", fontSize: 14, fontWeight: "bold", textAlign: "center" },
  apiInfoSmall: { color: "#C5CAE9", fontSize: 11, textAlign: "center", marginTop: 5 },
  spacer: { height: 100 },
  buttonContainer: { position: "absolute", bottom: 25, left: 25, right: 25 },
  button: { 
    backgroundColor: "#6200EE", 
    paddingVertical: 18, 
    borderRadius: 15, 
    alignItems: "center",
    shadowColor: "#6200EE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  loadingText: { marginTop: 15, fontSize: 16, color: "#BB86FC" },
  apiInfo: { marginTop: 10, fontSize: 14, color: "#90CAF9", textAlign: "center" },
  errorTitle: { fontSize: 24, fontWeight: "bold", color: "#FF5252", marginBottom: 10 },
  errorText: { fontSize: 16, color: "#FF8A80", textAlign: "center", marginBottom: 25, paddingHorizontal: 20 }
});