import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { ImageProcessingError, ImageErrorCodes } from './errorHandling';

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

    if (!resizedImage.uri) {
      throw new ImageProcessingError(
        'Failed to process image',
        ImageErrorCodes.PROCESSING.UNKNOWN
      );
    }

    return resizedImage.uri;
  } catch (error) {
    if (error instanceof ImageProcessingError) {
      throw error;
    }
    
    // Handle specific manipulation errors
    if (error.message?.includes('resize')) {
      throw new ImageProcessingError(
        'Failed to resize image',
        ImageErrorCodes.PROCESSING.RESIZE_FAILED,
        error
      );
    }
    
    if (error.message?.includes('compress')) {
      throw new ImageProcessingError(
        'Failed to compress image',
        ImageErrorCodes.PROCESSING.COMPRESSION_FAILED,
        error
      );
    }
    
    if (error.message?.includes('format')) {
      throw new ImageProcessingError(
        'Failed to convert image format',
        ImageErrorCodes.PROCESSING.FORMAT_CONVERSION_FAILED,
        error
      );
    }

    throw new ImageProcessingError(
      'Failed to preprocess image',
      ImageErrorCodes.PROCESSING.UNKNOWN,
      error
    );
  }
};

export const validateImage = async (imageUri) => {
  try {
    const response = await fetch(imageUri);
    
    if (!response.ok) {
      throw new ImageProcessingError(
        'Failed to access image',
        ImageErrorCodes.VALIDATION.NETWORK_ERROR
      );
    }

    const blob = await response.blob();
    
    // Check file size (max 5MB)
    if (blob.size > 5 * 1024 * 1024) {
      throw new ImageProcessingError(
        'Image size exceeds limit',
        ImageErrorCodes.VALIDATION.SIZE_EXCEEDED
      );
    }

    // Check file type
    if (!blob.type.startsWith('image/')) {
      throw new ImageProcessingError(
        'Invalid file type',
        ImageErrorCodes.VALIDATION.INVALID_TYPE
      );
    }

    // Additional validation: Try to create an image object
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => {
        reject(new ImageProcessingError(
          'Invalid image file',
          ImageErrorCodes.VALIDATION.FILE_CORRUPT
        ));
      };
      img.src = imageUri;
    });
  } catch (error) {
    if (error instanceof ImageProcessingError) {
      throw error;
    }
    
    if (error.message?.includes('network')) {
      throw new ImageProcessingError(
        'Network error while accessing image',
        ImageErrorCodes.VALIDATION.NETWORK_ERROR,
        error
      );
    }

    throw new ImageProcessingError(
      'Failed to validate image',
      ImageErrorCodes.VALIDATION.UNKNOWN,
      error
    );
  }
}; 