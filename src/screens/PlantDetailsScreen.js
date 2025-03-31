import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PlantDetailsScreen = () => {
  const route = useRoute();
  const { plantData } = route.params;

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.plantName}>{plantData.name}</Text>
          <Text style={styles.scientificName}>{plantData.scientificName}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share-variant" size={24} color="#4CAF50" />
        </TouchableOpacity>
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
});

export default PlantDetailsScreen; 