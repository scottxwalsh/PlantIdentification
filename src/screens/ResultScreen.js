import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const ResultScreen = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [photo, setPhoto] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (route.params?.photo) {
      setPhoto(route.params.photo);
    }
  }, [route.params?.photo]);

  const handleRetake = () => {
    navigation.goBack();
  };

  const handleIdentify = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement plant identification API call here
      // For now, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigation.navigate('PlantDetails', {
        plantData: {
          name: 'Sample Plant',
          scientificName: 'Sample Scientific Name',
          description: 'This is a sample plant description.',
          careInstructions: 'Sample care instructions.',
        }
      });
    } catch (error) {
      console.error('Identification failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!photo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No photo available</Text>
        <TouchableOpacity style={styles.button} onPress={handleRetake}>
          <Text style={styles.buttonText}>Take Photo Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: `file://${photo}` }}
        style={styles.image}
        resizeMode="contain"
      />
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.button, styles.retakeButton]} 
          onPress={handleRetake}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>Retake Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.identifyButton]} 
          onPress={handleIdentify}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Identify Plant</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  image: {
    flex: 1,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  retakeButton: {
    backgroundColor: '#ff4444',
  },
  identifyButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ResultScreen; 