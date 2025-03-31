export class ImageProcessingError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'ImageProcessingError';
    this.code = code;
    this.originalError = originalError;
  }
}

export const ImageErrorCodes = {
  VALIDATION: {
    SIZE_EXCEEDED: 'SIZE_EXCEEDED',
    INVALID_TYPE: 'INVALID_TYPE',
    FILE_CORRUPT: 'FILE_CORRUPT',
    NETWORK_ERROR: 'NETWORK_ERROR',
  },
  PROCESSING: {
    RESIZE_FAILED: 'RESIZE_FAILED',
    COMPRESSION_FAILED: 'COMPRESSION_FAILED',
    FORMAT_CONVERSION_FAILED: 'FORMAT_CONVERSION_FAILED',
    UNKNOWN: 'UNKNOWN',
  },
};

export const getErrorMessage = (error) => {
  if (error instanceof ImageProcessingError) {
    switch (error.code) {
      case ImageErrorCodes.VALIDATION.SIZE_EXCEEDED:
        return 'Image size exceeds 5MB limit. Please choose a smaller image.';
      case ImageErrorCodes.VALIDATION.INVALID_TYPE:
        return 'Invalid file type. Please select an image file (JPEG, PNG, etc.).';
      case ImageErrorCodes.VALIDATION.FILE_CORRUPT:
        return 'The image file appears to be corrupted. Please try another image.';
      case ImageErrorCodes.VALIDATION.NETWORK_ERROR:
        return 'Failed to access the image. Please check your connection and try again.';
      case ImageErrorCodes.PROCESSING.RESIZE_FAILED:
        return 'Failed to resize the image. Please try another image.';
      case ImageErrorCodes.PROCESSING.COMPRESSION_FAILED:
        return 'Failed to compress the image. Please try another image.';
      case ImageErrorCodes.PROCESSING.FORMAT_CONVERSION_FAILED:
        return 'Failed to convert image format. Please try another image.';
      case ImageErrorCodes.PROCESSING.UNKNOWN:
        return 'An unexpected error occurred while processing the image.';
      default:
        return error.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
}; 