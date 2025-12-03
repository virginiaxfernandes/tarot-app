import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "https://raw.githubusercontent.com/DarienGann/Rider-Waite-Tarot-JSON/main/tarot-images.json";

type TarotCard = {
  rank: number;
  name: string;
  suit: string;
  keywords: string;
  fortune_telling: string[]; 
  meaning_up: string;
  meaning_rev: string;
  desc: string;
  img_url: string; 
};

const Spinner = () => (
  <View style={styles.spinnerContainer}>
    <ActivityIndicator size="large" color="#4F46E5" />
    <Text style={styles.spinnerText}>A carregar baralho...</Text>
  </View>
);

const CardItem: React.FC<{ item: TarotCard }> = ({ item }) => (
  <View style={styles.cardItem}>
    <Image
      source={{
        uri: item.img_url || "https://placehold.co/300x500/f0f0f0/666666?text=Imagem+Nao+Disponivel",
      }}
      style={styles.cardImage}
      onError={(e) => {
        console.log("Erro ao carregar imagem:", e.nativeEvent.error);
      }}
      accessibilityLabel={item.name}
    />

    <Text style={styles.cardTitle}>{item.name}</Text>
    <Text style={styles.cardSuit}>Naipe: {item.suit}</Text>
    
    <View style={styles.meaningContainer}>
      <View style={[styles.meaningBox, styles.meaningUpBorder]}>
        <Text style={styles.meaningUpTitle}>Significado (Normal):</Text>
        <Text style={styles.meaningText}>{item.meaning_up}</Text>
      </View>
      
      <View style={[styles.meaningBox, styles.meaningRevBorder]}>
        <Text style={styles.meaningRevTitle}>Significado (Invertido):</Text>
        <Text style={styles.meaningText}>{item.meaning_rev}</Text>
      </View>
    </View>
    
    <Text style={styles.keywordsText}>
      Palavras-chave: {item.keywords}
    </Text>
  </View>
);

export default function App() {
  const [allCards, setAllCards] = useState<TarotCard[]>([]); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [randomCard, setRandomCard] = useState<TarotCard | null>(null);
  const [showRandomCard, setShowRandomCard] = useState(false);

  // Função para carregar as cartas da API
  const loadAllCards = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Erro de rede: ${res.status} ao carregar o baralho.`);

      const loadedCards: TarotCard[] = await res.json();
      
      const filteredForImages = loadedCards.filter(card => card.img_url);

      setAllCards(filteredForImages); 
      if (error) setError(null); 

    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Ocorreu um erro desconhecido ao carregar as cartas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const drawRandomCard = () => {
    if (allCards.length === 0) {
      Alert.alert("Erro", "O baralho não foi carregado. Tente recarregar.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * allCards.length);
    const card = allCards[randomIndex];
    
    setRandomCard(card);
    setShowRandomCard(true);
    setQuery(""); 
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
        card.suit.toLowerCase().includes(lowerCaseQuery) ||
        card.meaning_up.toLowerCase().includes(lowerCaseQuery) ||
        card.meaning_rev.toLowerCase().includes(lowerCaseQuery) ||
        card.keywords.toLowerCase().includes(lowerCaseQuery)
    );
  }, [allCards, query]); 

  const RandomCardModal = () => {
    if (!showRandomCard || !randomCard) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRandomCard}
        onRequestClose={() => setShowRandomCard(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              Carta Aleatória Sorteada!
            </Text>
            <CardItem item={randomCard} />
            <TouchableOpacity
              onPress={() => setShowRandomCard(false)}
              style={styles.modalCloseButton}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.fullScreenCenter}>
        <Spinner />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tarot Rider-Waite</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        
        <View style={styles.controlsContainer}>
          <TextInput
            placeholder="Buscar por nome, naipe ou significado..."
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            onPress={drawRandomCard}
            style={styles.randomCardButton}
            activeOpacity={0.8}
          >
            <Text style={styles.randomCardButtonText}>Tirar Carta Aleatória</Text>
          </TouchableOpacity>
        </View>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        {refreshing && <Spinner />}
        
        {!loading && !error && filteredCards.length === 0 && (
          <Text style={styles.noResultsText}>Nenhuma carta encontrada para "{query}".</Text>
        )}

        <View style={styles.cardGrid}>
          {filteredCards.map((item) => (
            <CardItem key={item.name} item={item} />
          ))}
        </View>
      </ScrollView>
      
      <RandomCardModal />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  scrollViewContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  fullScreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  spinnerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  spinnerText: {
    marginLeft: 12,
    color: '#4F46E5', 
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '800', 
    textAlign: 'center',
    color: '#3730A3', 
  },
  controlsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EDE9FE', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  searchInput: {
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB', 
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  randomCardButton: {
    backgroundColor: '#9333EA', 
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  randomCardButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#DC2626', 
    fontWeight: '600',
    marginBottom: 16,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#6B7280', 
    marginTop: 32,
    fontSize: 18,
  },
  cardGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EDE9FE', 
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: Dimensions.get('window').height * 0.4, 
    resizeMode: 'contain',
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB', 
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800', 
    marginBottom: 4,
    color: '#3730A3', 
  },
  cardSuit: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#C026D3', 
  },
  meaningContainer: {
    marginTop: 16,
    gap: 12, 
  },
  meaningBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  meaningUpBorder: {
    borderLeftWidth: 4,
    borderColor: '#6366F1', 
    backgroundColor: '#EEF2FF', 
  },
  meaningRevBorder: {
    borderLeftWidth: 4,
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
  },
  meaningUpTitle: {
    fontWeight: 'bold',
    color: '#4338CA',
    marginBottom: 4,
  },
  meaningRevTitle: {
    fontWeight: 'bold',
    color: '#BE185D', 
    marginBottom: 4,
  },
  meaningText: {
    fontSize: 14,
    color: '#374151', 
  },
  keywordsText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 16,
    color: '#6B7280', 
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4338CA',
    marginBottom: 16,
  },
  modalCloseButton: {
    backgroundColor: '#4F46E5', 
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});