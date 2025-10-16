import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import { getDriverProfileById } from '@/lib/api/profile.api';

interface ProfileImageProps {
  className?: string;
  style?: any;
  size?: number;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({ className, style, size = 96 }) => {
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const DRIVER_ID = 1; // HARDCODED FOR TESTING

  useEffect(() => {
    fetchProfilePicture();
  }, []);

  const fetchProfilePicture = async () => {
    try {
      const profile = await getDriverProfileById(DRIVER_ID);
      setProfilePicUrl(profile.profile_picture_url || null);
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      setProfilePicUrl(null);
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
