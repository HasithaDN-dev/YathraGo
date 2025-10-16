import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { CaretDown, Plus } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { useProfileStore } from '@/lib/stores/profile.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Profile } from '@/types/customer.types';
import { router } from 'expo-router';

interface HeaderProps {
  onRefreshPress?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onRefreshPress,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { profiles, activeProfile, setActiveProfile, loadProfiles, isLoading } = useProfileStore();
  const { accessToken } = useAuthStore();

  // Debug logging for profile data
  console.log('Header - Profile Store State:', {
    profilesCount: profiles.length,
    profiles: profiles,
    activeProfile: activeProfile,
    isLoading: isLoading,
    accessToken: accessToken ? 'Present' : 'Missing'
  });

  useEffect(() => {
    console.log('Header - useEffect triggered:', {
      hasAccessToken: !!accessToken,
      profilesLength: profiles.length,
      willLoadProfiles: accessToken && profiles.length === 0
    });
    
    if (accessToken && profiles.length === 0) {
      console.log('Header - Loading profiles with access token');
      loadProfiles(accessToken);
    }
  }, [accessToken, profiles.length, loadProfiles]);

  const handleProfilePress = () => {
    setIsDropdownOpen(true);
  };

  const handleProfileSelect = (profile: Profile) => {
    console.log('Header - Profile selected:', {
      profileId: profile.id,
      profileType: profile.type,
      profileName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      fullProfile: profile
    });
    setActiveProfile(profile.id);
    setIsDropdownOpen(false);
  };

  const handleAddMorePress = () => {
    setIsDropdownOpen(false);
    
    // Check if any profile is of type 'staff'
    const hasStaffProfile = profiles.some(profile => profile.type === 'staff');
    
    console.log('Header - handleAddMorePress:', {
      profilesCount: profiles.length,
      hasStaffProfile: hasStaffProfile,
      profileTypes: profiles.map(p => p.type)
    });
    
    if (hasStaffProfile) {
      // If staff profile exists, only allow child registration
      console.log('Header - Navigating to child-only registration');
      router.push('/(registration)/registration-type?mode=child');
    } else {
      // If no staff profile, show both options
      console.log('Header - Navigating to full registration options');
      router.push('/(registration)/registration-type');
    }
  };

  // Show loading state if profiles are being loaded
  if (isLoading && !activeProfile) {
    return (
      <View className={`bg-white rounded-2xl p-4 mx-4 mt-4 mb-0 ${className}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-gray-200 rounded-full mr-3 animate-pulse" />
            <View className="flex-1">
              <View className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
              <View className="h-3 bg-gray-200 rounded animate-pulse w-24" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // If no active profile, don't render
  if (!activeProfile) {
    return null;
  }

  const getDisplayName = (profile: Profile) => {
    const displayName = profile.type === 'child' 
      ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Child'
      : `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Staff Passenger';
    
    console.log('Header - getDisplayName:', {
      profileId: profile.id,
      profileType: profile.type,
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: displayName
    });
    
    return displayName;
  };

  const getProfileLabel = (profile: Profile) => {
    const label = profile.type === 'child' 
      ? profile.relationship || 'Child'
      : 'Own';
    
    console.log('Header - getProfileLabel:', {
      profileId: profile.id,
      profileType: profile.type,
      relationship: profile.relationship,
      label: label
    });
    
    return label;
  };


  const renderProfileItem = ({ item }: { item: Profile | { id: string; name: string; type: 'add-more' } }) => {
    // If this is the last item and it's the 'add more' placeholder
    if (item.id === 'add-more') {
      return (
        <TouchableOpacity
          className="p-4 flex-row items-center justify-center bg-white"
          onPress={handleAddMorePress}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#143373" weight="bold" />
          <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy ml-2">
            Add More
          </Typography>
        </TouchableOpacity>
      );
    }
    
    // Normal profile item - cast item as Profile since we know it's not add-more
    const profile = item as Profile;
    const isSelected = profile.id === activeProfile?.id;
    
    return (
      <TouchableOpacity
        className={`p-4 border-b border-gray-100 ${isSelected ? 'bg-brand-lightGray' : 'bg-white'}`}
        onPress={() => handleProfileSelect(profile)}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <View className="mr-3">
            <Image
              source={
                profile.profileImageUrl || profile.childImageUrl 
                  ? { uri: profile.profileImageUrl || profile.childImageUrl } 
                  : require('../../assets/images/profile_Picture.png')
              }
              style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }}
            />
          </View>
          <View className="flex-1">
            <Typography variant="subhead" weight="semibold" className="text-black">
              {getDisplayName(profile)}
            </Typography>
            <Typography variant="footnote" className="text-brand-neutralGray">
              {getProfileLabel(profile)}
            </Typography>
          </View>
          {isSelected && (
            <View className="w-2 h-2 bg-brand-deepNavy rounded-full" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View className={`bg-white rounded-2xl p-4 mx-4 mt-4 mb-0 ${className}`}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            className="flex-row items-center flex-1"
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            {/* Profile Icon with Complete Silhouette */}
            <View className="mr-3">
              <Image
                source={
                  activeProfile.profileImageUrl || activeProfile.childImageUrl 
                    ? { uri: activeProfile.profileImageUrl || activeProfile.childImageUrl } 
                    : require('../../assets/images/profile_Picture.png')
                }
                style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }}
              />
            </View>
            
            {/* Profile Info */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Typography variant="subhead" weight="semibold" className="text-black mr-2">
                  {getDisplayName(activeProfile)}
                </Typography>
                <CaretDown size={16} color="#6b7280" weight="bold" />
              </View>
              <Typography variant="footnote" className="text-brand-neutralGray">
                {getProfileLabel(activeProfile)}
              </Typography>
            </View>
          </TouchableOpacity>
          
          {/* YathraGo Logo as Square Button */}
          <TouchableOpacity 
            className="items-center justify-center"
            onPress={onRefreshPress}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/images/icon.png')}
              style={{ width: 38, height: 38 , resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50"
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View className="flex-1 justify-start pt-20 px-4">
            <View className="bg-white rounded-2xl shadow-lg max-h-80">
              <View className="p-4 border-b border-gray-100">
                <Typography variant="title-3" weight="semibold" className="text-black">
                  Select Profile
                </Typography>
              </View>
              <FlatList
                data={[...profiles, { id: 'add-more', name: '', type: 'add-more' as const }]}
                renderItem={({ item }) => renderProfileItem({ item })}
                keyExtractor={(item, index) => `${item.type || 'profile'}-${item.id || index}`}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}; 