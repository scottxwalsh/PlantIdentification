import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const TARGET_SIZE = 1024; // Maximum dimension size for optimal API performance
const QUALITY = 0.8; // JPEG quality (0 to 1)

export const preprocessImage = async (imageUri) => {
  try {
    // First, resize the image while maintaining aspect ratio
    const resizedImage = await manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: TARGET_SIZE,
            height: TARGET_SIZE,
            fit: 'inside', // Maintain aspect ratio
          },
        },
        {
          compress: {
            quality: QUALITY,
            format: SaveFormat.JPEG,
          },
        },
      ],
      {
        compress: true,
        format: SaveFormat.JPEG,
      }
    );

    return resizedImage.uri;
  } catch (error) {
    console.error('Image preprocessing failed:', error);
    throw new Error('Failed to preprocess image');
  }
};

export const validateImage = async (imageUri) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Check file size (max 5MB)
    if (blob.size > 5 * 1024 * 1024) {
      throw new Error('Image size exceeds 5MB limit');
    }

    // Check file type
    if (!blob.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }

    return true;
  } catch (error) {
    console.error('Image validation failed:', error);
    throw error;
  }
}; 