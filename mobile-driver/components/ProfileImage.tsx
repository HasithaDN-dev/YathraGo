import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import { getDriverProfileApi } from '@/lib/api/profile.api';
import { tokenService } from '@/lib/services/token.service';
import { useAuthStore } from '@/lib/stores/auth.store';

interface ProfileImageProps {
  className?: string;
  style?: any;
  size?: number;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({ className, style, size = 96 }) => {
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProfilePicture();
  }, []);

  const fetchProfilePicture = async () => {
    try {
      const token = await tokenService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const profile = await getDriverProfileApi(token);
      setProfilePicUrl(profile.profileImageUrl || null);
    } catch (error: any) {
      console.error('Error fetching profile picture:', error);
      // Fallback to user from store
      setProfilePicUrl(user?.profileImageUrl || null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className={className} style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <ActivityIndicator size="small" color="#1E3A5F" />
      </View>
    );
  }

  if (profilePicUrl) {
    return (
      <Image
        key={profilePicUrl}
        source={{ uri: profilePicUrl }}
        className={className}
        style={[{ width: size, height: size }, style]}
        resizeMode="cover"
      />
    );
  }

  // Fallback to default image
  return (
    <Image
      source={require('../assets/images/profile.png.jpeg')}
      className={className}
      style={[{ width: size, height: size }, style]}
      resizeMode="cover"
    />
  );
};
