import axios from 'axios';
import { PLANT_ID_API_KEY, PLANT_ID_API_URL } from '@env';
import { preprocessImage, validateImage } from '../utils/imageProcessing';

export const identifyPlant = async (imagePath) => {
  try {
    // Validate image first
    await validateImage(imagePath);
    
    // Preprocess the image
    const processedImageUri = await preprocessImage(imagePath);
    
    // Convert processed image to base64
    const response = await fetch(processedImageUri);
    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        try {
          const apiResponse = await axios.post(
            PLANT_ID_API_URL,
            {
              images: [base64data],
              plant_details: ['common_names', 'description', 'taxonomy', 'url'],
            },
            {
              headers: {
                'Api-Key': PLANT_ID_API_KEY,
                'Content-Type': 'application/json',
              },
            }
          );

          if (apiResponse.data.suggestions && apiResponse.data.suggestions.length > 0) {
            const bestMatch = apiResponse.data.suggestions[0];
            resolve({
              name: bestMatch.plant_name,
              scientificName: bestMatch.plant_details?.taxonomy?.scientific_name || '',
              description: bestMatch.plant_details?.description || '',
              commonNames: bestMatch.plant_details?.common_names || [],
              confidence: bestMatch.probability,
              wikiUrl: bestMatch.plant_details?.url || '',
            });
          } else {
            reject(new Error('No plant matches found'));
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw error;
  }
}; 