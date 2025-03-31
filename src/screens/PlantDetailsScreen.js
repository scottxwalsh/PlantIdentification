import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { saveFavorite, removeFavorite, isFavorite, getFavoriteCount } from '../services/storage';

const PlantDetailsScreen = () => {
  const route = useRoute();
  const { plantData } = route.params;
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    checkFavoriteStatus();
    loadFavoriteCount();
  }, []);

  const checkFavoriteStatus = async () => {
    try {
      const favorited = await isFavorite(plantData.scientificName);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const loadFavoriteCount = async () => {
    try {
      const count = await getFavoriteCount(plantData.scientificName);
      setFavoriteCount(count);
    } catch (error) {
      console.error('Error loading favorite count:', error);
    }
  };

  const handleShare = async () => {
    try {
      const message = `I identified this plant as ${plantData.name} (${plantData.scientificName}) using Plant Lens!`;
      await Share.share({
        message,
        title: 'Plant Identification Result',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWikiLink = () => {
    if (plantData.wikiUrl) {
      Linking.openURL(plantData.wikiUrl);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorited) {
        await removeFavorite(plantData.scientificName);
        setIsFavorited(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
      } else {
        const saved = await saveFavorite(plantData);
        if (saved) {
          setIsFavorited(true);
          setFavoriteCount(prev => prev + 1);
        } else {
          Alert.alert('Already Saved', 'This plant is already in your favorites.');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const renderCareSection = () => {
    if (!plantData.care) return null;

    const careItems = [
      { icon: 'white-balance-sunny', label: 'Sunlight', value: plantData.care.sunlight },
      { icon: 'water', label: 'Water Needs', value: plantData.care.waterNeeds },
      { icon: 'sprout', label: 'Growth Rate', value: plantData.care.growthRate },
      { icon: 'ruler', label: 'Mature Size', value: `${plantData.care.matureHeight} × ${plantData.care.matureWidth}` },
      { icon: 'soil', label: 'Soil Type', value: plantData.care.soilType },
    ].filter(item => item.value);

    if (careItems.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Care Requirements</Text>
        <View style={styles.careGrid}>
          {careItems.map((item, index) => (
            <View key={index} style={styles.careItem}>
              <Icon name={item.icon} size={24} color="#4CAF50" />
              <Text style={styles.careLabel}>{item.label}</Text>
              <Text style={styles.careValue}>{item.value}</Text>
            </View>
          ))}
        </View>
        {plantData.care.instructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Care Instructions</Text>
            <Text style={styles.instructionsText}>{plantData.care.instructions}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderGrowingZones = () => {
    if (!plantData.growingZones || plantData.growingZones.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Growing Zones</Text>
        <View style={styles.zonesContainer}>
          {plantData.growingZones.map((zone, index) => (
            <View key={index} style={styles.zoneTag}>
              <Text style={styles.zoneText}>USDA {zone}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.plantName}>{plantData.name}</Text>
          <Text style={styles.scientificName}>{plantData.scientificName}</Text>
        </View>
        <View style={styles.headerButtons}>
          <View style={styles.favoriteContainer}>
            <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={handleFavoriteToggle}
            >
              <Icon 
                name={isFavorited ? 'heart' : 'heart-outline'} 
                size={24} 
                color={isFavorited ? '#ff4444' : '#4CAF50'} 
              />
            </TouchableOpacity>
            <Text style={styles.favoriteCount}>{favoriteCount}</Text>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Icon name="share-variant" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceBar}>
          <View 
            style={[
              styles.confidenceFill, 
              { width: `${plantData.confidence * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.confidenceText}>
          {Math.round(plantData.confidence * 100)}% Confidence
        </Text>
      </View>

      {plantData.commonNames && plantData.commonNames.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Names</Text>
          <View style={styles.commonNamesContainer}>
            {plantData.commonNames.map((name, index) => (
              <View key={index} style={styles.commonNameTag}>
                <Text style={styles.commonNameText}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {renderCareSection()}
      {renderGrowingZones()}

      {plantData.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{plantData.description}</Text>
        </View>
      )}

      {plantData.wikiUrl && (
        <TouchableOpacity 
          style={styles.wikiButton}
          onPress={handleWikiLink}
        >
          <Icon name="wikipedia" size={24} color="#4CAF50" />
          <Text style={styles.wikiButtonText}>View on Wikipedia</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scientificName: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  favoriteContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  shareButton: {
    padding: 8,
  },
  confidenceContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  confidenceText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  commonNamesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  commonNameTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  commonNameText: {
    color: '#2e7d32',
    fontSize: 14,
  },
  descriptionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  wikiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  wikiButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  careGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  careItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  careLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  careValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  instructionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  zonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zoneTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  zoneText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PlantDetailsScreen; 