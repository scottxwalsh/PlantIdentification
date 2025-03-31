import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@plant_lens_favorites';
const FAVORITE_COUNTS_KEY = '@plant_lens_favorite_counts';

export const saveFavorite = async (plant) => {
  try {
    const favorites = await getFavorites();
    const isDuplicate = favorites.some(
      (favorite) => favorite.scientificName === plant.scientificName
    );

    if (!isDuplicate) {
      const updatedFavorites = [...favorites, { ...plant, savedAt: new Date().toISOString() }];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      
      // Update favorite count
      const counts = await getFavoriteCounts();
      const currentCount = counts[plant.scientificName] || 0;
      counts[plant.scientificName] = currentCount + 1;
      await AsyncStorage.setItem(FAVORITE_COUNTS_KEY, JSON.stringify(counts));
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving favorite:', error);
    throw error;
  }
};

export const removeFavorite = async (scientificName) => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(
      (favorite) => favorite.scientificName !== scientificName
    );
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    
    // Update favorite count
    const counts = await getFavoriteCounts();
    if (counts[scientificName] > 0) {
      counts[scientificName] -= 1;
      await AsyncStorage.setItem(FAVORITE_COUNTS_KEY, JSON.stringify(counts));
    }
    
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

export const getFavorites = async () => {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const isFavorite = async (scientificName) => {
  try {
    const favorites = await getFavorites();
    return favorites.some((favorite) => favorite.scientificName === scientificName);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

export const getFavoriteCounts = async () => {
  try {
    const counts = await AsyncStorage.getItem(FAVORITE_COUNTS_KEY);
    return counts ? JSON.parse(counts) : {};
  } catch (error) {
    console.error('Error getting favorite counts:', error);
    return {};
  }
};

export const getFavoriteCount = async (scientificName) => {
  try {
    const counts = await getFavoriteCounts();
    return counts[scientificName] || 0;
  } catch (error) {
    console.error('Error getting favorite count:', error);
    return 0;
  }
}; 