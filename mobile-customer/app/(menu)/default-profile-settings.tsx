import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import CustomButton from '@/components/ui/CustomButton';
import { useProfileStore, DefaultProfileOption } from '@/lib/stores/profile.store';
import { CheckCircle } from 'phosphor-react-native';

export default function DefaultProfileSettingsScreen() {
  const { 
    profiles, 
    setDefaultProfileSettings, 
    getDefaultProfileSettings 
  } = useProfileStore();

  const [selectedOption, setSelectedOption] = useState<DefaultProfileOption>(DefaultProfileOption.LAST_USED);
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>();

  const loadCurrentSettings = async () => {
    const settings = await getDefaultProfileSettings();
    setSelectedOption(settings.option);
    setSelectedProfileId(settings.specificProfileId);
  };

  useEffect(() => {
    loadCurrentSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    const settings = {
      option: selectedOption,
      specificProfileId: selectedOption === DefaultProfileOption.SPECIFIC_PROFILE ? selectedProfileId : undefined,
    };

    if (selectedOption === DefaultProfileOption.SPECIFIC_PROFILE && !selectedProfileId) {
      Alert.alert('Selection Required', 'Please select a specific profile when choosing this option.');
      return;
    }

    await setDefaultProfileSettings(settings);
    Alert.alert('Success', 'Default profile settings have been saved.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const renderProfileOption = (profile: any) => {
    const isSelected = selectedProfileId === profile.id;
    const displayName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const profileLabel = profile.type === 'child' ? (profile.relationship || 'Child') : 'Own';

    return (
      <TouchableOpacity
        key={profile.id}
        className={`p-4 border-2 rounded-xl mb-3 ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
        }`}
        onPress={() => setSelectedProfileId(profile.id)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Typography variant="subhead" weight="semibold" className="text-black">
              {displayName || 'Profile'}
            </Typography>
            <Typography variant="footnote" className="text-gray-600">
              {profileLabel}
            </Typography>
          </View>
          {isSelected ? (
            <CheckCircle size={24} color="#3b82f6" weight="fill" />
          ) : (
            <View className="w-6 h-6 border-2 border-gray-400 rounded-full" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Default Profile Settings" />
        
        <View className="px-4 pb-6">
          <Typography variant="body" className="text-gray-600 mb-6">
            Choose how you want to select the default profile when opening the app.
          </Typography>

          {/* Option 1: Last Used Profile */}
          <Card className="mb-4">
            <TouchableOpacity
              className="p-4"
              onPress={() => setSelectedOption(DefaultProfileOption.LAST_USED)}
            >
              <View className="flex-row items-center">
                {selectedOption === DefaultProfileOption.LAST_USED ? (
                  <CheckCircle size={24} color="#3b82f6" weight="fill" />
                ) : (
                  <View className="w-6 h-6 border-2 border-gray-400 rounded-full" />
                )}
                <View className="flex-1 ml-3">
                  <Typography variant="subhead" weight="semibold" className="text-black mb-1">
                    Last Used Profile
                  </Typography>
                  <Typography variant="footnote" className="text-gray-600">
                    Always open with the profile you used last time
                  </Typography>
                </View>
              </View>
            </TouchableOpacity>
          </Card>

          {/* Option 2: Specific Profile */}
          <Card className="mb-4">
            <TouchableOpacity
              className="p-4"
              onPress={() => setSelectedOption(DefaultProfileOption.SPECIFIC_PROFILE)}
            >
              <View className="flex-row items-center">
                {selectedOption === DefaultProfileOption.SPECIFIC_PROFILE ? (
                  <CheckCircle size={24} color="#3b82f6" weight="fill" />
                ) : (
                  <View className="w-6 h-6 border-2 border-gray-400 rounded-full" />
                )}
                <View className="flex-1 ml-3">
                  <Typography variant="subhead" weight="semibold" className="text-black mb-1">
                    Specific Profile
                  </Typography>
                  <Typography variant="footnote" className="text-gray-600">
                    Always open with a specific profile you choose
                  </Typography>
                </View>
              </View>
            </TouchableOpacity>
          </Card>

          {/* Profile Selection - Only show when specific profile is selected */}
          {selectedOption === DefaultProfileOption.SPECIFIC_PROFILE && (
            <View className="mb-4">
              <Typography variant="subhead" weight="semibold" className="text-black mb-3">
                Select Default Profile:
              </Typography>
              {profiles.map(renderProfileOption)}
            </View>
          )}

          {/* Option 3: First Available */}
          <Card className="mb-6">
            <TouchableOpacity
              className="p-4"
              onPress={() => setSelectedOption(DefaultProfileOption.FIRST_AVAILABLE)}
            >
              <View className="flex-row items-center">
                {selectedOption === DefaultProfileOption.FIRST_AVAILABLE ? (
                  <CheckCircle size={24} color="#3b82f6" weight="fill" />
                ) : (
                  <View className="w-6 h-6 border-2 border-gray-400 rounded-full" />
                )}
                <View className="flex-1 ml-3">
                  <Typography variant="subhead" weight="semibold" className="text-black mb-1">
                    First Available
                  </Typography>
                  <Typography variant="footnote" className="text-gray-600">
                    Always open with the first profile in your list
                  </Typography>
                </View>
              </View>
            </TouchableOpacity>
          </Card>

          {/* Save Button */}
          <CustomButton
            title="Save Settings"
            onPress={handleSave}
            bgVariant="primary"
            textVariant="white"
            className="mt-4"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}