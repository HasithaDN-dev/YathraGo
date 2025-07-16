import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Typography } from '@/components/Typography';
import { useProfile } from '@/contexts/ProfileContext';

export function ProfileSwitcher() {
  const { activeProfile, profiles, switchProfile, addChildProfile } = useProfile();
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');

  const handleProfileSwitch = (profileId: string) => {
    switchProfile(profileId);
  };

  const handleAddChild = async () => {
    if (newChildName.trim()) {
      try {
        await addChildProfile({
          name: newChildName.trim(),
          type: 'child'
        });
        setNewChildName('');
        setIsAddingChild(false);
      } catch {
        Alert.alert('Error', 'Failed to add child profile');
      }
    }
  };

  const cancelAddChild = () => {
    setNewChildName('');
    setIsAddingChild(false);
  };

  const startAddingChild = () => {
    setIsAddingChild(true);
  };

  if (!activeProfile) return null;

  return (
    <View className="bg-white border-b border-brand-lightGray">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3"
      >
        <View className="flex-row items-center">
          {profiles.map((profile, index) => (
            <View key={profile.id} className={index > 0 ? "ml-3" : ""}>
              <TouchableOpacity
                onPress={() => handleProfileSwitch(profile.id)}
                className={`px-4 py-2 rounded-full border ${
                  activeProfile.id === profile.id
                    ? 'bg-brand-deepNavy border-brand-deepNavy'
                    : 'bg-white border-brand-lightGray'
                }`}
              >
                <View className="flex-row items-center">
                  {/* Profile Avatar/Icon */}
                  <View className={`w-6 h-6 rounded-full items-center justify-center ${
                    profile.type === 'parent' ? 'bg-brand-brightOrange' : 'bg-brand-softOrange'
                  }`}>
                    <Typography level="caption-1" weight="bold" className="text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </Typography>
                  </View>
                  
                  {/* Profile Name */}
                  <View className="ml-2">
                    <Typography 
                      level="subhead" 
                      className={
                        activeProfile.id === profile.id
                          ? 'text-white'
                          : 'text-black'
                      }
                    >
                      {profile.name}
                    </Typography>
                  </View>
                  
                  {/* Child indicator */}
                  {profile.type === 'child' && (
                    <View className="ml-1 w-2 h-2 bg-success rounded-full" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))}
          
          {/* Add Profile Button */}
          <View className="ml-3">
            {!isAddingChild ? (
              <TouchableOpacity
                onPress={startAddingChild}
                className="px-4 py-2 rounded-full border-2 border-dashed border-brand-neutralGray"
              >
                <View className="flex-row items-center">
                  <Typography level="callout" className="text-brand-neutralGray">+</Typography>
                  <View className="ml-2">
                    <Typography level="subhead" className="text-brand-neutralGray">
                      Add Child
                    </Typography>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center bg-white rounded-full border border-brand-lightGray px-3 py-2">
                <TextInput
                  value={newChildName}
                  onChangeText={setNewChildName}
                  placeholder="Child's name"
                  className="text-sm min-w-[100px]"
                  autoFocus
                  onSubmitEditing={handleAddChild}
                />
                <View className="ml-2">
                  <TouchableOpacity onPress={handleAddChild} className="bg-brand-deepNavy rounded-full w-6 h-6 items-center justify-center">
                    <Typography level="caption-1" className="text-white">✓</Typography>
                  </TouchableOpacity>
                </View>
                <View className="ml-1">
                  <TouchableOpacity onPress={cancelAddChild} className="bg-brand-neutralGray rounded-full w-6 h-6 items-center justify-center">
                    <Typography level="caption-1" className="text-white">✕</Typography>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
