import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { CaretDown, Plus } from 'phosphor-react-native';
import { Typography } from '@/components/Typography';

interface Profile {
  id: string;
  name: string;
  fullName: string;
  type: 'child' | 'parent';
}

interface HeaderProps {
  profiles: Profile[];
  selectedProfile: Profile;
  onProfileSelect: (profile: Profile) => void;
  onRefreshPress?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  profiles,
  selectedProfile,
  onProfileSelect,
  onRefreshPress,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleProfilePress = () => {
    setIsDropdownOpen(true);
  };

  const handleProfileSelect = (profile: Profile) => {
    onProfileSelect(profile);
    setIsDropdownOpen(false);
  };


  const renderProfileItem = ({ item, index }: { item: Profile, index: number }) => {
    // If this is the last item and it's the 'add more' placeholder
    if (item.id === 'add-more') {
      return (
        <TouchableOpacity
          className="p-4 flex-row items-center justify-center bg-white"
          onPress={() => {
            // Placeholder for add more action
            setIsDropdownOpen(false);
            // You can add navigation or modal here
            alert('Add More pressed');
          }}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#143373" weight="bold" />
          <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy ml-2">
            Add More
          </Typography>
        </TouchableOpacity>
      );
    }
    // Normal profile item
    return (
      <TouchableOpacity
        className={`p-4 border-b border-gray-100 ${item.id === selectedProfile.id ? 'bg-brand-lightGray' : 'bg-white'}`}
        onPress={() => handleProfileSelect(item)}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <View className="mr-3">
            <Image
              source={require('../../assets/images/profile_Picture.png')}
              style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }}
            />
          </View>
          <View className="flex-1">
            <Typography variant="subhead" weight="semibold" className="text-black">
              {item.name}
            </Typography>
            <Typography variant="footnote" className="text-brand-neutralGray">
              {item.fullName}
            </Typography>
          </View>
          {item.id === selectedProfile.id && (
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
                source={require('../../assets/images/profile_Picture.png')}
                style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }}
              />
            </View>
            
            {/* Profile Info */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Typography variant="subhead" weight="semibold" className="text-black mr-2">
                  {selectedProfile.name}
                </Typography>
                <CaretDown size={16} color="#6b7280" weight="bold" />
              </View>
              <Typography variant="footnote" className="text-brand-neutralGray">
                {selectedProfile.fullName}
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
                data={[...profiles, { id: 'add-more', name: '', fullName: '', type: 'parent' as const }]}
                renderItem={({ item, index }) => renderProfileItem({ item, index })}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}; 