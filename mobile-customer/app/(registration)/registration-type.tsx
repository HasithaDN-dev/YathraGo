import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormHeader } from '../../components/ui/FormHeader';
import { CustomButton } from '../../components/ui/CustomButton';
import { Colors } from '../../constants/Colors';

export default function RegistrationTypeScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'staff' | 'child' | null>(null);

  const handleContinue = () => {
    if (!selectedType) {
      Alert.alert('Selection Required', 'Please select a registration type to continue.');
      return;
    }

    if (selectedType === 'staff') {
      router.push('./staff-passenger');
    } else {
      router.push('./child-registration');
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F9FAFB' }}>
      <View className="flex-1 px-6 py-8">
        <FormHeader
          title="Registration"
          subtitle="Choose your registration type to get started"
          showLogo={true}
        />

        {/* Registration Type Cards */}
        <View className="flex-1 justify-center space-y-4">
          {/* Staff Passenger Option */}
          <TouchableOpacity
            onPress={() => setSelectedType('staff')}
            className={`p-6 rounded-xl border-2 bg-white ${
              selectedType === 'staff'
                ? 'border-blue-600'
                : 'border-gray-200'
            }`}
            style={{
              borderColor: selectedType === 'staff' ? Colors.tabIconSelected : '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text 
                  className="text-xl font-semibold mb-2"
                  style={{ 
                    fontFamily: 'Figtree-SemiBold',
                    color: '#000000'
                  }}
                >
                  Register as Staff Passenger
                </Text>
                <Text 
                  className="text-gray-600"
                  style={{ 
                    fontFamily: 'Figtree-Regular',
                    color: Colors.tabIconDefault
                  }}
                >
                  For employees commuting to work locations
                </Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedType === 'staff'
                    ? 'border-blue-600'
                    : 'border-gray-300'
                }`}
                style={{
                  borderColor: selectedType === 'staff' ? Colors.tabIconSelected : '#D1D5DB',
                  backgroundColor: selectedType === 'staff' ? Colors.tabIconSelected : 'transparent'
                }}
              >
                {selectedType === 'staff' && (
                  <View className="w-2 h-2 bg-white rounded-full" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Child Registration Option */}
          <TouchableOpacity
            onPress={() => setSelectedType('child')}
            className={`p-6 rounded-xl border-2 bg-white ${
              selectedType === 'child'
                ? 'border-blue-600'
                : 'border-gray-200'
            }`}
            style={{
              borderColor: selectedType === 'child' ? Colors.tabIconSelected : '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text 
                  className="text-xl font-semibold mb-2"
                  style={{ 
                    fontFamily: 'Figtree-SemiBold',
                    color: '#000000'
                  }}
                >
                  Register for Child
                </Text>
                <Text 
                  className="text-gray-600"
                  style={{ 
                    fontFamily: 'Figtree-Regular',
                    color: Colors.tabIconDefault
                  }}
                >
                  For parents registering their children for school transport
                </Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedType === 'child'
                    ? 'border-blue-600'
                    : 'border-gray-300'
                }`}
                style={{
                  borderColor: selectedType === 'child' ? Colors.tabIconSelected : '#D1D5DB',
                  backgroundColor: selectedType === 'child' ? Colors.tabIconSelected : 'transparent'
                }}
              >
                {selectedType === 'child' && (
                  <View className="w-2 h-2 bg-white rounded-full" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <View className="mt-8">
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedType}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
