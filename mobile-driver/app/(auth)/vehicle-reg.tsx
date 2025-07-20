import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Icon } from '@/components/ui/Icon';
import * as ImagePicker from 'expo-image-picker';
import { useRegistration } from '@/contexts/RegistrationContext';

interface PhotoUploadBoxProps {
  label: string;
  image: ImagePicker.ImagePickerAsset | null;
  onUpload: () => void;
}

const PhotoUploadBox: React.FC<PhotoUploadBoxProps> = ({ label, image, onUpload }) => (
  <TouchableOpacity className="items-center justify-center w-36 h-36 bg-brand-lightGray rounded-lg border-2 border-dashed border-gray-300" onPress={onUpload}>
    {image ? (
      <Image source={{ uri: image.uri }} className="w-full h-full rounded-lg" resizeMode="cover" />
    ) : (
      <>
        <Icon name="Camera" size={32} color="#A0A0A0" />
        <Text className="text-brand-neutralGray mt-2">{label}</Text>
      </>
    )}
  </TouchableOpacity>
);

export default function VehicleRegScreen() {
  const router = useRouter();
  const { registrationData, updateVehicleInfo } = useRegistration();

  const [vehicleType, setVehicleType] = useState(registrationData.vehicleInfo.vehicleType);
  const [vehicleBrand, setVehicleBrand] = useState(registrationData.vehicleInfo.vehicleBrand);
  const [vehicleModel, setVehicleModel] = useState(registrationData.vehicleInfo.vehicleModel);
  const [yearOfManufacture, setYearOfManufacture] = useState(registrationData.vehicleInfo.yearOfManufacture);
  const [vehicleColor, setVehicleColor] = useState(registrationData.vehicleInfo.vehicleColor);
  const [licensePlate, setLicensePlate] = useState(registrationData.vehicleInfo.licensePlate);
  const [seats, setSeats] = useState(registrationData.vehicleInfo.seats);
  const [femaleAssistant, setFemaleAssistant] = useState(registrationData.vehicleInfo.femaleAssistant);

  const [frontView, setFrontView] = useState<ImagePicker.ImagePickerAsset | null>(registrationData.vehicleInfo.frontView);
  const [sideView, setSideView] = useState<ImagePicker.ImagePickerAsset | null>(registrationData.vehicleInfo.sideView);
  const [rearView, setRearView] = useState<ImagePicker.ImagePickerAsset | null>(registrationData.vehicleInfo.rearView);
  const [interiorView, setInteriorView] = useState<ImagePicker.ImagePickerAsset | null>(registrationData.vehicleInfo.interiorView);

  // Update context when form fields change
  useEffect(() => {
    updateVehicleInfo({
      vehicleType,
      vehicleBrand,
      vehicleModel,
      yearOfManufacture,
      vehicleColor,
      licensePlate,
      seats,
      femaleAssistant,
      frontView,
      sideView,
      rearView,
      interiorView,
    });
  }, [vehicleType, vehicleBrand, vehicleModel, yearOfManufacture, vehicleColor, licensePlate, seats, femaleAssistant, frontView, sideView, rearView, interiorView]);

  // Sync local state with context data
  useEffect(() => {
    setVehicleType(registrationData.vehicleInfo.vehicleType);
    setVehicleBrand(registrationData.vehicleInfo.vehicleBrand);
    setVehicleModel(registrationData.vehicleInfo.vehicleModel);
    setYearOfManufacture(registrationData.vehicleInfo.yearOfManufacture);
    setVehicleColor(registrationData.vehicleInfo.vehicleColor);
    setLicensePlate(registrationData.vehicleInfo.licensePlate);
    setSeats(registrationData.vehicleInfo.seats);
    setFemaleAssistant(registrationData.vehicleInfo.femaleAssistant);
    setFrontView(registrationData.vehicleInfo.frontView);
    setSideView(registrationData.vehicleInfo.sideView);
    setRearView(registrationData.vehicleInfo.rearView);
    setInteriorView(registrationData.vehicleInfo.interiorView);
  }, [registrationData.vehicleInfo]);

  const handleImageUpload = async (setImage: React.Dispatch<React.SetStateAction<ImagePicker.ImagePickerAsset | null>>) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleNext = () => {
    // Data is already saved in context, just navigate to next screen
    router.push('/(auth)/vehicle-doc');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="px-4 py-5 bg-brand-goldenYellow">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-4 top-5 z-10">
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white text-center">Vehicle Registration</Text>
        <Text className="text-sm text-white text-center">Register your vehicle in few simple steps</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6">
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-black mb-2">Vehicle Type *</Text>
            <TextInput className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Select your vehicle type"
              placeholderTextColor="#A0A0A0"
              value={vehicleType} onChangeText={setVehicleType} />
          </View>
          <View>
            <Text className="text-sm font-medium text-black mb-2">Vehicle Brand *</Text>
            <TextInput className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="e.g. Toyota, Honda"
              placeholderTextColor="#A0A0A0"
              value={vehicleBrand} onChangeText={setVehicleBrand} />
          </View>
          <View>
            <Text className="text-sm font-medium text-black mb-2">Vehicle Model *</Text>
            <TextInput className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="e.g. TownAce, Hiace"
              placeholderTextColor="#A0A0A0"
              value={vehicleModel} onChangeText={setVehicleModel} />
          </View>
          <View>
            <Text className="text-sm font-medium text-black mb-2">Year of Manufacture *</Text>
            <TextInput className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Select Year"
              placeholderTextColor="#A0A0A0"
              value={yearOfManufacture} onChangeText={setYearOfManufacture} />
          </View>
          <View>
            <Text className="text-sm font-medium text-black mb-2">Vehicle Color *</Text>
            <TextInput className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Type vehicle color"
              placeholderTextColor="#A0A0A0"
              value={vehicleColor} onChangeText={setVehicleColor} />
          </View>
          <View>
            <Text className="text-sm font-medium text-black mb-2">Vehicle Number (License Plate) *</Text>
            <TextInput className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="e.g. WP KJP - 2356"
              placeholderTextColor="#A0A0A0"
              value={licensePlate} onChangeText={setLicensePlate} />
          </View>

          <View>
            <Text className="text-sm font-medium text-black mb-2">Vehicle Photos</Text>
            <Text className="text-xs text-gray-500 mb-4">Upload clear photos of your vehicle</Text>
            <View className="flex-row flex-wrap justify-between">
              <PhotoUploadBox label="Front View" image={frontView} onUpload={() => handleImageUpload(setFrontView)} />
              <PhotoUploadBox label="Side View" image={sideView} onUpload={() => handleImageUpload(setSideView)} />
              <PhotoUploadBox label="Rear View" image={rearView} onUpload={() => handleImageUpload(setRearView)} />
              <PhotoUploadBox label="Interior" image={interiorView} onUpload={() => handleImageUpload(setInteriorView)} />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-black mb-2">Number of Passenger Seats *</Text>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity className="bg-brand-lightNavy p-3 rounded-lg" onPress={() => setSeats(s => Math.max(1, s - 1))}>
                <Icon name="Minus" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-lg font-bold">{seats}</Text>
              <TouchableOpacity className="bg-brand-lightNavy p-3 rounded-lg" onPress={() => setSeats(s => s + 1)}>
                <Icon name="Plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-black mb-2">Additional Services</Text>
            <View className="flex-row items-center">
              <TouchableOpacity className={`w-6 h-6 border-2 rounded justify-center  ${femaleAssistant ? 'bg-brand-deepNavy border-brand-neutralGray' : 'border-gray-300'}`} onPress={() => setFemaleAssistant(!femaleAssistant)}>
                {femaleAssistant && <Icon name="Check" size={16} color="white" />}
              </TouchableOpacity>
              <Text className="ml-2">Female Assistant Available</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="p-6">
        <TouchableOpacity className="bg-brand-goldenYellow py-4 rounded-lg items-center" onPress={handleNext}>
          <Text className="text-white text-lg font-bold">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}