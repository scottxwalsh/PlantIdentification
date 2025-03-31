import { API_KEY } from '@env';

const BASE_URL = 'https://api.plant.id/v2';

export const searchPlants = async (query, category = null) => {
  try {
    const response = await fetch(`${BASE_URL}/plants/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY,
      },
      body: JSON.stringify({
        query,
        plant_details: [
          'common_names',
          'description',
          'taxonomy',
          'url',
          'image_url',
          'care_instructions',
          'growing_zones',
          'sunlight',
          'water_needs',
          'soil_type',
          'growth_rate',
          'mature_height',
          'mature_width',
        ],
        filter: category ? { plant_type: category } : undefined,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plants');
    }

    const data = await response.json();
    return data.plants.map(plant => ({
      id: plant.id,
      name: plant.common_name,
      scientificName: plant.scientific_name,
      commonNames: plant.common_names,
      description: plant.description,
      imageUrl: plant.image_url,
      category: plant.plant_type,
      wikiUrl: plant.url,
      care: {
        instructions: plant.care_instructions,
        sunlight: plant.sunlight,
        waterNeeds: plant.water_needs,
        soilType: plant.soil_type,
        growthRate: plant.growth_rate,
        matureHeight: plant.mature_height,
        matureWidth: plant.mature_width,
      },
      growingZones: plant.growing_zones,
    }));
  } catch (error) {
    console.error('Error searching plants:', error);
    throw error;
  }
};

export const getPlantById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/plants/${id}`, {
      headers: {
        'Api-Key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plant details');
    }

    const plant = await response.json();
    return {
      id: plant.id,
      name: plant.common_name,
      scientificName: plant.scientific_name,
      commonNames: plant.common_names,
      description: plant.description,
      imageUrl: plant.image_url,
      category: plant.plant_type,
      wikiUrl: plant.url,
      care: {
        instructions: plant.care_instructions,
        sunlight: plant.sunlight,
        waterNeeds: plant.water_needs,
        soilType: plant.soil_type,
        growthRate: plant.growth_rate,
        matureHeight: plant.mature_height,
        matureWidth: plant.mature_width,
      },
      growingZones: plant.growing_zones,
    };
  } catch (error) {
    console.error('Error fetching plant details:', error);
    throw error;
  }
};

export const getPlantCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/plants/categories`, {
      headers: {
        'Api-Key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plant categories');
    }

    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching plant categories:', error);
    throw error;
  }
}; 