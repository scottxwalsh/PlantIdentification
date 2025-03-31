import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { searchPlants, getPlantCategories } from '../services/plantEncyclopedia';

const FILTER_OPTIONS = {
  waterNeeds: ['Low', 'Moderate', 'High'],
  sunlight: ['Low', 'Partial', 'Full'],
  difficulty: ['Easy', 'Moderate', 'Hard'],
};

const PlantEncyclopediaScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(['All']);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    waterNeeds: null,
    sunlight: null,
    difficulty: null,
  });

  useEffect(() => {
    loadCategories();
    loadPlants();
  }, [selectedCategory, filters]);

  const loadCategories = async () => {
    try {
      const plantCategories = await getPlantCategories();
      setCategories(['All', ...plantCategories]);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load plant categories');
    }
  };

  const loadPlants = async () => {
    setLoading(true);
    try {
      const category = selectedCategory === 'All' ? null : selectedCategory;
      const results = await searchPlants(searchQuery, category);
      
      // Apply filters
      let filteredResults = results;
      if (filters.waterNeeds) {
        filteredResults = filteredResults.filter(
          plant => plant.care.waterNeeds === filters.waterNeeds
        );
      }
      if (filters.sunlight) {
        filteredResults = filteredResults.filter(
          plant => plant.care.sunlight === filters.sunlight
        );
      }
      if (filters.difficulty) {
        filteredResults = filteredResults.filter(
          plant => plant.care.difficulty === filters.difficulty
        );
      }

      setPlants(filteredResults);
    } catch (error) {
      console.error('Error loading plants:', error);
      Alert.alert('Error', 'Failed to load plants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    setTimeout(() => {
      loadPlants();
    }, 500);
  };

  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value,
    }));
  };

  const renderFilterButton = (type, value) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filters[type] === value && styles.filterButtonActive,
      ]}
      onPress={() => toggleFilter(type, value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filters[type] === value && styles.filterButtonTextActive,
        ]}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterSection = (title, type, options) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <View style={styles.filterOptions}>
        {options.map(option => renderFilterButton(type, option))}
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Plants</Text>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {renderFilterSection('Water Needs', 'waterNeeds', FILTER_OPTIONS.waterNeeds)}
          {renderFilterSection('Sunlight', 'sunlight', FILTER_OPTIONS.sunlight)}
          {renderFilterSection('Difficulty', 'difficulty', FILTER_OPTIONS.difficulty)}

          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => setFilters({ waterNeeds: null, sunlight: null, difficulty: null })}
          >
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPlantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.plantCard}
      onPress={() => navigation.navigate('PlantDetails', { plantData: item })}
    >
      <View style={styles.plantImageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.plantImage}
          defaultSource={require('../assets/placeholder-plant.png')}
        />
      </View>
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.scientificName}>{item.scientificName}</Text>
        <View style={styles.plantDetails}>
          <View style={styles.detailItem}>
            <Icon name="lightbulb-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.care.sunlight}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="water-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.care.waterNeeds}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="leaf-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search plants..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFiltersCount > 0 && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Icon
            name="filter-variant"
            size={24}
            color={activeFiltersCount > 0 ? '#fff' : '#666'}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : plants.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="leaf-off" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>
            {searchQuery
              ? 'No plants found matching your search'
              : 'No plants available with current filters'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={plants}
          renderItem={renderPlantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.plantsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  plantsList: {
    padding: 16,
  },
  plantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  plantImageContainer: {
    width: 120,
    height: 120,
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  plantInfo: {
    flex: 1,
    padding: 12,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scientificName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  plantDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  clearFiltersText: {
    color: '#666',
    fontSize: 16,
  },
  filterBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PlantEncyclopediaScreen; 