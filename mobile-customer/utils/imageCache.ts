import * as FileSystem from 'expo-file-system';

interface CachedImage {
  localUri: string;
  serverUrl: string;
  timestamp: number;
}

class ImageCache {
  private cacheDir: string;
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB
  private maxAge: number = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.cacheDir = `${FileSystem.cacheDirectory}chat-images/`;
    this.ensureCacheDir();
  }

  private async ensureCacheDir() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }

  private getFileName(url: string): string {
    // Extract filename from URL or generate one
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    return filename || `image_${Date.now()}.jpg`;
  }

  async getCachedImage(serverUrl: string): Promise<string | null> {
    try {
      const fileName = this.getFileName(serverUrl);
      const localUri = `${this.cacheDir}${fileName}`;
      
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      
      if (fileInfo.exists) {
        // Check if file is not too old
        const now = Date.now();
        const fileAge = now - (fileInfo.modificationTime || 0) * 1000;
        
        if (fileAge < this.maxAge) {
          return localUri;
        } else {
          // Remove old file
          await FileSystem.deleteAsync(localUri);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking cached image:', error);
      return null;
    }
  }

  async cacheImage(serverUrl: string): Promise<string | null> {
    try {
      const fileName = this.getFileName(serverUrl);
      const localUri = `${this.cacheDir}${fileName}`;
      
      // Check if already cached
      const existingCache = await this.getCachedImage(serverUrl);
      if (existingCache) {
        return existingCache;
      }

      // Download and cache the image
      const downloadResult = await FileSystem.downloadAsync(serverUrl, localUri);
      
      if (downloadResult.status === 200) {
        return localUri;
      }
      
      return null;
    } catch (error) {
      console.error('Error caching image:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.cacheDir);
        await this.ensureCacheDir();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(this.cacheDir);
        let totalSize = 0;
        
        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(`${this.cacheDir}${file}`);
          if (fileInfo.exists && !fileInfo.isDirectory) {
            totalSize += fileInfo.size || 0;
          }
        }
        
        return totalSize;
      }
      return 0;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }
}

export const imageCache = new ImageCache();
