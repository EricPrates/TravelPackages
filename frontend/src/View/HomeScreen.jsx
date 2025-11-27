import { FlatList, View, StyleSheet, SafeAreaView, Text, TouchableOpacity, Image } from "react-native";
import { Searchbar } from "react-native-paper";
import { useState } from "react";

// Dados mock para exemplo - substitua pelos seus dados reais
const TRAVEL_PACKAGES = [
  {
    id: '1',
    title: 'Paris Romântico',
    description: '5 dias na cidade luz com hospedagem premium',
    price: 1200,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
    location: 'Paris, França',
    duration: '5 dias',
    isFeatured: true
  },
  {
    id: '2',
    title: 'Praias do Caribe',
    description: '7 dias no paraíso tropical com tudo incluído',
    price: 1800,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    location: 'Cancún, México',
    duration: '7 dias',
    isFeatured: true
  },
  {
    id: '3',
    title: 'Aventura na Montanha',
    description: 'Trilhas e natureza nos Alpes Suíços',
    price: 950,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    location: 'Interlaken, Suíça',
    duration: '4 dias',
    isFeatured: false
  },
  {
    id: '4',
    title: 'Cultural no Japão',
    description: 'Tradição e modernidade em Tóquio e Kyoto',
    price: 2200,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1540959733332-8ab49de55d07?w=400',
    location: 'Tóquio, Japão',
    duration: '10 dias',
    isFeatured: true
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPackages, setFilteredPackages] = useState(TRAVEL_PACKAGES);


  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = TRAVEL_PACKAGES.filter(pkg =>
        pkg.title.toLowerCase().includes(query.toLowerCase()) ||
        pkg.location.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages(TRAVEL_PACKAGES);
    }
  };

  const renderTravelPackage = ({ item }) => (
    <TouchableOpacity style={styles.packageCard}>
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Destaque</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.packageTitle}>{item.title}</Text>
          <Text style={styles.packagePrice}>${item.price}</Text>
        </View>
        
        <Text style={styles.packageLocation}>📍 {item.location}</Text>
        <Text style={styles.packageDescription}>{item.description}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.durationTag}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Reservar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.greeting}>Olá, Viajante! ✈️</Text>
      <Text style={styles.subtitle}>Encontre seu próximo destino dos sonhos</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🌎</Text>
      <Text style={styles.emptyStateTitle}>Nenhum destino encontrado</Text>
      <Text style={styles.emptyStateText}>
        Tente ajustar sua busca ou explore nossos pacotes em destaque
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderHeader()}
        
        <Searchbar
          placeholder="Buscar destinos, locais, experiências..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#6366f1"
          placeholderTextColor="#94a3b8"
        />

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {searchQuery ? 'Resultados da Busca' : 'Pacotes em Destaque'}
          </Text>
          <Text style={styles.resultsCount}>
            {filteredPackages.length} {filteredPackages.length === 1 ? 'pacote' : 'pacotes'}
          </Text>
        </View>

        <FlatList
          data={filteredPackages}
          renderItem={renderTravelPackage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {

    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
   
    
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
   
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    fontFamily: 'System',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'System',
  },
  searchBar: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchInput: {
    fontSize: 16,
    color: '#1e293b',
    fontFamily: 'System',
  },
  resultsHeader: {
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding : 5,
    

    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    fontFamily: 'System',
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'System',
  },
  listContent: {
    paddingBottom: 20,
  },
  packageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featuredText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ratingText: {
    color: '#1e293b',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    fontFamily: 'System',
    flex: 1,
    marginRight: 12,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    fontFamily: 'System',
  },
  packageLocation: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'System',
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'System',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    fontFamily: 'System',
  },
  bookButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  separator: {
    height: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'System',
  },
});